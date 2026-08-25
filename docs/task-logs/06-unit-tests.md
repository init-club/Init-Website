# 06 — Unit tests for the form engine

**Source:** `next_steps.md` → Long-Term Focus → A. Add automated testing
> "Add unit tests for important helper functions and business rules."

**Status:** the unit-test third is done. The other two bullets of that item —
database/RLS tests and end-to-end tests — are **not** started; both need
credentials and a test environment. See "Left for you".

**Files touched:** new `src/utils/formUtils.test.ts`,
`src/utils/formDefinition.test.ts`, plus `vite.config.ts`, `package.json`,
`.github/workflows/ci.yml`.

## Runner

Vitest, because the project already builds with Vite — it reuses the same
config, the same `@` path alias and the same TypeScript setup, so there is no
second build pipeline to keep in sync.

Configured inside the existing `vite.config.ts` rather than a separate
`vitest.config.ts`, for the same reason:

```ts
test: {
  environment: 'node',
  include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
},
```

`environment: 'node'` keeps the suite fast; everything tested here is pure
logic. When a component test eventually needs a DOM, jsdom can be added and
opted into per file with a `// @vitest-environment jsdom` pragma, rather than
paying for it everywhere.

Scripts: `npm test` (`vitest run`, single pass — what CI uses) and
`npm run test:watch`.

## What is covered, and why these functions

Both files are pure, have no I/O, and encode rules that would be expensive to
get wrong: what counts as a valid form answer, and what actually gets written to
the database when a form is saved. 62 tests.

### `formUtils.ts` — 34 tests

`generateSlug`, `createDefaultFields`, and the bulk of it on `validateAnswers`.

Cases worth calling out, because they pin down behaviour that is easy to break:

- **Falsy-but-present values.** `0` on a number field and `false` on a checkbox
  must pass a required check. A naive `if (!value)` rewrite of `isProvided`
  would break both, and these tests catch it.
- **Whitespace-only strings and empty arrays fail required.** Both are covered
  by the current `isProvided` expression; both are the kind of thing a
  simplification would drop.
- **`min: 0` and `minLength: 0` are real bounds**, not "absent". The code
  distinguishes these with explicit `!== undefined && !== null` checks rather
  than truthiness — pinned by test.
- **Length rules apply to the trimmed value**, so `'abc   '` passes
  `maxLength: 3`.
- **Section headers are skipped entirely** — they are layout, not input, and
  produce no key in the error map even when marked required.
- **A malformed admin-authored regex does not throw.** `validateAnswers` catches
  the `RegExp` constructor error, logs it, and lets the answer through. That is
  a deliberate fail-open, and the test states it explicitly so nobody
  "fixes" it into a crash — or silently changes it to fail-closed — without
  seeing the decision.
- **Errors are reported per field**, so one bad answer doesn't mask the others.

### `formDefinition.ts` — 28 tests

`serializeFormFields`, `normalizeFormSettings`, `normalizeFormRecord`.

- **Ordering.** Fields sort by `order` and get renumbered to a dense `position`
  sequence from 0 — so gaps and duplicates in the builder's `order` values never
  reach the database. Also asserts the input array is **not mutated**, since the
  function is called from React state.
- **Empty-value stripping.** `null`, `undefined` and `''` are dropped from
  `validation`; if nothing survives, `validation` is omitted; if `config` ends up
  empty it is omitted entirely rather than stored as `{}`.
- **`minLength: 0` survives stripping** — the filter tests against `null`,
  `undefined` and `''` specifically, not falsiness.
- **Titles.** Trimmed, and a blank title becomes `'Untitled Field'` rather than
  being written empty.
- **Sections are forced to `required: false`** regardless of the builder state.
- **Options** are trimmed and blank-filtered, attached only to `select`, `radio`
  and `multiselect`, and emitted as `[]` (not `undefined`) for a choice field
  with none set.
- **Settings merging** fills defaults from `null`/`undefined`/`{}` and lets a
  stored `false` override a default of `true` — the classic spread-merge bug.
- **`normalizeFormRecord` tolerates bad shapes**: a missing, `null` or
  non-array `fields` value all yield `[]` instead of throwing.

## CI

A `Test` step now runs between type-check and build in
`.github/workflows/ci.yml`. It was placed before the build deliberately: a
failing test should stop the run before spending time on a bundle nobody is
going to use.

## Left for you

The other two bullets of this task item are genuinely blocked on things I do not
have:

- **Database/RLS tests** need a throwaway Supabase project (or a local
  `supabase start`) plus service-role credentials, and they should run against a
  schema I can seed and reset. Wiring that into CI also means a secret.
- **End-to-end tests** (login, profile setup, form creation, submission, admin
  actions) need a browser runner and a seeded test account. Login specifically
  goes through GitHub OAuth, which needs either a test OAuth app or a bypass —
  a decision about the auth setup, not something to pick unilaterally.

Say the word on either and I will scaffold it.

## Verification

- `npm test` → 62 passed, 2 files.
- `npm run typecheck`, `npm run lint`, `npm run build` all still pass with the
  test files present.
