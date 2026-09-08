import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createRunLogger, describeError } from '../_shared/logger.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GITHUB_USERNAME_REGEX =
  /^(?!-)(?!.*-$)[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;

const isValidGitHubUsername = (
  value: unknown
): value is string => {
  if (typeof value !== 'string') {
    return false;
  }

  const username = value.trim();

  return (
    username.length >= 1 &&
    username.length <= 39 &&
    GITHUB_USERNAME_REGEX.test(username)
  );
};

Deno.serve(async (req) => {
    const run = createRunLogger('github-lookup-user');

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { github_username: rawGithubUsername } =
        await req.json();

        if (!isValidGitHubUsername(rawGithubUsername)) {
            return new Response(
                JSON.stringify({
                    error: 'Invalid GitHub username',
                }),
                {
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                    status: 400,
                }
            );
        }

        const github_username =
            rawGithubUsername.trim();

        run.info('lookup.start', { github_username })

        // 1. Verify GitHub Membership
        // Using the GitHub API to check membership in 'init-club'
        const GH_PAT = Deno.env.get('github_pat')
        if (!GH_PAT) throw new Error("Missing 'github_pat' environment variable")

        const ghRes = await fetch(
                `https://api.github.com/orgs/init-club/memberships/${encodeURIComponent(github_username)}`,
                {
                    headers: {
                        Authorization: `Bearer ${GH_PAT}`,
                        Accept: 'application/vnd.github+json'
                    }
                }
            );

        if (!ghRes.ok) {
            run.count('membership_rejected')
            run.warn('membership.not_found', {
                github_username,
                status: ghRes.status,
                rate_limit_remaining: ghRes.headers.get('x-ratelimit-remaining'),
            })
            const summary = run.finish('ok', { result: 'not_in_org' })
            return new Response(JSON.stringify({ error: "User not in organization", ...summary }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 403,
            })
        }

        const membershipData = await ghRes.json()
        // Check if state is active (not pending) - though usually strictly being in the list is enough
        const returnedLogin =
                membershipData?.user?.login;

            if (
                typeof returnedLogin !== 'string' ||
                returnedLogin.toLowerCase() !==
                    github_username.toLowerCase()
            ) {
                run.warn('membership.identity_mismatch', {
                    requested_username: github_username,
                    returned_username: returnedLogin ?? null,
                });

                return new Response(
                    JSON.stringify({
                        error: 'GitHub identity verification failed',
                    }),
                    {
                        headers: {
                            ...corsHeaders,
                            'Content-Type': 'application/json',
                        },
                        status: 403,
                    }
                );
}
        if (membershipData.state !== 'active') {
            run.count('membership_rejected');

            run.warn('membership.not_active', {
                github_username,
                state: membershipData.state,
            });

            return new Response(
                JSON.stringify({
                    error: 'GitHub organization membership is not active',
                }),
                {
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                    status: 403,
                }
            );
        }

        // 2. Fetch User Details to get ID/Avatar (The membership endpoint gives user object)
        const userDetails = membershipData.user;

        // 3. Add to Supabase Whitelist
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Missing Supabase environment variables")
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Check if user already exists to preserve custom roles (e.g. 'admin')
        const { data: existingUser } = await supabase
            .from('users')
            .select('role, auth_user_id')
            .eq('github_id', userDetails.id)
            .maybeSingle()

        const { error: upsertError } = await supabase.from('users').upsert({
            github_id: userDetails.id,
            username: userDetails.login,
            name: userDetails.name || userDetails.login, // Fallback to handle if name is null
            avatar_url: userDetails.avatar_url,
            role: existingUser?.role || 'member',     // Preserve existing role (e.g., 'admin')
            auth_user_id: existingUser?.auth_user_id || null,
            is_active: true,
            last_seen_at: new Date().toISOString()
        }, {
            onConflict: 'github_id'
        })

        if (upsertError) {
            run.count('upsert_errors')
            throw upsertError
        }

        run.count(existingUser ? 'users_updated' : 'users_created')
        const summary = run.finish('ok', {
            github_username,
            preserved_role: existingUser?.role ?? null,
        })

        return new Response(
            JSON.stringify({ message: `User ${github_username} successfully whitelisted.`, ...summary }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        run.error('lookup.failed', describeError(error))
        const summary = run.finish('error')

        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : String(error),
                ...summary,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})
