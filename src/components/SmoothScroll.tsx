import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

// --- Context ---
const LenisContext = createContext<Lenis | null>(null);

/** Hook to access the global Lenis instance from any component. */
export const useLenis = () => useContext(LenisContext);

// --- Provider ---
interface SmoothScrollProps {
    children: React.ReactNode;
}

const SmoothScroll: React.FC<SmoothScrollProps> = ({ children }) => {
    const [lenis, setLenis] = useState<Lenis | null>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const instance = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            touchMultiplier: 2,
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
        };
    }, []);

    return (
        <LenisContext.Provider value={lenis}>
            {children}
        </LenisContext.Provider>
    );
};

export default SmoothScroll;
