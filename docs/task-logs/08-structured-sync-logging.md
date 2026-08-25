# 08 — Structured logging and run IDs for the GitHub sync

**Source:** `next_steps.md` → Long-Term Focus → C. Improve monitoring and logs
> "Use structured logs for GitHub sync jobs. Give each sync run an ID so
> problems can be traced easily. Track success, failure, retry count, and number
> of records changed. Add basic monitoring for important backend failures."

**Status:** the first three bullets are done. The fourth — alerting — needs a
destination (email, Discord webhook, a monitoring service) that is yours to
choose. See "Left for you".

**Files touched:** new `supabase/functions/_shared/logger.ts`,
`supabase/functions/github-sync/index.ts`,
`supabase/functions/github-lookup-user/index.ts`,
`src/pages/admin/AdminDashboard.tsx`.

## What was wrong

Both edge functions logged with interpolated strings:

```ts
console.log(`Starting GitHub Sync for org: ${orgName}`);
console.error(`Error saving repo ${repo.name}:`, repoErr)
console.log(`Received 202 for ${endpoint}. Retrying in 1.5s...`);
```

Three problems with that, in ascending order of importance:

1. **Not queryable.** Supabase's log explorer can filter on JSON fields. It
   cannot usefully filter on a sentence. Finding every repo failure meant
   grepping for the English phrase "Error saving repo".
2. **No correlation.** `github-sync` runs hourly on a cron. All runs' lines land
   in the same stream, interleaved with `github-lookup-user` firing on every new
   login. Nothing tied a line to the invocation that produced it, so
   reconstructing a single failed run meant guessing from timestamps.
3. **Failures were invisible to the caller.** The important one. Look at the
   old return path:

   ```ts
   if (repoErr) console.error(`Error saving repo ${repo.name}:`, repoErr)
   // ... loop continues ...
   return new Response(JSON.stringify({ message: "GitHub synchronization completed successfully." }), { status: 200 })
   ```

   Individual repos, PRs and stats rows could all fail to save and the function
   still returned **200 "completed successfully"**. The admin dashboard showed a
   green toast. The only trace was a `console.error` nobody was reading. A sync
   that silently wrote nothing was indistinguishable from one that worked.

## The logger

`supabase/functions/_shared/logger.ts` — `_shared` is the Supabase convention
for a module bundled into sibling functions.

`createRunLogger(fn)` mints a `crypto.randomUUID()` per invocation and emits one
JSON object per line:

```json
{"ts":"2026-08-26T…","level":"error","fn":"github-sync","run_id":"a3f…","event":"repo.upsert_failed","repo":"init-website","db_error":"…"}
```

Which makes a whole run retrievable with one filter:

```sql
select * from edge_logs where json_extract(body, '$.run_id') = 'a3f…'
```

Event names are dotted and stable (`sync.start`, `github.retry`,
`repo.upsert_failed`, `stats.upsert_failed`, `run.finished`) so they can be
counted and alerted on without parsing prose.

It also carries counters. `run.count('repos_upserted')` increments a tally, and
`run.finish(outcome)` emits a closing `run.finished` line with the elapsed
duration and the full snapshot:

```json
{"event":"run.finished","run_id":"a3f…","outcome":"ok","duration_ms":48213,
 "counters":{"github_requests":47,"github_202_retries":3,"repos_seen":12,
             "repos_upserted":12,"prs_upserted":83,"stats_upserted":31,"repo_errors":0}}
```

That single line answers the task item's "success, failure, retry count, and
number of records changed" without reading anything else.

`describeError(err)` handles the `catch (err: unknown)` case — an `Error`
interpolated into a template string renders as `[object Object]`, which is
exactly when you most want the message and stack.

## What is tracked

| counter | meaning |
|---|---|
| `github_requests` | total GitHub API calls |
| `github_202_retries` | GitHub still computing contributor stats — slow, not broken |
| `github_errors` | non-OK responses and JSON parse failures |
| `repos_seen` / `repos_upserted` / `repo_errors` | repository sync |
| `prs_upserted` / `pr_errors` / `prs_skipped_self_merged` | pull request sync |
| `contributor_links_upserted` / `contributor_link_errors` | user↔repo mapping |
| `stats_upserted` / `stats_errors` | the contribution rows the leaderboard reads |

The GitHub failure log now also captures `x-ratelimit-remaining` and
`x-ratelimit-reset`, because rate limiting is the first thing to check when a
sync starts failing in bulk.

`github_202_retries` is deliberately separated from `github_errors`. GitHub's
`/stats/contributors` endpoint returns 202 while it computes, and the existing
retry helper handles it — a run with a high retry count is a slow run, not a
broken one, and conflating the two would produce false alarms.

## Partial failures are now reported

The success path checks its own counters before claiming success:

```ts
const summary = run.finish('ok');
const failed = Object.entries(summary.counters)
    .filter(([name]) => name.endsWith('_errors'))
    .reduce((total, [, value]) => total + value, 0);

return new Response(JSON.stringify({
    message: failed === 0
        ? "GitHub synchronization completed successfully."
        : `GitHub synchronization completed with ${failed} record failure(s).`,
    ...summary,
}), { status: 200 });
```

The `_errors` suffix convention means new counters are picked up automatically
rather than needing to be added to a list.

The run id and counters go into the response body, so `AdminDashboard`'s manual
sync now shows the real message instead of a hard-coded "synced successfully",
and logs the full summary to the browser console. An admin reporting "the sync
looked wrong" can now quote a run id.

`github-lookup-user` got the same treatment, plus a `users_created` /
`users_updated` distinction and an explicit log line for the pending-membership
case — which was previously a `console.log` under a comment that read *"Optional:
Decide if pending members are allowed. For now, strict check? Let's allow them
but log it. Or maybe not."* The behaviour is unchanged (pending members are let
through) but it is now recorded, so the decision can be revisited against real
data.

## What did NOT change

No sync logic, no scoring formula, no API call pattern, no database write. This
change is observability only — every code path does exactly what it did before.

## Left for you

**Alerting** (the item's fourth bullet) needs a destination. The building blocks
are in place: every failure emits `level: "error"` with a stable `event` name,
and `run.finished` carries `outcome` and per-category error counts. What is
missing is a decision on where an alert should go — a Discord webhook into the
club server would be the obvious fit given there is already a Discord link on
the site, but that is a choice, not a default. Tell me which and I will wire it.

Also worth considering once you look at real data: whether a run with
`stats_errors > 0` should return 500 rather than 200. Right now it returns 200
with an honest message. Making it non-200 would let a cron monitor catch it
without inspecting the body, at the cost of retrying work that mostly succeeded.

## Verification

- `npm run lint` — 0 errors.
- `npm run build`, `npm test` (62 passing) — both pass.
- `grep -c "console\." ` on both edge functions → 0; every call site was
  converted, none were missed.

The functions themselves were not executed — that needs a deploy and a GitHub
PAT.
