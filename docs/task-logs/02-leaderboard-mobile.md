# 02 — Leaderboard on phones

**Source:** `next_steps.md` → Short-Term Focus → D. Leaderboard
> "Review the leaderboard and fix its representation on phones."

**File touched:** `src/components/activity/Leaderboard.tsx`

## What was wrong

### 1. The podium listed the winner second on phones

The top three were rendered from a hard-reordered array:

```tsx
{[topThree[1], topThree[0], topThree[2]].map(...)}
```

That reorder exists so that in the `sm:grid-cols-3` layout #1 lands in the
middle column and reads as the tallest step of a podium. It is correct there.

But the grid is `grid-cols-1` on phones, so DOM order *is* visual order, and the
list read **#2, #1, #3** top to bottom. The person in first place appeared
second. This is the most serious of the mobile issues — it misreports the
result.

### 2. Podium cards were sized for a side-by-side layout

`min-h-[272px]` for first place and `min-h-[228px]` for the others are podium
*step heights*: they only carry meaning when the three cards sit next to each
other and you can compare them. Stacked in a single column they simply became
three very tall boxes — roughly 730px plus gaps, more than a full phone
viewport, before the ranked list below even started.

### 3. Custom titles silently vanished on phones

In the ranked list below the podium, the title pill was `hidden sm:inline-flex`.
On phones the information was dropped entirely rather than relocated.

### 4. Minor spacing pressure in the list rows

Each row is `rank + avatar + name + title + score` in a flex row with `gap-4`
and `px-4`. On a 360px viewport the fixed elements plus gaps leave very little
for the name column, so names truncated earlier than necessary.

## What changed

### Podium order via CSS, not DOM order

The map now runs over `topThree` in natural rank order, so the DOM — and
therefore the phone layout and the screen-reader reading order — is #1, #2, #3.
The side-by-side arrangement is restored at `sm` and up with a small order map:

```ts
const podiumOrder: Record<number, string> = {
  1: 'sm:order-2',
  2: 'sm:order-1',
  3: 'sm:order-3',
};
```

This also removed the `<div className="hidden sm:block" />` placeholder branch.
That branch existed only because the hard-coded `[1],[0],[2]` index access
produces `undefined` holes when fewer than three members qualify. Mapping the
real array cannot produce holes, so the placeholder — and the `if (!member)`
guard — is gone. With one or two qualifying members the grid simply auto-places
what exists.

### Mobile-appropriate podium heights

Heights are now scoped to the breakpoint where they mean something:

| | phone | `sm` and up |
|---|---|---|
| #1 card | `min-h-[196px]`, `py-6` | `min-h-[272px]`, `py-8`, `-translate-y-3` |
| #2 / #3 | `min-h-[176px]`, `py-5` | `min-h-[228px]`, `py-6` |

The desktop values are unchanged. The grid also moved to `items-stretch
sm:items-end`, since `items-end` is meaningless in a single column, and to
`gap-5 sm:gap-4` — the rank badge is absolutely positioned at `-top-3` and
overhangs the card, so the stacked layout needs a slightly wider gutter to keep
the badge clear of the card above it.

### Titles relocate instead of disappearing

The list rows now render the custom title under the `@handle` on phones
(`sm:hidden`, small purple text with the same `Award` icon), while the existing
pill stays for `sm` and up. Same information, same colours, placed where there
is room for it.

### Row spacing

`px-4 → px-3 sm:px-4`, `gap-4 → gap-3 sm:gap-4`, and the rank column `w-7 →
w-6 sm:w-7`. Together this returns roughly 30px to the name column on a narrow
screen. The `GitCommitHorizontal` icon in the score group is now `hidden
sm:block` — it is decorative and sits next to a number that is already labelled
"pts". Scores also gained `tabular-nums` so the column doesn't jitter between
rows.

## What did NOT change

No colour, gradient, border, glow, font or animation value was altered. The
purple/cyan avatar fallback gradient, the gold/silver/bronze podium rings and
glows, `bg-zinc-950/60`, `border-zinc-900` and every `motion` transition are
untouched. Desktop rendering is intentionally pixel-identical to before.

Scoring logic (`getTotalScore`), `MAX_DISPLAYED`, and `EXCLUDED_USERNAMES` were
not touched.

## Verification

- `npm run build` — passes.
- `npx eslint src/components/activity/Leaderboard.tsx` — clean.
- Page wrapper (`src/pages/Activity.tsx`) was checked and already has `px-4`
  and `overflow-x-hidden`; no change needed there.

Not verified on a physical device; no test harness exists yet (Long-Term A).
