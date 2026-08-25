# Task Logs

One document per task from `next_steps.md`: what was wrong, what changed, and
how it was verified. Numbered in the order the work was done.

| # | Task | Source item | Status |
|---|------|-------------|--------|
| [01](01-profile-dropdown-alignment.md) | Profile dropdown alignment | Short-Term F | Complete |
| [02](02-leaderboard-mobile.md) | Leaderboard on phones | Short-Term D | Complete |
| [03](03-first-load-github-sync-loop.md) | Spurious GitHub sync on first load | Short-Term E | Complete |
| [04](04-scroll-behaviour.md) | Scroll behaviour | Short-Term C | Partial |
| [05](05-ci-and-lint-baseline.md) | CI checks + lint baseline cleanup | Long-Term B | Partial |
| [06](06-unit-tests.md) | Unit tests for the form engine | Long-Term A | Partial |
| [08](08-structured-sync-logging.md) | Structured sync logging + run IDs | Long-Term C | Partial |
| [09](09-accessibility-pass.md) | Accessibility: focus, names, alt text | Long-Term G | Partial |

## What is blocked, and on what

Everything below was deliberately left alone. Each entry says what is needed to
unblock it.

### Needs information

- **The GitHub issue referenced under Short-Term C.** Task 04 fixed the
  code-visible scroll defects, but the specific reported issue was not
  identified. → *Issue number or link.*
- **Live RLS state.** Reviewed; findings are held in the private security
  review rather than in this public repo until the corrective migrations
  are applied.
- **`is_admin()`.** Every RLS policy and RPC guard depends on it; it is not in
  version control. → *Its live definition, or a schema dump.*

### Needs a decision

- **Form security thresholds** (Short-Term A). Rate limit per what window and
  keyed on what; maximum payload size. Server-side enforcement is designed in
  the private security review findings 1, 2 and 7 but not implemented.
- **RLS policy changes** (Short-Term B). Tightening a live policy can lock
  members out. Fixes are written out in the private security review; applying them is your call.
- **Alert destination** (Long-Term C). Structured logs and run IDs are in place;
  where a failure alert should go is not decided.
- **Contrast** (Long-Term G). Three grey-on-black pairings fall short of WCAG
  AA. Fixing them means changing theme colours.

### Needs credentials or repo permissions

- **Branch protection** (Long-Term B). The CI workflow reports status but cannot
  block merges; that is a repository setting.
- **RLS and end-to-end tests** (Long-Term A, Short-Term B). Both need a
  throwaway Supabase project and service-role credentials. E2E login goes
  through GitHub OAuth, which needs a test app or a bypass.

### Needs product input

- **The unfinished pages** (Short-Term F). `Events.tsx` (15 lines) and
  `Members.tsx` (17 lines) are stubs, and `AdminDashboard.tsx:252` has a "Coming
  Soon" placeholder. The dropdown half of that item is done (task 01).

## Not attempted

Long-Term D (sync reliability beyond logging), E (schema ownership and backup
docs) and F (frontend maintainability) were not taken on as tasks, though tasks
04 and 05 chip at F — a shared `useScrollLock` hook replaced three diverging
inline copies, and dead code was cleared app-wide.
