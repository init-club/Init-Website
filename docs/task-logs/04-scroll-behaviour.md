# 04 — Scroll behaviour across pages, phones, touchpads and mouse

**Source:** `next_steps.md` → Short-Term Focus → C. Check the working of Scroll
> "Review the working of scroll for all pages, including scrolling from phones,
> touchpads, and mouse. Resolve the issue raised in GitHub."

**Status:** the code-visible defects are fixed. The second bullet — the specific
GitHub issue — is **not addressed**, because the issue number/link was not
available to me. See "Left for you" at the bottom.

**Files touched:**
`src/styles/index.css`, `src/components/layout/SmoothScroll.tsx`,
`src/components/layout/ScrollToTop.tsx`, new `src/hooks/useScrollLock.ts`,
plus `data-lenis-prevent` on 17 nested scroll containers and `useScrollLock`
wiring in 9 components.

## The main bug: Lenis was swallowing scroll inside nested containers

The site wraps everything in Lenis smooth scroll (`<SmoothScroll>` in
`App.tsx`). Lenis works by intercepting wheel events on the window and
animating the page itself. For that to coexist with **inner** scrollable
elements — modal bodies, side panels, wide tables, the About-page slider — those
elements must be marked `data-lenis-prevent`, and the accompanying CSS rule must
exist. Without it, putting the cursor over a scrollable modal body and using the
wheel or a touchpad scrolls *the page behind the modal* instead of the modal.

`src/styles/index.css` carried a **hand-copied, outdated snippet** of the Lenis
stylesheet:

```css
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-stopped { overflow: hidden; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
```

The installed version is Lenis **1.3.17**, whose actual stylesheet is:

```css
html.lenis,html.lenis body{height:auto}
.lenis:not(.lenis-autoToggle).lenis-stopped{overflow:clip}
.lenis [data-lenis-prevent],.lenis [data-lenis-prevent-wheel],.lenis [data-lenis-prevent-touch]{overscroll-behavior:contain}
.lenis.lenis-smooth iframe{pointer-events:none}
.lenis.lenis-autoToggle{transition-property:overflow;transition-duration:1ms;transition-behavior:allow-discrete}
```

The copy was missing the `[data-lenis-prevent]` rule entirely, missing the
iframe rule, and had drifted on `lenis-stopped` (`hidden` vs `clip`).

**Fix:** stop hand-maintaining it. `index.css` now does

```css
@import "lenis/dist/lenis.css";
```

so the rules come from the installed package and cannot drift on the next
upgrade. Verified present in the built CSS (`lenis-prevent`, `lenis-stopped`
and `lenis-autoToggle` all appear in `dist/assets/*.css`).

### Containers marked `data-lenis-prevent`

17 containers across 14 files — every `overflow-y-auto` / `overflow-x-auto`
element in the app:

modal bodies (`ProjectDetailsModal`, `WriteBlogModal`, `FormPreviewModal`,
`FormSettingsModal`, blog reader on `Blogs`, `BlogsAdmin`), scrollable panels
(`FieldEditor` ×2, `ProjectAdmin` ×2, `FormResponses` ×2, `Profile`,
`FormRenderer` dropdown), the wide admin tables (`AnalyticsAdmin` ×2,
`EventsAdmin`), and the About-page mission slider (`MissionSection`), which is
horizontal on desktop and vertical on mobile.

`Blogs.tsx` already had the attribute on its reader modal — that one was left
as-is.

## Phones

`SmoothScroll` passed `touchMultiplier: 2`. That option only has an effect when
`syncTouch` is enabled, and `syncTouch` defaults to `false` — so the setting was
dead config that read as if touch were being tuned when it was not.

Touch is now explicitly left native (`syncTouch: false`, stated rather than
implied, with a comment). This is the correct choice: hijacking touch is what
makes phone scrolling feel laggy and heavy, and it breaks pull-to-refresh and
overscroll. Phones get the browser's own scrolling; the `overscroll-behavior:
contain` from the Lenis stylesheet keeps inner containers from chaining their
overscroll to the page.

## Reduced motion

Lenis is now skipped entirely when the visitor has
`prefers-reduced-motion: reduce` set, falling back to native scrolling. The
preference is watched live via `matchMedia().addEventListener('change')`, so
toggling it at the OS level takes effect without a reload.

This is safe because `useLenis()` returning `null` was already a supported
state — every consumer either uses optional chaining (`lenis?.stop()`) or has an
explicit native fallback (`Navbar`, `ScrollToTop`). The JSDoc on `useLenis` now
documents that null is expected rather than transient.

## Route changes

`ScrollToTop` scrolls to the top on `pathname` change. The Lenis branch used
`{ immediate: true }` (correct), but the no-Lenis fallback used
`behavior: "smooth"` — so with Lenis unavailable, navigating between pages
animated a scroll through the whole new page instead of starting at the top.
Changed to `behavior: "instant"` to match the Lenis branch.

## Scroll locking: three copies, and nine modals with none

Three components had near-identical inline scroll locks (`PdfModal`,
`GitGraph`'s intro loader, `Blogs`' reader modal), each subtly different in how
they restored `document.body.style.overflow` — `'unset'`, `''`, or nothing.
Meanwhile `ProjectDetailsModal`, `WriteBlogModal`, `FormPreviewModal`,
`FormSettingsModal`, `ConfirmModal` and `AccessDeniedModal` had **no lock at
all**, so the page scrolled freely behind them.

New shared hook, `src/hooks/useScrollLock.ts`:

```ts
export function useScrollLock(locked: boolean) {
    const lenis = useLenis();
    useEffect(() => {
        if (!locked) return;
        const previousOverflow = document.body.style.overflow;
        lenis?.stop();
        document.body.style.overflow = 'hidden';
        return () => {
            lenis?.start();
            document.body.style.overflow = previousOverflow;
        };
    }, [locked, lenis]);
}
```

Two details worth keeping:

- **Both halves are required.** `overflow: hidden` stops native scrolling;
  `lenis.stop()` stops the smooth-scroll animation loop, which otherwise keeps
  moving the page under the overlay.
- **It restores the previous value** rather than resetting to a hard-coded
  `'unset'`. The old copies all reset unconditionally, which means a confirm
  dialog opened from inside a modal would unlock the page for the still-open
  parent modal when it closed. Capturing and restoring makes nested overlays
  unwind correctly.

All three duplicates were migrated to it and all six unlocked modals now use it.
`GitGraph` additionally pinned `document.body.style.height = '100vh'` for its
full-bleed intro loader; that is specific to the loader, so it stayed in
`GitGraph` as a small separate effect — but it now captures and restores the
previous height instead of forcing `'unset'`.

In `ProjectDetailsModal` the hook is called *before* the existing
`if (!project) return null` early return, so hook order stays stable across
renders.

This also chips away at Long-Term F ("move repeated business logic into
reusable utilities").

## What did NOT change

No colour, spacing, font or animation value. The Lenis feel is unchanged —
`duration: 1.2` and the same easing function are kept exactly, so mouse-wheel
and touchpad scrolling behave as before except that they now correctly target
whatever container the pointer is over.

## Verification

- `npm run build` — passes.
- Built CSS confirmed to contain the Lenis rules that were previously missing.
- `npx eslint src` run before and after the change; violation counts by rule are
  **identical**, so nothing new was introduced. (The repo currently has 122
  pre-existing lint errors, mostly `no-explicit-any` — relevant to Long-Term B,
  since lint cannot gate CI until they are cleared.)

## Left for you

**The GitHub issue referenced in `next_steps.md` is not resolved.** I could not
identify which issue it means. Send me the issue number or link and I will work
it as a follow-up — the fixes above may already cover it, but I am not going to
claim that without reading the report.

Nothing here was verified on real hardware. Worth a manual pass on a phone and a
touchpad, particularly the About-page mission slider, which is the one container
that changes scroll axis between breakpoints.
