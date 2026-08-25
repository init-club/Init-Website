import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

// --- Context ---
const LenisContext = createContext<Lenis | null>(null);

/**
 * Hook to access the global Lenis instance from any component.
 *
 * This can legitimately be `null` — either during the first render before the
 * instance exists, or permanently when the visitor has asked for reduced
 * motion. Always guard (`lenis?.stop()`) or provide a native fallback.
 */
export const useLenis = () => useContext(LenisContext);

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// --- Provider ---
interface SmoothScrollProps {
    children: React.ReactNode;
}

const SmoothScroll: React.FC<SmoothScrollProps> = ({ children }) => {
    const [lenis, setLenis] = useState<Lenis | null>(null);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(
        () => typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches
    );
    const rafRef = useRef<number>(0);

    // Track the preference live — visitors can flip it without reloading.
    useEffect(() => {
        const query = window.matchMedia(REDUCED_MOTION_QUERY);
        const onChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);

    useEffect(() => {
        // Reduced motion: skip Lenis entirely and leave the browser's own
        // scrolling in place. Consumers already handle a null instance.
        if (prefersReducedMotion) {
            // Nothing to create. The previous effect's cleanup already cleared
            // any existing instance, so there is no state to reset here.
            return;
        }

        const instance = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            // Touch devices keep their native scrolling (syncTouch defaults to
            // false). Hijacking touch is what makes phone scrolling feel heavy
            // and breaks pull-to-refresh, so it stays off.
            syncTouch: false,
            infinite: false,
        });

        setLenis(instance);

        function raf(time: number) {
            instance.raf(time);
            rafRef.current = requestAnimationFrame(raf);
        }

        rafRef.current = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafRef.current);
            instance.destroy();
            setLenis(null);
        };
    }, [prefersReducedMotion]);

    return (
        <LenisContext.Provider value={lenis}>
            {children}
        </LenisContext.Provider>
    );
};

export default SmoothScroll;
