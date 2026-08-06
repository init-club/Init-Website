# Supabase Edge Functions and GitHub Synchronization Engine

## 1. Overview of Supabase Edge Functions on Deno Runtime

Supabase Edge Functions are serverless TypeScript and JavaScript functions executed globally at the edge on the Deno runtime. Unlike traditional Node.js serverless environments, Edge Functions leverage the V8 JavaScript engine managed by Deno, providing lightweight execution, minimal cold-start latency, and native support for Web standard APIs.

### Key Architectural Characteristics

- **Deno Runtime Engine**: Edge functions are executed in isolated Deno worker environments rather than Node.js runtimes. Module dependencies are imported directly via HTTPS URL specifiers (such as `https://esm.sh/@supabase/supabase-js@2`) without requiring a local `node_modules` directory or bundle step.
- **Web Standard APIs**: Global objects standard to browser environments (such as `fetch`, `Request`, `Response`, `Headers`, and `URL`) are natively available.
- **Environment Management**: System environment secrets are retrieved using `Deno.env.get('SECRET_NAME')` instead of Node's `process.env`.
- **HTTP Server Handler**: Edge Functions register request handlers using the standard `Deno.serve(async (req) => Response)` entry point.
- **Elevated Privilege Execution**: Edge Functions serve as a secure backend layer to execute database operations using the `SUPABASE_SERVICE_ROLE_KEY`. This key bypasses Row Level Security (RLS) policies to allow automated batch writes and privileged queries that must never be exposed to client-side applications.

Within the `Init-Website` architecture, Edge Functions handle GitHub Organization validation, user whitelisting, and automated contribution metric syncs across the `init-club` organization.

---

## 2. `github-lookup-user` Function

### Purpose and Activation Triggers

The `github-lookup-user` Edge Function validates whether a target GitHub user is an active member of the `init-club` GitHub organization. Upon successful verification, the function upserts the user into the `users` database table, effectively whitelisting them for account creation and membership access.

#### Activation Triggers
- **Admin Dashboard Invocation**: Triggered interactively by administrative users through the Member Management panel (`/admin/members`) when manually adding GitHub usernames to the whitelist repository.
- **Programmatic HTTP API Call**: Executed via POST requests to the Edge Function endpoint:
  ```http
  POST /functions/v1/github-lookup-user HTTP/1.1
  Content-Type: application/json
  ```

### GitHub API Request Format

The function validates organization membership by querying the GitHub REST API using a dedicated Personal Access Token (PAT).

```http
GET https://api.github.com/orgs/init-club/memberships/{username} HTTP/1.1
Authorization: Bearer <github_pat>
Accept: application/vnd.github+json
```

#### Verification Steps
1. The function extracts `github_username` from the incoming JSON payload.
2. It constructs the organization membership URL targeting `orgs/init-club/memberships/${github_username}`.
3. The request is dispatched with the `github_pat` bearer token.
4. If the response status is not HTTP 200 (e.g., HTTP 404 or HTTP 403), the function rejects the user and returns an unauthorized status payload.

### Service Role Database Upsert Workflow and Role Assignment

When GitHub confirms membership, the function extracts the user object from the membership response payload (`membershipData.user`) and initializes the Supabase client using the Service Role Key.

```typescript
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
```

The function executes an upsert query against the `users` table, resolving conflicts on the `github_id` column:

| Column | Value Mapping / Source |
| :--- | :--- |
| `github_id` | `userDetails.id` (Numeric GitHub user ID) |
| `username` | `userDetails.login` |
| `name` | `userDetails.name || userDetails.login` (Fallback if display name is null) |
| `avatar_url` | `userDetails.avatar_url` |
| `role` | `'member'` (Default role assignment) |
| `is_active` | `true` |
| `last_seen_at` | Current ISO timestamp (`new Date().toISOString()`) |

#### Conflict Strategy
- Target Column: `github_id`
- Action: If the user already exists in the `users` table, their metadata (`name`, `avatar_url`, `username`, `last_seen_at`) is updated while preserving their unique UUID `id`, assigned `role`, and linked `auth_user_id`.

### Error Handling and HTTP Status Codes

The function adheres to standard REST error handling practices:

| HTTP Status | Condition | Response Payload |
| :--- | :--- | :--- |
| `200 OK` | User successfully verified and whitelisted | `{"message": "User {github_username} successfully whitelisted."}` |
| `200 OK` (OPTIONS) | CORS preflight request | Text response `'ok'` with CORS headers |
| `403 Forbidden` | User not found in `init-club` organization or inactive | `{"error": "User not in organization"}` |
| `500 Internal Server Error` | Missing `github_username`, missing env variables (`github_pat`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`), or DB query failure | `{"error": "<error_message>"}` |

---

## 3. `github-sync` Function

### Overview

The `github-sync` Edge Function is an automated synchronization worker designed to fetch repositories, pull requests, and contribution activity from the `init-club` GitHub organization and aggregate contribution metrics for registered members into the database.

### Repository Synchronization Workflow

The sync process scans all public and internal repositories owned by the `init-club` organization.

1. **Repository Fetching**: Sends a GET request to `https://api.github.com/orgs/init-club/repos?per_page=100`.
2. **Metadata Extraction & Database Upsert**: For each repository returned, the function extracts metadata and upserts a row into the `repositories` table:
   - `id`: `repo.id` (Primary Key)
   - `github_repo_id`: `repo.id`
   - `name`: `repo.name`
   - `description`: `repo.description || ""`
   - `html_url`: `repo.html_url`
   - `is_archived`: `repo.archived`
   - `stars`: `repo.stargazers_count`
   - `forks`: `repo.forks_count`
   - `pushed_at`: `repo.pushed_at`
   - `last_synced_at`: Current ISO timestamp
   - `topics`: `repo.topics || []`
3. **Conflict Resolution**: Uses `onConflict: 'id'` to update existing repository records.

### Pull Request Synchronization and Author Mapping

For each repository in the organization, the function retrieves all associated pull requests:

```http
GET https://api.github.com/repos/init-club/{repo_name}/pulls?state=all&per_page=100
```

#### Internal UUID Author Mapping Algorithm
1. Prior to iterating repositories, the function queries all database users:
   ```typescript
   supabase.from('users').select('id, username, github_id')
   ```
2. It builds an in-memory hash map linking numeric `github_id` keys to internal Supabase `id` UUID values:
   `userMap: Map<number, string>` (GitHub ID to User UUID).
3. For each PR retrieved:
   - If `pr.user.id` exists in `userMap`, the function resolves the internal user UUID (`author_id`).
   - The PR record is upserted into the `pull_requests` table:
     - `github_pr_id`: `pr.id` (Unique key)
     - `repo_id`: `repo.id`
     - `author_id`: Resolved user UUID
     - `title`: `pr.title`
     - `state`: `pr.state` (`open`, `closed`)
     - `merged_at`: `pr.merged_at`
     - `created_at`: `pr.created_at`

#### Merged Pull Request Aggregation
- Open or unmerged closed PRs are persisted in the `pull_requests` table for tracking, but ignored for contribution scoring.
- If `pr.merged_at` is present:
  - The function parses the merge timestamp to derive the calendar year (`prYear`) and 1-indexed month (`prMonth`).
  - Increments the PR count for key `${author_id}_${prYear}_${prMonth}` in `userPRsMap`.
  - Registers `${prYear}_${prMonth}` in the `activePeriods` set.

### Weekly Commit Activity Bucket Processing and Calendar Month Aggregation

GitHub returns repository commit history aggregated into weekly contributor statistics via the following REST endpoint:

```http
GET https://api.github.com/repos/init-club/{repo_name}/stats/contributors
```

#### Data Model and Bucket Schema
GitHub returns an array of contributor objects containing:
- `author.id`: Numeric GitHub ID of the contributor.
- `total`: Total commit count across the lifetime of the repository.
- `weeks`: An array of weekly bucket objects structured as:
  - `w`: Unix timestamp (in seconds) representing midnight UTC on Sunday of that week.
  - `a`: Number of additions.
  - `d`: Number of deletions.
  - `c`: Commit count during that week.

#### Processing Algorithm
1. **User Repository Mapping**:
   - The function updates the `user_repositories` junction table for each matched contributor, storing total contributions per repository (`user_id`, `repository_id`, `contributions_count`, `last_contribution_at`).
2. **Calendar Month Aggregation**:
   - The function iterates through the `weeks` array.
   - For any week where `week.c > 0`:
     - Converts Unix timestamp `week.w` (seconds) to milliseconds (`week.w * 1000`) and constructs a JavaScript `Date` object.
     - Extracts the calendar year (`weekDate.getFullYear()`) and 1-indexed month (`weekDate.getMonth() + 1`).
     - Aggregates commits into the in-memory map `userCommitsMap` under key `${dbUserId}_${weekYear}_${weekMonth}`.
     - Adds `${weekYear}_${weekMonth}` to `activePeriods`.

### Leaderboard Scoring Formula

Contribution statistics are consolidated per user per month into the `contribution_stats` database table.

#### Formula Definition

$$\text{Calculated Base Score} = (\text{Commits} \times 1) + (\text{Merged PRs} \times 10)$$

$$\text{Total Monthly Score} = \text{Calculated Base Score} + \text{Adjustment}$$

Where:
- **Commits**: Total commit count (`commit_count`) aggregated from weekly commit buckets for that month.
- **Merged PRs**: Total merged pull request count (`pr_count`) for that month.
- **Adjustment**: Manual point override (`score_adjustment`) assigned by administrative staff (e.g., bonus points for event participation or penalties).

#### Database Persistence & Upsert Workflow
For every combination of active period (`year_month`) and registered user, the function executes an upsert to `contribution_stats`:

```typescript
supabase.from('contribution_stats').upsert({
    user_id: dbUserId,
    month: month,
    year: year,
    commit_count: totalCommits,
    pr_count: totalPRs,
    score: calculatedScore,
    last_updated_at: new Date().toISOString()
}, {
    onConflict: 'user_id,month,year'
})
```

#### Current Month Initialization Guarantee
To ensure all registered organization members appear on the monthly leaderboard (even if they have zero commits or PRs in the current period), the function explicitly injects the current year and month into `activePeriods`:

```typescript
const currentMonth = new Date().getMonth() + 1
const currentYear = new Date().getFullYear()
activePeriods.add(`${currentYear}_${currentMonth}`)
```

#### All-Time Score Aggregation
The leaderboard displays total all-time scores by reducing across all monthly rows for a given user in client applications:

$$\text{All-Time Score} = \sum_{\text{all rows}} \text{Monthly Score}$$

### Asynchronous GitHub API Retry Mechanism (HTTP 202 Accepted)

GitHub defers the calculation of repository contributor statistics. When statistics are not cached when requested, the GitHub API responds with `HTTP 202 Accepted` alongside an empty payload, indicating that background computation has started.

#### Retry Mechanism Implementation
The function uses an exponential/polled retry wrapper (`ghFetch`):

```typescript
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
        console.error(`GitHub API error for ${endpoint}: ${res.status} ${res.statusText}`);
        return null;
    }
    
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
}
```

#### Behavior & Resilience
- If GitHub returns `202 Accepted`, `ghFetch` pauses execution for 1.5 seconds (`1500ms`) and retries up to 3 times.
- If stats are returned on subsequent attempts, processing continues normally.
- If all retries are exhausted without returning HTTP 200, `ghFetch` logs the occurrence and gracefully returns `null`, ensuring the rest of the sync pipeline proceeds without terminating the function.

### Service Role Security Model

The `github-sync` function runs as a background service worker using the elevated `SUPABASE_SERVICE_ROLE_KEY`.

- **RLS Bypass**: Standard Row Level Security (RLS) rules prevent public write access to tables such as `repositories`, `pull_requests`, `user_repositories`, and `contribution_stats`. The Service Role key grants full administrative privileges to mutate these records.
- **Isolation**: The `SUPABASE_SERVICE_ROLE_KEY` and `github_pat` environment variables reside exclusively in the serverless Edge Function environment and are never bundled or transmitted to the client frontend.

---

## 4. Setup, Secrets Configuration, and Deployment Guide

### Required Environment Secrets

The following environment variables must be configured in the Supabase project for Edge Functions to operate:

| Secret Name | Description | Example / Format |
| :--- | :--- | :--- |
| `SUPABASE_URL` | The API gateway URL of your Supabase project | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin service role secret key (bypasses RLS) | `eyJhbGciOi...` |
| `github_pat` | GitHub Personal Access Token with org and repo read scopes | `ghp_...` or `github_pat_...` |

### Setting Environment Secrets via Supabase CLI

Secrets can be set globally for all Edge Functions using the Supabase CLI:

```bash
# Set individual environment secrets
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key --project-ref your_project_ref
supabase secrets set github_pat=your_github_personal_access_token --project-ref your_project_ref
```

Alternatively, secrets can be configured via the Supabase Dashboard:
1. Navigate to **Project Settings** > **Functions**.
2. Under **Secrets**, click **Add New Secret**.
3. Add `github_pat` and `SUPABASE_SERVICE_ROLE_KEY`.

### Local Development and Testing

#### 1. Create Local Secret File
Create `./supabase/functions/.env` (do not commit this file):

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key
github_pat=your_github_pat
```

#### 2. Start Functions Locally
Run local function servers with hot-reloading enabled:

```bash
supabase functions serve --env-file ./supabase/functions/.env
```

#### 3. Test Endpoint Invocations Locally

Test `github-lookup-user`:
```bash
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/github-lookup-user' \
  --header 'Content-Type: application/json' \
  --data '{"github_username": "octocat"}'
```

Test `github-sync`:
```bash
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/github-sync' \
  --header 'Content-Type: application/json'
```

### CLI Deployment Commands

Deploy Edge Functions to your remote Supabase production project using the Supabase CLI:

```bash
# Deploy github-lookup-user function
supabase functions deploy github-lookup-user --project-ref your_project_ref

# Deploy github-sync function
supabase functions deploy github-sync --project-ref your_project_ref
```

### Automated Scheduling of `github-sync` via pg_cron and pg_net

To keep contribution leaderboards up-to-date automatically, trigger the `github-sync` function periodically using the `pg_cron` and `pg_net` PostgreSQL extensions in Supabase.

#### SQL Migration Script for Automated Cron Trigger

Execute the following SQL block in your Supabase SQL Editor or include it in a migration file:

```sql
-- Enable required extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Schedule github-sync to run hourly on the hour
select cron.schedule(
  'github-sync-hourly-job',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/github-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    )
  );
  $$
);
```

If `app.settings.service_role_key` is not set in Postgres settings, insert the literal service role key into the header string:

```sql
select cron.schedule(
  'github-sync-hourly-job',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/github-sync',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```
