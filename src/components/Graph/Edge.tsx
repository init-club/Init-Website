import { motion } from 'framer-motion';

interface EdgeProps {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    delay: number;
    duration: number;
    color?: string;
    baseColor?: string;
    className?: string;
    isHighlighted?: boolean;
    label?: string;
    labelDy?: number | string;
    labelOffset?: number | string;
    labelAnchor?: 'start' | 'middle' | 'end';
    isMobile?: boolean;
}

export const Edge = ({ id, x1, y1, x2, y2, delay, duration, color = '#334155', isHighlighted, label, labelDy, labelOffset, labelAnchor, isMobile = false, }: EdgeProps) => {
    // Smooth horizontal Bezier curve
    const dist = Math.abs(x2 - x1);
    const cp1x = x1 + dist * 0.5;
    const cp1y = y1;
    const cp2x = x2 - dist * 0.5;
    const cp2y = y2;

    const pathD = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

    // Non-hover: Branch color stroke with glow
    // Hover: Brighter version
    const glowColor = color; // Always use the branch color for glow

    // Desktop: Full glow filters. Mobile: No filters for performance
    const glowIntensity = isMobile
        ? 'none'
        : isHighlighted
            ? `drop-shadow(0 0 4px ${glowColor}) drop-shadow(0 0 10px ${glowColor}) drop-shadow(0 0 20px ${glowColor})`
            : `drop-shadow(0 0 4px ${glowColor}) drop-shadow(0 0 10px ${glowColor}) drop-shadow(0 0 18px ${glowColor})`;

    return (
        <g>
            {/* Main colored path with glow */}
            <motion.path
                id={id}
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={6}
                strokeLinecap="round"
                style={{ filter: glowIntensity }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                    pathLength: 1,
                    opacity: isHighlighted ? 1 : 0.6
                }}
                transition={{
                    pathLength: { duration: duration, delay: delay, ease: "easeInOut" },
                    opacity: { duration: 0.3 }
                }}
            />

            {label && (
                <motion.text
                    className="pointer-events-none select-none"
                    dy={labelDy || "-15"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        delay: delay + 0.5,
                        duration: duration,
                        ease: "easeOut"
                    }}
                    style={{
                        filter: isMobile ? 'none' : `drop-shadow(0 0 3px ${color})`
                    }}
                >
                    <textPath
                        href={`#${id}`}
                        startOffset={labelOffset || "50%"}
                        textAnchor={labelAnchor || "middle"}
                        fill={color}
                        className="font-mono font-bold text-[11px] tracking-[0.2em] uppercase opacity-90"
                    >
                        {label}
                    </textPath>
                </motion.text>
            )}
        </g>
    );
};
