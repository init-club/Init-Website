# next_steps.md — Task Status

Every bullet from `next_steps.md`, with status and what remains.

**Legend** — **Done**: finished and verified. **Partially done**: some of the
bullet shipped, the rest is blocked or scoped out. **Pending**: not started.

Last updated: 2026-08-26 (revised after live database verification).

---

## 1. Short-Term Focus

### A. Improve security around public forms

| # | Task | Status | Notes |
|---|------|--------|-------|
| A1 | Limit how often someone can submit a form | **Pending** | Blocked on a decision: rate limit per what window, keyed on what (IP / session / member). Note that a Vercel WAF rule covers the browser route but **not** direct PostgREST calls. |
| A2 | Limit the maximum size of a form submission | **Partially done** | Migration `0003` adds `CHECK (pg_column_size(answers) <= 65536)` — well above any real form. Adjust the number if that assumption is wrong. |
| A3 | Validate all submitted values on the server side, not only in React | **Partially done** | Migration `0003` moves respondent identity out of the client and into a `BEFORE INSERT` trigger. Remaining settings still need a decision: `open_at`, `close_at`, `require_auth`, `max_responses`, `allow_multiple_responses`. |
| A4 | Test what user / member / admin are each allowed to do | **Partially done** | The anonymous tier is now fully mapped (private security review). Member and admin tiers need a logged-in JWT, which means GitHub OAuth. |

### B. Check Supabase security rules

| # | Task | Status | Notes |
|---|------|--------|-------|
| B1 | Review RLS policies for every important table | **Done** | Reviewed against the live API rather than inferred from the migrations. RLS is enabled on every table. Findings and the hardening plan are held in the private security review; the first corrective migration is `supabase/migrations/0003_restrict_public_user_columns.sql`. |
| B2 | Check admin-only RPC functions verify the correct role | **Partially done** | The four form RPCs are correct: `SECURITY DEFINER`, pinned `search_path`, `is_admin()` guard. `is_admin()` itself is still unreadable — it lives in `pg_catalog`, which the REST API does not expose. **Needs `DATABASE_URL`.** |
| B3 | Confirm service-role keys and GitHub tokens are server-side only | **Done** | Verified: `.env` never committed, no secrets in `src/`, client uses the publishable key only, edge functions read from the Deno env. |
| B4 | Add repeatable security tests for public / member / admin | **Pending** | Same blocker as A4. |

### C. Check the working of Scroll

| # | Task | Status | Notes |
|---|------|--------|-------|
| C1 | Review scroll on all pages — phone, touchpad, mouse | **Done** | [04](04-scroll-behaviour.md). Root cause was a stale hand-copied Lenis stylesheet missing `[data-lenis-prevent]`; 17 nested containers tagged, touch made explicit, reduced-motion honoured. |
| C2 | Resolve the issue raised in GitHub | **Pending** | Blocked: the issue was not identified. C1 may already cover it — send the issue number and I will confirm rather than assume. |

### D. Leaderboard

| # | Task | Status | Notes |
|---|------|--------|-------|
| D1 | Review the leaderboard and fix its representation on phones | **Done** | [02](02-leaderboard-mobile.md). The podium's hard-coded `[2,1,3]` order made **the winner read second** in the single-column phone layout. |

### E. Loading

| # | Task | Status | Notes |
|---|------|--------|-------|
| E1 | Identify and fix the first-load GitHub sync loop | **Done** | [03](03-first-load-github-sync-loop.md). Two auth listeners raced; the loser flipped `isLoading` early, exposing a signed-in-with-no-profile state that `App.tsx` treats as a new user. |

### F. Finishing the "Under Construction" pages

| # | Task | Status | Notes |
|---|------|--------|-------|
| F1 | Complete the unfinished pages | **Pending** | Needs product input. `Events.tsx` (15 lines) and `Members.tsx` (17 lines) are stubs; `AdminDashboard.tsx:252` has a "Coming Soon" placeholder. |
| F2 | Revise the working of pages that are done | **Pending** | Needs a definition of "revised" — which pages, judged against what. |
| F3 | Centre the profile button dropdown on home | **Done** | [01](01-profile-dropdown-alignment.md). Also gained outside-click/Escape close and ARIA menu wiring. |

---

## 2. Long-Term Focus

### A. Add automated testing

| # | Task | Status | Notes |
|---|------|--------|-------|
| A1 | Unit tests for important helpers and business rules | **Done** | [06](06-unit-tests.md). Vitest + 62 tests over `formUtils` and `formDefinition`. |
| A2 | Database/RLS tests for permission rules | **Pending** | Needs a test Supabase project + service-role credentials. |
| A3 | End-to-end tests for critical flows | **Pending** | Needs a browser runner and a seeded account. Login goes through GitHub OAuth, so it needs a test OAuth app or a bypass — an auth decision. |

### B. Add CI/CD checks

| # | Task | Status | Notes |
|---|------|--------|-------|
| B1 | Run install, lint, type-check, build and tests in GitHub Actions | **Done** | [05](05-ci-and-lint-baseline.md). Required clearing 122 pre-existing lint errors first — a red gate is not a gate. |
| B2 | Block merges when critical checks fail | **Pending** | Repository setting, not code. Branch protection on `main` requiring the "Lint, type-check and build" check. Set it after the workflow has run once. |
| B3 | Keep deployment steps consistent between local and production | **Partially done** | Added an `npm run typecheck` script so CI and local run the same commands. Not confirmed: whether CI's Node 22 matches the version Vercel builds this project with. |

### C. Improve monitoring and logs

| # | Task | Status | Notes |
|---|------|--------|-------|
| C1 | Use structured logs for GitHub sync jobs | **Done** | [08](08-structured-sync-logging.md). One JSON object per line, dotted event names, both edge functions. |
| C2 | Give each sync run an ID | **Done** | `crypto.randomUUID()` per invocation, on every line and returned to the caller. |
| C3 | Track success, failure, retry count, records changed | **Done** | Counters in the closing `run.finished` line. GitHub 202-retries counted separately from errors so a slow run is not mistaken for a broken one. Partial failures now reported instead of returning a flat 200 "success". |
| C4 | Basic monitoring for important backend failures | **Pending** | Blocked on a destination — Discord webhook, email, or a monitoring service. The building blocks (stable event names, `outcome`, per-category error counts) are in place. |

### D. Make GitHub sync more reliable

| # | Task | Status | Notes |
|---|------|--------|-------|
| D1 | Make sync jobs safe to run more than once | **Pending** | Not worked on. Observed while auditing: both functions already upsert on a conflict key and `github-lookup-user` preserves existing `role`/`auth_user_id`, so they appear idempotent — but that was not tested. |
| D2 | Keep retry, rate-limit and partial-failure handling clear | **Partially done** | Retries and rate-limit headers are now logged and counted, and partial failures surface in the response. The retry/rate-limit **logic** itself was not changed — there is still no backoff on 5xx and no rate-limit pause. |
| D3 | Avoid unnecessary repeated API calls | **Pending** | Not investigated. |
| D4 | Consider background processing as usage grows | **Pending** | A judgment call about scale and infrastructure. |

### E. Improve database design and ownership

| # | Task | Status | Notes |
|---|------|--------|-------|
| E1 | Document what React, PostgreSQL functions and Edge Functions each own | **Pending** | Not started. `docs/DATABASE_AND_BACKEND.md` and `docs/EDGE_FUNCTIONS_AND_GITHUB_SYNC.md` partly cover it. |
| E2 | Keep a single source of truth for schema and database logic | **Pending** | **Now confirmed, not suspected**: RLS is enabled live on every table but appears in no migration, so the repo actively misleads — it led me to the wrong conclusion in the first audit pass. `is_admin()` and `get_my_status()` are likewise dashboard/script-only. Fixing it starts with `supabase db dump`. |
| E3 | Add indexes when real usage shows slow queries | **Pending** | Needs production query data. |
| E4 | Document backup and restore procedures | **Pending** | Depends on the Supabase plan and your operational preferences. |

### F. Improve frontend maintainability

| # | Task | Status | Notes |
|---|------|--------|-------|
| F1 | Keep shared UI components consistent | **Pending** | Not taken on as a task. |
| F2 | Move repeated business logic into reusable utilities | **Partially done** | A shared `useScrollLock` hook replaced three diverging inline copies and covered six modals that had none ([04](04-scroll-behaviour.md)). |
| F3 | Keep data fetching patterns consistent across pages | **Pending** | Not taken on. One symptom was fixed: `FormResponses` ignored its SWR errors and spun forever. |
| F4 | Reduce duplicated queries and duplicated state handling | **Partially done** | 51 unused bindings removed app-wide, dead `isSaving` state deleted, three scroll locks merged into one. No query-level deduplication. |

### G. Accessibility and mobile quality

| # | Task | Status | Notes |
|---|------|--------|-------|
| G1 | Test important pages with keyboard navigation | **Partially done** | [09](09-accessibility-pass.md). There was **no visible focus indicator at all** — added one. Still open: modals do not trap Tab, there is no skip-to-content link, and `EventsAdmin.tsx:362` nests a `<button>` inside a `<button>`. |
| G2 | Check form labels, focus states, button names, readable contrast | **Partially done** | Focus states and button names done (13 icon-only buttons named, 1 missing `alt` fixed). Contrast audited but **not changed** — three grey-on-black pairings fall short of WCAG AA, and fixing them means altering theme colours. `FormRenderer` labels not yet audited. |
| G3 | Test the dashboard and forms carefully on smaller screens | **Pending** | Only the leaderboard and home dropdown were reworked for mobile. The admin dashboard and form builder were not reviewed at small widths. |

---

## Tally

| Status | Count |
|---|---|
| **Done** | 11 |
| **Partially done** | 10 |
| **Pending** | 19 |
| | **40 bullets** |

Counted from the tables above, not by hand. "Partially done" is doing real work
here — several of those bullets are substantially complete and blocked only on a
decision or a credential, while others barely started. The Notes column says
which is which.

## Blockers, grouped

| What is blocking | Affects |
|---|---|
| The GitHub issue number/link | C2 |
| `DATABASE_URL` (function definitions live in `pg_catalog`, which REST cannot reach) | B2, E2, and running B4 |
| A decision from you (thresholds, policy changes, alert destination, contrast) | A1, A2, A3, C4 (long-term), G2 |
| A logged-in JWT / GitHub OAuth test account | A4 (member+admin tiers), B4, Long-term A2, A3 |
| Repository settings | Long-term B2 |
| Product input | F1, F2 |
