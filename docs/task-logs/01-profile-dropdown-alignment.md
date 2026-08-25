# 01 — Profile dropdown alignment

**Source:** `next_steps.md` → Short-Term Focus → F. Finishing the "Under Construction" pages
> "The profile button dropdown on home is dropping towards the right side and is
> not centered. This issue should be handled as well."

**File touched:** `src/components/layout/AuthButtons.tsx`

## What was wrong

The dropdown panel was positioned with a hard-coded `absolute right-0` and a
fixed `w-56` (224px) width. That anchors the panel's *right* edge to the
trigger's right edge, so the menu always hangs off to one side of the avatar
instead of sitting under it.

`AuthButtons` is rendered in two very different places on the home page
(`src/components/homepage/Graph/GitGraph.tsx`):

- **Desktop** — inside `absolute top-6 right-6`, i.e. pinned to the top-right
  corner of the viewport.
- **Mobile** — inside a `flex justify-center` row, i.e. horizontally centered.

A single fixed alignment cannot be correct for both. `right-0` looks acceptable
in the desktop corner but visibly off-centre on mobile, which is the reported
symptom.

Two further defects surfaced while reading the component:

1. **The menu never closed on outside interaction.** There was no outside-click
   or Escape handler, so once opened the panel stayed open until the trigger was
   clicked again or a link was followed.
2. **No ARIA wiring.** The trigger had no accessible name, no `aria-haspopup`
   and no `aria-expanded`, and the panel had no `role="menu"`.

## What changed

### Centred, viewport-clamped positioning

The panel is now anchored at `left-1/2` and pulled back by half its own width,
which centres it under the trigger. On top of that, `positionMenu()` measures
the trigger with `getBoundingClientRect()` and computes how far the centred
panel would overflow either edge of the viewport, then applies that correction
as `menuShift`:

```ts
const centeredLeft = rect.left + rect.width / 2 - MENU_WIDTH / 2;
const maxLeft = window.innerWidth - MENU_WIDTH - VIEWPORT_GUTTER;
const clampedLeft = Math.min(Math.max(centeredLeft, VIEWPORT_GUTTER), Math.max(maxLeft, VIEWPORT_GUTTER));
setMenuShift(clampedLeft - centeredLeft);
```

Net effect:

- **Mobile** — the trigger is mid-screen, nothing overflows, `menuShift` is `0`,
  and the panel sits perfectly centred under the avatar. This is the reported
  bug, fixed.
- **Desktop** — the trigger is 24px from the right edge, so a centred panel
  would overflow by roughly 88px; `menuShift` pulls it back to an 8px gutter.
  The result is visually equivalent to the old `right-0` behaviour, so the
  desktop layout is unchanged.

The offset is applied as `marginLeft`, deliberately **not** as a `transform`.
The panel is a `motion.div` whose enter/exit animation already animates
`y`/`scale`, and Framer Motion owns the `transform` property outright — writing
a `translateX` into `style.transform` would be silently overwritten. Using a
non-transform property keeps the two concerns independent.

Positioning is recomputed in a `useLayoutEffect` (before paint, so the panel
never renders in the wrong spot for a frame) and re-run on `resize` and on
`scroll` (capture phase, to catch scrolls inside any ancestor container — the
home hero is a scrolling section).

### Dismissal behaviour

While the menu is open the component now listens for:

- `pointerdown` anywhere outside the container → close. `pointerdown` rather
  than `click` so it responds to touch immediately, and it covers mouse, pen and
  touch in one handler.
- `Escape` → close and return focus to the trigger.

All listeners are registered only while `showDropdown` is true and are removed
in the effect cleanup.

### Accessibility

Added `aria-haspopup="menu"`, `aria-expanded`, `aria-label="Account menu"` on
the trigger, `role="menu"` on the panel, and `role="menuitem"` on the three
entries. This is groundwork for the broader accessibility item (Long-Term G).

### Incidental

`isLoading` was destructured from `useAuth()` but never used; removed.

## What did NOT change

Every colour, border, shadow, blur, font and animation timing is byte-identical
to the previous version — `bg-[#09090b]`, `border-white/10`, `shadow-2xl`, the
cyan avatar ring, the red sign-out row, and the
`opacity/y/scale` transition at `duration: 0.1`. The change is purely
positional and behavioural.

## Verification

- `npm run build` (runs `tsc -b` then `vite build`) — passes.
- `npx eslint src/components/layout/AuthButtons.tsx` — clean.
- Geometry reasoned through for both call sites, as described above.

Not verified in a live browser; there is no test harness in the repo yet
(see Long-Term A).
