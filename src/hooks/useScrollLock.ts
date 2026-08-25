import { useEffect } from 'react';
import { useLenis } from '../components/layout/SmoothScroll';

/**
 * Freezes page scrolling while `locked` is true — for modals, overlays and the
 * intro loader.
 *
 * Both halves are needed. `overflow: hidden` on the body stops native
 * scrolling, and `lenis.stop()` stops the smooth-scroll loop, which otherwise
 * keeps animating the page underneath the overlay.
 *
 * The previous inline value is captured and restored rather than being reset to
 * a hard-coded 'unset'/''. Two overlapping overlays (a confirm dialog opened
 * from inside a modal) therefore unwind correctly instead of the inner one
 * unlocking the page on close.
 */
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

export default useScrollLock;
