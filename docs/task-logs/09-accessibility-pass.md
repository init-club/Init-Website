# 09 — Accessibility: keyboard focus, button names, image alt text

**Source:** `next_steps.md` → Long-Term Focus → G. Accessibility and mobile quality
> "Test the important pages with keyboard navigation. Check form labels, focus
> states, button names, and readable contrast."

**Status:** focus states, button names and alt text are done. Contrast is
audited but **not changed** — see "Left for you". Mobile quality was covered
separately in tasks 01, 02 and 04.

**Files touched:** `src/styles/index.css`, plus 12 components.

## 1. There was no visible keyboard focus indicator — the big one

`src/styles/index.css` set an `outline-color` token but never an outline:

```css
* {
  border-color: oklch(var(--border));
  outline-color: oklch(var(--ring) / 0.5);  /* colour, but nothing draws it */
}
```

So keyboard users got the browser default outline — a thin dark ring — against
`--bg: #09090b`, on cards that are themselves near-black
(`bg-zinc-950/60`, `bg-[#09090b]`). Effectively invisible. Tabbing through the
site gave no indication of where you were, which makes the whole thing
unusable without a mouse regardless of what else is correct.

Added:

```css
:where(a, button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])):focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: inherit;
}

:focus:not(:focus-visible) {
  outline: none;
}
```

Choices worth recording:

- **`var(--accent)` (`#00ffd5`)** — the cyan already used throughout the theme.
  No new colour is introduced, and it has strong contrast against every surface
  in the palette.
- **`:focus-visible`, not `:focus`** — the ring appears for keyboard and
  assistive-tech users and not around every button someone clicks with a mouse.
  That distinction is why people remove focus outlines in the first place, so
  getting it right removes the temptation.
- **`:where(...)`** — zero specificity, so any component that wants its own
  focus treatment can override it with a plain class, no `!important` needed.
- **`outline-offset: 2px` and `border-radius: inherit`** — the ring follows the
  element's own rounding rather than boxing a rounded pill in a rectangle.
- **The second rule replaces, rather than removes.** `:focus:not(:focus-visible)`
  suppresses the mouse-click ring only; it never leaves a keyboard user without
  an indicator.

## 2. Hover-only controls were invisible to keyboard users

Two toolbars use `opacity-0 group-hover:opacity-100`. They stay in the tab
order while invisible, so a keyboard user tabs onto a control they cannot see
and, before fix 1, had no focus ring to locate either.

- `FieldCard.tsx` — the edit/duplicate/delete quick-action bar on every form
  field. Added `focus-within:opacity-100` to the container, so the whole bar
  appears when any button inside it takes focus.
- `EventsAdmin.tsx:367` — the delete-session button. Added
  `focus-visible:opacity-100`.

Every other `opacity-0 group-hover:opacity-100` in the codebase was checked and
is decorative (`pointer-events-none` gradient overlays on cards), so not
focusable and not affected.

## 3. Icon-only buttons had no accessible name

I scanned every `<button>` in `src/` for elements whose entire content is JSX
elements with no text node and no `aria-label` — a screen reader announces those
as just "button". 13 matched. Labels added:

| file | control | label |
|---|---|---|
| `TeamSection.tsx` | close | Close team member details |
| `WriteBlogModal.tsx` | close | Close blog editor |
| `FormPreviewModal.tsx` | close | Close preview |
| `FormSettingsModal.tsx` | close | Close form settings |
| `ProjectDetailsModal.tsx` | close | Close project details |
| `ConfirmModal.tsx` | close | Close dialog |
| `ProjectAdmin.tsx` | close | Close dialog |
| `FieldEditor.tsx` | add option | Add option |
| `FieldCard.tsx` | edit / duplicate / delete | Edit field / Duplicate field / Delete field |
| `Profile.tsx` | carousel prev / next | Previous showcase projects / Next showcase projects |

The three `FieldCard` buttons already had `title` attributes. `title` is a
last-resort accessible-name fallback and is not exposed reliably — most
noticeably, it is not announced on touch devices at all. The `title` tooltips
were kept for sighted mouse users; `aria-label` now carries the name properly.

The close buttons are deliberately labelled with *what* they close rather than a
generic "Close". Several of these modals can be open over another surface, and
"Close dialog, Close dialog, Close dialog" tells a screen-reader user nothing
about which one they are on.

The carousel buttons were labelled "Previous showcase projects" / "Next showcase
projects" rather than bare "Previous" / "Next" — out of visual context, a
direction alone is not an action.

`AuthButtons` was already handled in task 01 (`aria-haspopup`, `aria-expanded`,
`aria-label`, `role="menu"`, `role="menuitem"`).

## 4. Image alt text

Every `<img>` in the codebase was parsed (full tag, not just the first line, so
multi-line JSX was included). Exactly one was missing `alt`:
`Navbar.tsx:374`, the avatar in the mobile account section.

It was given `alt=""` rather than a description. The user's name and status are
rendered in text immediately beside it, so a described avatar would make a
screen reader announce the same name twice. An empty `alt` is the correct
marking for a decorative image — and it is explicit, so the next person can see
it was a decision rather than an omission. A comment says so.

## What did NOT change

No colour value, spacing, font, animation or layout. The focus ring uses the
existing `--accent` token. Nothing here alters what a sighted mouse user sees,
with the single exception of the two hover-only toolbars, which now also appear
on keyboard focus.

## Left for you

**Contrast.** I did not change any colour, because doing so would break the "keep
the same colours and themes" constraint, and several of these are deliberate
design choices rather than mistakes. But three recurring pairings fall short of
WCAG AA (4.5:1 for body text, 3:1 for large text) against the near-black
backgrounds:

- `text-zinc-600` (`#52525b`) on `bg-zinc-950` — roughly **2.3:1**. Used for
  secondary text: `@handles` and the "pts" label on the leaderboard, empty-state
  copy, the "Not saved" indicator. This is the one most worth revisiting;
  `zinc-500` would clear AA for large text and get close for body.
- `text-zinc-500` (`#71717a`) on the same — roughly **3.6:1**. Passes for large
  text, falls short for body copy.
- `text-[10px]` labels in `zinc-600` — small *and* low contrast together.

Bumping the two greys one step each (`zinc-600 → zinc-500`, `zinc-500 →
zinc-400`) would fix most of it while keeping the muted look. That is a visual
decision, so it is yours.

**Not covered by this pass**, and worth a follow-up:

- **Focus trapping in modals.** None of the modals trap Tab, so a keyboard user
  can tab out of an open dialog into the page behind it. Several also lack an
  Escape handler (`PdfModal` and the new `AuthButtons` menu have one; most do
  not). This is a real gap but it needs a shared focus-trap utility and per-modal
  testing.
- **Nested interactive elements.** `EventsAdmin.tsx:362-372` has a `<button>`
  inside another `<button>`. That is invalid HTML with unpredictable behaviour
  across browsers and assistive tech. Fixing it means restructuring the row, so I
  flagged it rather than changing it blind.
- **A skip-to-content link.** Every page renders the full `Navbar` first, so
  keyboard users tab through the whole navigation on every page load.
- **Form field labels.** `FormRenderer` was not audited in depth; the generated
  public form inputs should be checked for real `<label for>` associations.

## Verification

- `npm run build`, `npm run lint` (0 errors), `npm test` (62 passing) — all pass.
- Detection was done by parsing the JSX rather than by eye, so the button and
  image sweeps are exhaustive across `src/`, not a spot check.

Not verified with an actual screen reader or by tabbing through a live page.
