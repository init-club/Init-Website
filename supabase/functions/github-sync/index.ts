/**
 To people who handle this codebase in the future. This is a Supabase Edge Function (Deno runtime, not Node.js).
 It is triggered by a cron job to sync GitHub contribution data into the database. Read before touching anything.

 1) Organization Scope: This ONLY pulls repositories and contributions from the 'init-club' GitHub org.
    Personal repos or forks outside the org are completely ignored. The org name is hardcoded as 'orgName'.
    If the club ever renames its GitHub org, update that one variable.

 2) GitHub's 202 Accepted: The GitHub /stats/contributors endpoint is asynchronous. When GitHub hasn't computed
    stats yet, it returns 202 (Accepted) instead of 200. The 'ghFetch' helper automatically retries up to 3 times
    with a 1.5s delay. If all retries fail, it returns null and the repo is skipped gracefully.

 3) Weekly Bucket Aggregation: GitHub returns contributor stats as weekly buckets (Unix timestamps in seconds).
    Each week's timestamp ('week.w') is converted to a month/year pair. Commits for weeks in the same month are
    summed together. The resulting map key is "userId_year_month".

 4) Scoring Formula (as of this writing):
      - 1 point per commit ('week.c' from GitHub weekly stats)
      - 10 points per MERGED pull request (open/closed-unmerged PRs are ignored)
    If you change this formula, the leaderboard scores for all past months will NOT be recalculated automatically.
    You would need to write a migration or re-trigger the sync to recompute historical data.

 5) Current Month Initialization: Even if a user has zero activity this month, the sync force-inserts a row for
    them for the current month. This ensures they appear on the leaderboard even with no contributions yet.
    That's what the 'activePeriods.add(currentYear_currentMonth)' line does — do not remove it.

 6) Service Role Key: This function uses SUPABASE_SERVICE_ROLE_KEY (not the anon/publishable key) because it needs
    to write to tables that have RLS policies blocking public writes. Never expose this key to the frontend.

 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Authenticate Supabase and GitHub Clients
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        const GH_PAT = Deno.env.get('github_pat')

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GH_PAT) {
            throw new Error("Missing required environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, github_pat)")
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        const orgName = "init-club"

        console.log(`Starting GitHub Sync for org: ${orgName}`);

        // Helper to fetch from GitHub API with retry for 202 Accepted
        const ghFetch = async (endpoint: string, retries = 3): Promise<any> => {
            const res = await fetch(`https://api.github.com/${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${GH_PAT}`,
                    Accept: 'application/vnd.github+json',
                    'User-Agent': 'Supabase-Edge-Function'
                }
            })
            if (res.status === 202 && retries > 0) {
                console.log(`Received 202 for ${endpoint}. Retrying in 1.5s...`);
                await new Promise(resolve => setTimeout(resolve, 1500));
                return ghFetch(endpoint, retries - 1);
            }
            if (!res.ok) {
                console.error(`GitHub API error for ${endpoint}: ${res.status} ${res.statusText}`)
                return null;
            }
            const text = await res.text();
            if (!text) return null;
            try {
                return JSON.parse(text);
            } catch (err) {
                console.error(`JSON parse error for ${endpoint}:`, err);
                return null;
            }
        }

        // 2. Fetch all users from database to match GitHub IDs
        const { data: dbUsers, error: usersErr } = await supabase.from('users').select('id, username, github_id')
        if (usersErr) throw usersErr
        const userMap = new Map<number, string>() // github_id (number) -> user_id (uuid)
        dbUsers.forEach(u => {
            if (u.github_id) {
                userMap.set(Number(u.github_id), u.id)
            }
        })
        // 3. Initialize aggregators in memory
        // Key format: "${dbUserId}_${year}_${month}"
        const userCommitsMap = new Map<string, number>()
        const userPRsMap = new Map<string, number>()
        const activePeriods = new Set<string>() // Format: "year_month"

        // 4. Fetch all repositories of 'init-club' from GitHub
        const reposData = await ghFetch(`orgs/${orgName}/repos?per_page=100`)
        if (!reposData) throw new Error("Failed to fetch repositories from GitHub")

        console.log(`Found ${reposData.length} repositories in organization`);

        for (const repo of reposData) {
            // Upsert repository into DB
            const { error: repoErr } = await supabase.from('repositories').upsert({
                id: repo.id,
                github_repo_id: repo.id,
                name: repo.name,
                description: repo.description || "",
                html_url: repo.html_url,
                is_archived: repo.archived,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                pushed_at: repo.pushed_at,
                last_synced_at: new Date().toISOString(),
                topics: repo.topics || []
            }, {
                onConflict: 'id'
            })
            if (repoErr) console.error(`Error saving repo ${repo.name}:`, repoErr)

            // 5. Fetch and Sync Pull Requests for this repository
            const prsData = await ghFetch(`repos/${orgName}/${repo.name}/pulls?state=all&per_page=100`)
            if (prsData && Array.isArray(prsData)) {
                for (const pr of prsData) {
                    if (!pr.user || !pr.user.id) continue;
                    const prAuthorGithubId = Number(pr.user.id)
                    const prAuthorId = userMap.get(prAuthorGithubId)

                    // Only sync PR if the author is a registered member in our users table
                    if (prAuthorId) {
                        const { error: prErr } = await supabase.from('pull_requests').upsert({
                            github_pr_id: pr.id,
                            repo_id: repo.id,
                            author_id: prAuthorId,
                            title: pr.title,
                            state: pr.state,
                            merged_at: pr.merged_at,
                            created_at: pr.created_at
                        }, {
                            onConflict: 'github_pr_id'
                        })
                        if (prErr) console.error(`Error saving PR #${pr.number} for ${repo.name}:`, prErr)

                        // Only count merged PRs towards contribution stats, assigned to the merge month/year
                        if (pr.merged_at) {
                            const mergeDate = new Date(pr.merged_at)
                            const prYear = mergeDate.getFullYear()
                            const prMonth = mergeDate.getMonth() + 1

                            const key = `${prAuthorId}_${prYear}_${prMonth}`
                            userPRsMap.set(key, (userPRsMap.get(key) || 0) + 1)
                            activePeriods.add(`${prYear}_${prMonth}`)
                        }
                    }
                }
            }

            // 6. Fetch and Sync Contribution Statistics (Commits)
            const statsData = await ghFetch(`repos/${orgName}/${repo.name}/stats/contributors`)
            if (statsData && Array.isArray(statsData)) {
                for (const contributor of statsData) {
                    if (!contributor.author || !contributor.author.id) continue;
                    const contributorGithubId = Number(contributor.author.id)
                    const dbUserId = userMap.get(contributorGithubId)

                    if (dbUserId) {
                        const commitCount = contributor.total || 0

                        // Sync to the user_repositories junction table
                        const { error: juncErr } = await supabase.from('user_repositories').upsert({
                            user_id: dbUserId,
                            repository_id: repo.id,
                            contributions_count: commitCount,
                            last_contribution_at: new Date().toISOString()
                        }, {
                            onConflict: 'user_id,repository_id'
                        })
                        if (juncErr) console.error(`Error saving user_repository mapping for ${contributor.author.login}:`, juncErr)

                        // Loop through weekly commit buckets to aggregate by month/year
                        if (contributor.weeks && Array.isArray(contributor.weeks)) {
                            for (const week of contributor.weeks) {
                                const weekCommits = week.c || 0
                                if (weekCommits > 0) {
                                    // Parse start of week timestamp (in seconds from github)
                                    const weekDate = new Date(week.w * 1000)
                                    const weekYear = weekDate.getFullYear()
                                    const weekMonth = weekDate.getMonth() + 1

                                    const key = `${dbUserId}_${weekYear}_${weekMonth}`
                                    userCommitsMap.set(key, (userCommitsMap.get(key) || 0) + weekCommits)
                                    activePeriods.add(`${weekYear}_${weekMonth}`)
                                }
                            }
                        }
                    }
                }
            }
        }

        // 7. Write Consolidated Stats & Scores for all registered users across all active periods
        const currentMonth = new Date().getMonth() + 1
        const currentYear = new Date().getFullYear()
        activePeriods.add(`${currentYear}_${currentMonth}`)

        for (const period of activePeriods) {
            const [yearStr, monthStr] = period.split('_')
            const year = Number(yearStr)
            const month = Number(monthStr)

            for (const [_, dbUserId] of userMap.entries()) {
                const key = `${dbUserId}_${year}_${month}`
                const totalCommits = userCommitsMap.get(key) || 0
                const totalPRs = userPRsMap.get(key) || 0

                // Only write row if there is active data OR if it's the current month (to initialize leaderboard)
                if (totalCommits > 0 || totalPRs > 0 || (year === currentYear && month === currentMonth)) {
                    // Formula: 1 point per commit + 10 points per PR
                    const calculatedScore = (totalCommits * 1) + (totalPRs * 10)

                    const { error: statsErr } = await supabase.from('contribution_stats').upsert({
                        user_id: dbUserId,
                        month,
                        year,
                        commit_count: totalCommits,
                        pr_count: totalPRs,
                        score: calculatedScore,
                        last_updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'user_id,month,year'
                    })
                    if (statsErr) console.error(`Error saving consolidated stats for user ${dbUserId} for ${month}/${year}:`, statsErr)
                }
            }
        }

        return new Response(
            JSON.stringify({ message: "GitHub synchronization completed successfully." }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})
