import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface GitCloneLoaderProps {
    onComplete: () => void;
    duration?: number;
}

// Color gradient from cyan to purple across segments
const getSegmentColor = (index: number, total: number) => {
    const colors = ['#00ffd5', '#00e5ff', '#00bfff', '#7c4dff', '#a855f7'];
    const colorIndex = Math.floor((index / total) * (colors.length - 1));
    return colors[colorIndex];
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
            {/* Radial reveal mask - expands outward on complete */}
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
                {/* git clone text */}
                <motion.div
                    className="text-white text-lg tracking-widest mb-8 opacity-60"
                >
                    git clone...
                </motion.div>

                {/* Gradient progress bar with segments */}
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
                                    boxShadow: isFilled ? `0 0 10px ${segmentColor}` : 'none'
                                }}
                                initial={{ scaleY: 0.5 }}
                                animate={{ scaleY: isFilled ? 1 : 0.5 }}
                                transition={{ duration: 0.1 }}
                            />
                        );
                    })}
                </div>

                {/* Percentage with gradient effect */}
                <motion.div
                    className="text-3xl font-light tracking-wider"
                    style={{
                        fontVariantNumeric: 'tabular-nums',
                        background: 'linear-gradient(90deg, #00ffd5, #a855f7)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    {progress}%
                </motion.div>
            </motion.div>
        </motion.div>
    );
};
