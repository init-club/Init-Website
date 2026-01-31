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

export const Node = ({ x, y, type, delay, color = '#94a3b8' }: NodeProps) => {
    const radius = type === 'start' ? 8 : 5;
    const [, setIsHovered] = useState(false);

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
                fill={color}
                stroke="none"
                whileHover={{ scale: 1.5 }}
                transition={{ duration: 0.2 }}
            />
        </motion.g>
    );
};
