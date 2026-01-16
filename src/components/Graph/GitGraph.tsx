import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DESKTOP_NODES, DESKTOP_EDGES, MOBILE_NODES, MOBILE_EDGES } from './constants';
import { Node } from './Node';
import { Edge } from './Edge';
import { NavNode } from './NavNode';
import { GraphBackground } from './GraphBackground';
import { GitCloneLoader } from './GitCloneLoader';
import { TypewriterText } from './TypewriterText';
import type { GraphNode } from './constants';

export const GitGraph = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [activeEdges, setActiveEdges] = useState<string[]>([]);
    const [highlightColor, setHighlightColor] = useState<string>('#fff');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial call
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const nodes = isMobile ? MOBILE_NODES : DESKTOP_NODES;
    const edges = isMobile ? MOBILE_EDGES : DESKTOP_EDGES;
    const viewBox = isMobile ? "0 0 400 800" : "0 0 1200 800";

    // Helper to find node coordinates
    const getNode = (id: string): GraphNode | undefined => nodes.find(n => n.id === id);

    return (
        <div className="w-full h-screen relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>

            {/* Loading Animation */}
            <AnimatePresence>
                {isLoading && (
                    <GitCloneLoader onComplete={() => setIsLoading(false)} duration={2500} />
                )}
            </AnimatePresence>

            {/* Only render content after loading */}
            {!isLoading && (
                <>
                    <GraphBackground />

                    {/* Hero Title */}
                    <motion.div
                        className="absolute top-[8%] sm:top-[10%] left-[3%] right-[3%] sm:left-[5%] md:left-[10%] z-10 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tighter break-words" style={{ color: 'var(--text)' }}>
                            <TypewriterText text="The INIT Club" delay={0.3} speed={0.08} />
                        </h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 1 }}
                            className="text-[#00ffd5] font-mono text-xs sm:text-sm mt-2 break-words"
                        >
                            &gt; git commit -m "start_legacy"
                        </motion.p>
                    </motion.div>

                    <svg
                        width="100%"
                        height="100%"
                        viewBox={viewBox}
                        preserveAspectRatio="xMidYMid meet"
                        className="max-w-7xl mx-auto px-2"
                    >
                        {/* Render Edges first so lines are behind nodes */}
                        {edges.map(edge => {
                            const fromNode = getNode(edge.from);
                            const toNode = getNode(edge.to);

                            if (!fromNode || !toNode) return null;

                            const isHighlighted = activeEdges.includes(edge.id);

                            return (
                                <Edge
                                    key={edge.id}
                                    id={edge.id}
                                    x1={fromNode.x}
                                    y1={fromNode.y}
                                    x2={toNode.x}
                                    y2={toNode.y}
                                    delay={edge.delay}
                                    duration={edge.duration}
                                    color={isHighlighted ? highlightColor : edge.color || '#555555'}
                                    isHighlighted={isHighlighted}
                                    label={edge.label}
                                />
                            );
                        })}

                        {/* Render Nodes */}
                        {nodes.map(node => {
                            if (node.type === 'nav') {
                                return (
                                    <NavNode
                                        key={node.id}
                                        x={node.x}
                                        y={node.y}
                                        label={node.label || ''}
                                        path={node.path || '/'}
                                        delay={node.delay || 0}
                                        description={node.description}
                                        color={node.color}
                                        onMouseEnter={() => {
                                            if (node.activePath) {
                                                setActiveEdges(node.activePath);
                                                if (node.color) setHighlightColor(node.color);
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            setActiveEdges([]);
                                            setHighlightColor('#fff');
                                        }}
                                    />
                                );
                            }

                            return (
                                <Node
                                    key={node.id}
                                    x={node.x}
                                    y={node.y}
                                    type={node.type}
                                    delay={node.delay || 0}
                                    color={node.color}
                                />
                            );
                        })}
                    </svg>

                    {/* Scroll Connector Line */}
                    <motion.div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-24 w-[1px] bg-gradient-to-b from-transparent via-[#00ffd5]/50 to-[#00ffd5]"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 96, opacity: 1 }}
                        transition={{ delay: 3, duration: 1, ease: "easeOut" }}
                    />
                    <motion.div
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#00ffd5]/50 text-[10px] font-mono"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ delay: 4, duration: 2, repeat: Infinity }}
                    >
                        scroll
                    </motion.div>
                </>
            )}
        </div>
    );
};
