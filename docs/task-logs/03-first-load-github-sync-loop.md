# 03 — Spurious GitHub sync on first load

**Source:** `next_steps.md` → Short-Term Focus → E. Loading
> "Sometimes the website runs a GitHub sync loop the first time you load into
> the website until you reload it again. Identification of that issue and
> solving it is necessary."

**Files touched:** `src/context/AuthContext.tsx`, `src/App.tsx`

## Root cause

There were two independent auth listeners racing each other in
`AuthContext.tsx`, and the loser set `isLoading` to `false` first.

The old effect did two things on mount:

```tsx
// 1. Initial Session check
supabase.auth.getSession().then(async ({ data: { session } }) => {
  setSession(session);
  if (session?.user) await fetchProfile(session.user.id);  // <- async, slow (RPC)
  setIsLoading(false);
});

// 2. Listen to Auth State changes (skip redundant INITIAL_SESSION fetch)
const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
  setSession(session);
  if (event === 'SIGNED_IN' || ...) { ... }   // INITIAL_SESSION deliberately excluded
  setIsLoading(false);                        // <- but this runs for INITIAL_SESSION too
});
```

`supabase-js` v2 emits `INITIAL_SESSION` synchronously-ish as soon as you
subscribe. Listener 2 was written to *skip the profile fetch* on that event —
which is the right intent — but `setIsLoading(false)` sits **outside** the
event check, so it fires anyway. It therefore flipped `isLoading` to `false`
while listener 1's `fetchProfile` (a network round-trip to the `get_my_status`
RPC) was still in flight.

For one or more renders the context then reported: `isLoading: false`,
`session: <valid>`, `userProfile: null`.

`App.tsx` treats exactly that combination as "this user has no database row
yet", which is the JIT-sync trigger:

```tsx
if (!isLoading && session) {
  if (!userProfile) {
    tryJitSync();   // invokes the github-lookup-user edge function
  }
```

So a fully-synced, long-standing member hit the GitHub org-membership edge
function on page load and got the full-screen "Syncing with GitHub..." blocker,
purely because the profile fetch had not landed yet. On a reload the session and
RPC response are warm, the race usually resolves the other way, and the problem
"goes away" — which matches the reported symptom exactly.

A second, compounding defect: `tryJitSync` had **no guard against repeat
invocation**. The effect depends on `[session, userProfile, isLoading,
refreshProfile, navigate]`, and `fetchProfile` assigns a brand-new object to
`userProfile` on every call, while token refreshes hand back a new `session`
object. Any of those identity changes re-runs the effect, and while
`userProfile` is still null each re-run fires the edge function again. React
`StrictMode` (enabled in `src/main.tsx`) double-invokes effects in development,
doubling it again.

## The fix

### `AuthContext.tsx` — one listener, one source of truth

The standalone `getSession()` call is gone. `onAuthStateChange` already emits
`INITIAL_SESSION` on subscribe, so it can serve as the single entry point for
first load; keeping both only created the race.

`isLoading` is now flipped to `false` in exactly one place — after the profile
fetch has actually settled:

```tsx
const syncProfile = async (activeSession: Session | null) => {
  if (cancelled) return;
  setSession(activeSession);
  if (activeSession?.user) {
    await fetchProfile(activeSession.user.id);
  } else {
    setUserProfile(null);
    setIsAdmin(false);
  }
  if (!cancelled) setIsLoading(false);
};
```

Event routing:

| event | behaviour |
|---|---|
| `INITIAL_SESSION`, `SIGNED_IN`, `USER_UPDATED` | full `syncProfile` (session + profile, then clear loading) |
| `SIGNED_OUT` | clear session, profile and admin flag; clear loading |
| anything else (`TOKEN_REFRESHED`, …) | update the session only |

`TOKEN_REFRESHED` used to trigger a profile re-fetch. It no longer does — a
refreshed access token says nothing about the user's row, and re-fetching only
produced a new `userProfile` object identity that churned every consumer of the
context.

A `cancelled` flag guards against setting state after unmount, since
`syncProfile` awaits a network call.

### `App.tsx` — JIT sync runs at most once per account

```tsx
const jitAttemptedFor = useRef<string | null>(null);
...
if (!session) {
  jitAttemptedFor.current = null;   // let a different account try later
  return;
}
if (!isLoading) {
  if (!userProfile) {
    if (jitAttemptedFor.current !== session.user.id) {
      jitAttemptedFor.current = session.user.id;
      tryJitSync();
    }
  } else if (!userProfile.profile_completed) { ... }
```

The ref is keyed on the auth user id rather than being a plain boolean, so
signing out and back in as someone else still gets a sync attempt, while
re-renders, token refreshes and StrictMode double-invocation cannot re-fire it.
Refs survive StrictMode's simulated remount, so the guard holds in development
too.

This is defence in depth: with the `isLoading` race fixed the effect should not
reach `tryJitSync` for an existing member at all. The guard makes sure that if
it ever does, it costs one edge-function call and not a loop.

## Why the edge function itself was left alone

`supabase/functions/github-lookup-user/index.ts` is already idempotent — it
upserts on `onConflict: 'github_id'` and preserves an existing `role` and
`auth_user_id`. Repeated calls were wasteful and produced the visible blocking
spinner, but they were not corrupting data. The bug was entirely on the client.

## Verification

- `npm run build` — passes.
- `npx eslint src/App.tsx src/context/AuthContext.tsx` — reports 3 errors, all
  confirmed pre-existing on the parent commit (two `any` types on the
  `userProfile` field, one `react-refresh/only-export-components` on the
  `useAuth` export). Not introduced here; to be cleared when lint goes into CI.

The race is timing-dependent, so it cannot be demonstrated deterministically
without a test harness (Long-Term A). The reasoning above is from the control
flow, and the fix removes the interleaving that made the bad state reachable
rather than papering over it.
