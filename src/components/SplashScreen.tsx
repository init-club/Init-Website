import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface SplashScreenProps {
    onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
    useEffect(() => {
        // Total splash duration
        const timer = setTimeout(() => {
            onComplete();
        }, 1500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 p-8"
            >
                <img
                    src="/logo-dark.png"
                    alt="Init Club"
                    className="w-56 md:w-72 h-auto splash-img rounded-full"
                />
                {/* Animated glow effect behind logo */}
                <div className="splash-before absolute inset-0 pointer-events-none" />
            </motion.div>
        </motion.div>
    );
}
