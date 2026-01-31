import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { GlitchText } from './GlitchText';

interface NavNodeProps {
    x: number;
    y: number;
    label: string;
    path: string;
    delay: number;
    description?: string;
    color?: string;
    align?: 'left' | 'right';
    isMobile?: boolean; //  prop to disable hover on mobile
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}

export const NavNode = ({ x, y, label, path, delay, description, color = 'var(--text)', align = 'right', isMobile = false, onMouseEnter, onMouseLeave }: NavNodeProps) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const handleEnter = () => {
        if (isMobile) return; // Disable hover on mobile
        setIsHovered(true);
        onMouseEnter?.();
    };

    const handleLeave = () => {
        if (isMobile) return; // Disable hover on mobile
        setIsHovered(false);
        onMouseLeave?.();
    };

    const handleClick = () => {
        navigate(path);
    };

    const textX = align === 'right' ? x + 30 : x - 230;
    const textAlignClass = align === 'right' ? 'items-start text-left' : 'items-end text-right';

    return (
        <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                delay: delay,
                duration: 0.5,
                type: "spring",
                stiffness: 200
            }}
            className="cursor-pointer group"
        >
            {/* Invisible larger hitbox for easier hovering */}
            <circle
                cx={x}
                cy={y}
                r="30"
                fill="transparent"
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                onClick={handleClick}
                style={{ cursor: 'pointer' }}
            />

            {/* Main Container Circle - Ring design */}
            <motion.circle
                cx={x}
                cy={y}
                r="16"
                fill="none"
                stroke={color}
                strokeWidth="2"
                className="transition-colors duration-300 pointer-events-none"
                animate={{ scale: isHovered ? 1.15 : 1 }}
                transition={{ duration: 0.2 }}
            />

            {/* Inner Dot - Solid color center */}
            <circle cx={x} cy={y} r="4" fill={color} className="pointer-events-none" />

            {/* Label - Clickable/hoverable */}
            <foreignObject x={textX} y={y - 25} width="200" height="60" className="overflow-visible">
                <div
                    className={`flex flex-col ${textAlignClass} justify-center h-full cursor-pointer`}
                    onMouseEnter={handleEnter}
                    onMouseLeave={handleLeave}
                    onClick={handleClick}
                >
                    <motion.h3
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: delay + 0.3 }}
                        className="text-lg tracking-tight flex items-center gap-2"
                        style={{ color: color }}
                    >
                        <GlitchText text={label} delay={delay + 0.5} trigger={isHovered} />
                    </motion.h3>

                    {description && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: delay + 0.5 }}
                            className="text-[10px] font-mono uppercase tracking-[0.15em]"
                            style={{
                                color: color,
                                opacity: 0.6,
                                textShadow: isMobile ? 'none' : `0 0 4px ${color}`
                            }}
                        >
                            {description}
                        </motion.span>
                    )}
                </div>
            </foreignObject>
        </motion.g>
    );
};
