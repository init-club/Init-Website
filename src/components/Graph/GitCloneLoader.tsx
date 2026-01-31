import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface GitCloneLoaderProps {
    onComplete: () => void;
    duration?: number;
}

// Color progression using theme colors
const getSegmentColor = (index: number, total: number) => {
    // Get CSS variables at runtime
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const secondary = getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim();
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();

    const ratio = index / total;
    if (ratio < 0.5) return primary;
    if (ratio < 0.75) return secondary;
    return accent;
};

export const GitCloneLoader = ({ onComplete, duration = 700 }: GitCloneLoaderProps) => {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + 2;
                if (next >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsComplete(true), 200);
                    return 100;
                }
                return next;
            });
        }, duration / 50);

        return () => clearInterval(interval);
    }, [duration]);

    useEffect(() => {
        if (isComplete) {
            setTimeout(onComplete, 500);
        }
    }, [isComplete, onComplete]);

    const totalSegments = 20;

    return (
        <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50"
            initial={{ opacity: 1 }}
            animate={isComplete ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {/* Radial reveal mask */}
            <motion.div
                className="absolute inset-0 bg-black"
                initial={{ clipPath: 'circle(100% at 50% 50%)' }}
                animate={isComplete ? { clipPath: 'circle(0% at 50% 50%)' } : { clipPath: 'circle(100% at 50% 50%)' }}
                transition={{ duration: 0.5, ease: "easeIn" }}
            />

            {/* Content */}
            <motion.div
                className="relative z-10 flex flex-col items-center"
                animate={isComplete ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Logo with circular pulse */}
                <motion.div
                    className="relative mb-6 rounded-full"
                    animate={{
                        scale: [1, 1.02, 1],
                        boxShadow: [
                            "0 5px 5px var(--primary)",
                            "0 5px 12px var(--secondary)",
                            "0 5px 5px var(--primary)"
                        ]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <img
                        src="/InitClubLogoDarkLoader.png"
                        alt="Init Club"
                        className="w-24 h-24 sm:w-64 sm:h-64 object-contain rounded-full"
                    />
                </motion.div>

                {/* git clone text */}
                <motion.div className="text-[var(--muted)] text-sm font-mono tracking-widest mb-8 opacity-60">
                    &gt; git clone init club
                </motion.div>

                {/* Gradient progress bar */}
                <div className="flex items-center gap-1 mb-4">
                    {[...Array(totalSegments)].map((_, i) => {
                        const isFilled = progress > i * 5;
                        const segmentColor = getSegmentColor(i, totalSegments);
                        return (
                            <motion.div
                                key={i}
                                className="w-2 h-6 rounded-sm"
                                style={{
                                    backgroundColor: isFilled ? segmentColor : '#1a1a1a',
                                    boxShadow: isFilled ? `0 0 6px ${segmentColor}` : 'none'
                                }}
                                initial={{ scaleY: 0.5 }}
                                animate={{ scaleY: isFilled ? 1 : 0.5 }}
                                transition={{ duration: 0.1 }}
                            />
                        );
                    })}
                </div>

                {/* Percentage with theme color */}
                <motion.div
                    className="text-3xl font-light tracking-wider"
                    style={{
                        fontVariantNumeric: 'tabular-nums',
                        color: 'var(--primary)'
                    }}
                >
                    {progress}%
                </motion.div>
            </motion.div>
        </motion.div>
    );
};
