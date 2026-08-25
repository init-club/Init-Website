# 05 — CI checks, and the lint cleanup needed to make them meaningful

**Source:** `next_steps.md` → Long-Term Focus → B. Add CI/CD checks
> "Run install, lint, type-check, build, and tests automatically in GitHub
> Actions. Block merges when critical checks fail. Keep deployment steps
> consistent between local development and production."

**Files touched:** new `.github/workflows/ci.yml`, `package.json`,
`eslint.config.js`, plus lint fixes across ~20 source files.

## Why this was two jobs, not one

A workflow that runs `npm run lint` is worthless if lint is already red — every
PR goes red on day one, the signal gets ignored, and "block merges when critical
checks fail" becomes unenforceable. The starting state was:

```
 58  @typescript-eslint/no-explicit-any
 51  @typescript-eslint/no-unused-vars
  8  react-hooks/set-state-in-effect
  5  react-hooks/exhaustive-deps      (already warnings)
  3  react-refresh/only-export-components
  1  @typescript-eslint/no-explicit-any → prefer-const
  1  "Cannot access variable before it is declared"
```

122 errors. So the lint baseline had to be cleared first.

## Part 1 — clearing the baseline

### Unused variables (51 → 0)

41 were unused imports, removed mechanically by a script driven off
`eslint --format json` (re-running to a fixed point, editing highest line/column
first so earlier edits don't shift later offsets). Three files needed hand
repair afterwards where the removal emptied an entire import statement or left a
dangling comma inside a multi-line specifier list — caught immediately by
`tsc`.

The remaining ten were not noise. Two were real bugs:

**`FormResponses.tsx` — infinite spinner on a failed fetch.** `formError` and
`responsesError` were destructured from SWR and never read, and loading was
derived as:

```tsx
const isLoading = isAuthLoading || !form || !responses;
```

When a fetch fails, `form` and `responses` stay `undefined`, so `isLoading`
stays `true` forever. The global SWR config sets `shouldRetryOnError: false`, so
one failure is terminal — the page spins indefinitely with no way out. Added an
error branch with a retry button, in the existing colour scheme.

**`FormBuilder.tsx` — dead `isSaving` state.** Set on every save, never read.
Checking the surrounding code, `autosaveStatus` already drives the whole save
indicator (`pending`/`saving`/`saved`/`error`/`idle`) and `saveInFlightRef`
already guards against concurrent saves, so `isSaving` was genuinely redundant
rather than a missing loading indicator. Removed with its setter calls.

The other eight were unused auth destructuring, an unused `AttendanceRecord`
interface, an unused map index and an unused `catch` binding.

### Hard errors

- **`AnalyticsAdmin.tsx` — "Cannot access variable before it is declared".**
  `loadAnalyticsData` was a `const` arrow function declared *below* the
  `useEffect` that calls it. It happened to work because effects run after
  render, by which point the binding is initialised — but the reference sits
  inside the temporal dead zone as written, and any refactor that made the call
  synchronous would have crashed. Moved the function above the effect.
  (Converting it to a hoisting `function` declaration also satisfies the runtime
  but the rule still flags it, so the function was physically moved.)

- **`SystemAlert.tsx` — component created during render.** `MarqueeContent` was
  defined inside `SystemAlert`, making it a new component *type* on every
  render. React cannot reconcile a changed type, so it unmounted and remounted
  the marquee each time the parent re-rendered, restarting the 60-second scroll
  animation. Moved to module scope.

- **`github-sync/index.ts`** — `for (const [_, dbUserId] of userMap.entries())`
  → `for (const dbUserId of userMap.values())`.

- **`PublicFormPage.tsx`** — `let respondent: any = {}` → a `const` with a real
  type.

### Three rules downgraded to warnings

Not everything could honestly be fixed in this pass, and silencing a rule is a
decision that should be visible. Each downgrade is commented in
`eslint.config.js` with what it would take to promote it back:

| rule | count | why a warning for now |
|---|---|---|
| `@typescript-eslint/no-explicit-any` | 58 | Mostly untyped Supabase row payloads and form answer values. Real debt, but it needs generated database types to fix properly, not `unknown` casts. |
| `react-refresh/only-export-components` | 3 | `AuthContext`/`useAuth`, `SmoothScroll`/`useLenis`, `button`/`buttonVariants` deliberately co-locate a hook or variants object with the component. Costs Fast Refresh granularity in dev, nothing in production. |
| `react-hooks/set-state-in-effect` | 6 | Each is an effect deriving state from a prop or from an instance it just created. Fixing them properly means refs, `useSyncExternalStore`, or lifting values out of state — six separate behavioural changes. Not something to rush into the same commit as a CI setup. |

`npm run lint` now exits 0, with 72 warnings that are visible but non-blocking.

## Part 2 — the workflow

`.github/workflows/ci.yml`, triggered on pushes to `main` and on PRs targeting
`main`:

1. `npm ci` — not `npm install`. It installs exactly what `package-lock.json`
   pins and fails if the lockfile has drifted from `package.json`, which is
   itself a check worth having.
2. `npm run lint`
3. `npm run typecheck` — new script, `tsc -b --pretty false`
4. `npm run build`

Notes on the shape of it:

- **A separate type-check step, even though `build` runs `tsc -b` first.** It is
  redundant on paper, but it means a type error is reported as a failed
  type-check rather than a failed build, which is the difference between reading
  the summary and reading the log.
- **`concurrency` with `cancel-in-progress` scoped to pull requests.** Pushing
  again to a PR makes the in-flight run obsolete; runs on `main` are never
  cancelled.
- **`permissions: contents: read`** — the workflow only needs to read the repo.
- **No secrets.** The Supabase URL and publishable key are read in the browser
  at runtime, not baked in at build time. I verified this by building a clean
  `git archive` checkout with no `.env` present — it succeeds. Requiring secrets
  would have added a setup step for nothing.
- **`node-version: 22`** — current LTS. Worth aligning with whatever Vercel is
  configured to use for this project.

### `npm run typecheck`

Added to `package.json` so CI and local development run the same command rather
than CI inventing its own invocation. That is the "keep deployment steps
consistent" half of the task item.

## Left for you

Two parts of this item need repository permissions I do not have:

1. **Blocking merges.** The workflow reports status but does not enforce
   anything. Enforcement is a branch-protection rule on `main` — Settings →
   Branches → require the "Lint, type-check and build" check to pass before
   merging. It has to be set once, by hand, after the workflow has run at least
   once so GitHub can offer the check by name.
2. **Tests.** The task item lists tests as part of CI. There is no test runner in
   the repo yet (Long-Term A), so there is no test step. Once one exists it slots
   in after type-check.

## Verification

- `npm run lint` → exit 0.
- `npm run typecheck` → passes.
- `npm run build` → passes, including from a clean checkout with no `.env`.
- The workflow itself has not run — that happens on the first push.
