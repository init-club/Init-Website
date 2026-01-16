import { motion } from 'framer-motion';
import { useState } from 'react';
import type { NodeType } from './constants';

interface NodeProps {
    x: number;
    y: number;
    type: NodeType;
    delay: number;
    color?: string;
}

export const Node = ({ x, y, type, delay, color = '#94a3b8', commitMessage }: NodeProps & { commitMessage?: string }) => {
    const radius = type === 'start' ? 8 : 5;
    const isStart = type === 'start';
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
                delay: delay,
                duration: 0.3,
                ease: "easeOut"
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="cursor-pointer"
        >
            {/* Simple clean node */}
            <motion.circle
                cx={x}
                cy={y}
                r={radius}
                fill={isStart ? '#ffffff' : color}
                stroke="none"
                whileHover={{ scale: 1.5 }}
                transition={{ duration: 0.2 }}
            />

            {/* Hover Tooltip */}
            {(isHovered && commitMessage) && (
                <foreignObject x={x + 15} y={y - 15} width="200" height="40" className="pointer-events-none overflow-visible">
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-[10px] font-mono px-2 py-1 rounded shadow-xl whitespace-nowrap z-50 flex items-center gap-2"
                    >
                        <span className="text-emerald-500 font-bold">&gt;</span>
                        {commitMessage}
                    </motion.div>
                </foreignObject>
            )}
        </motion.g>
    );
};
