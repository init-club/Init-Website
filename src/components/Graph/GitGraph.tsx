import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Linkedin } from 'lucide-react';
import { DESKTOP_NODES, DESKTOP_EDGES, MOBILE_NODES, MOBILE_EDGES } from './constants';
import { Node } from './Node';
import { Edge } from './Edge';
import { NavNode } from './NavNode';
import { GraphBackground } from './GraphBackground';
import { GitCloneLoader } from './GitCloneLoader';
import { TypewriterText } from './TypewriterText';
import type { GraphNode } from './constants';

export const GitGraph = () => {
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [activeEdges, setActiveEdges] = useState<string[]>([]);
    const [highlightColor, setHighlightColor] = useState<string>('#fff');
    // Check checking session storage for loader
    const [shouldShowLoader] = useState(() => {
        return !sessionStorage.getItem('has_seen_intro');
    });

    const [isLoading, setIsLoading] = useState(shouldShowLoader);

    // Only skip animations if loader is not shown
    const skipAnimation = !shouldShowLoader;

    const [, forceUpdate] = useState({});

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial call
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Force re-render when theme changes
    useEffect(() => {
        const observer = new MutationObserver(() => {
            forceUpdate({});
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
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
                    <GitCloneLoader
                        onComplete={() => {
                            setIsLoading(false);
                            sessionStorage.setItem('has_seen_intro', 'true');
                        }}
                        duration={2500}
                    />
                )}
            </AnimatePresence>

            {/* Only render content after loading */}
            {!isLoading && (
                <>
                    <GraphBackground isMobile={isMobile} />

                    {/* Hero Title */}
                    <motion.div
                        className="absolute top-[5%] sm:top-[4%] w-full left-0 md:left-[10%] md:w-auto md:text-left text-center z-10 pointer-events-none px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: skipAnimation ? 0 : 0.5 }}
                    >
                        {/* Title with gradient "INIT" */}
                        <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tighter break-words" style={{ fontFamily: 'var(--font-heading)' }}>
                            <span style={{ color: 'var(--text)' }}>
                                <TypewriterText text="The < " delay={skipAnimation ? 0 : 0.3} speed={skipAnimation ? 0 : 0.08} />
                            </span>
                            <span
                                style={{
                                    background: 'linear-gradient(90deg, #00ffd5, #a855f7)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    display: 'inline-block'
                                }}
                            >
                                <TypewriterText text="INIT" delay={skipAnimation ? 0 : 0.62} speed={skipAnimation ? 0 : 0.08} />
                            </span>
                            <span style={{ color: 'var(--text)' }}>
                                <TypewriterText text=" Club />" delay={skipAnimation ? 0 : 0.94} speed={skipAnimation ? 0 : 0.08} />
                            </span>
                        </h1>

                        {/* Tagline - larger and bolder */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: skipAnimation ? 0 : 1.5 }}
                            className="text-[var(--muted)] text-xs sm:text-sm md:text-base mt-3 break-words font-semibold tracking-wide"
                        >
                            Amrita CBE's Open Source Community
                        </motion.p>

                        {/* Motto with pulsing glow and code formatting */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: skipAnimation ? 0 : 2 }}
                            className="text-[#00ffd5] font-mono text-xs sm:text-sm mt-4 break-words pointer-events-auto cursor-default tracking-wider"
                            style={{
                                fontFamily: 'var(--font-mono)',
                                textShadow: '0 0 10px rgba(0, 255, 213, 0.5), 0 0 20px rgba(0, 255, 213, 0.3)',
                                animation: 'pulse-glow 3s ease-in-out infinite'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.textShadow = '0 0 15px rgba(0, 255, 213, 0.8), 0 0 30px rgba(0, 255, 213, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.textShadow = '0 0 10px rgba(0, 255, 213, 0.5), 0 0 20px rgba(0, 255, 213, 0.3)';
                            }}
                        >
                            &gt; git commit -m "<span className="text-white" style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.4)' }}>Where Curiosity Turns into Contribution</span>"
                        </motion.p>

                        {/* Mobile Socials in Hero */}
                        <div className="md:hidden flex items-center justify-center gap-10 mt-6 pointer-events-auto">
                            {[{ label: 'LinkedIn', href: 'https://www.linkedin.com', icon: Linkedin }, { label: 'Instagram', href: 'https://www.instagram.com/the.init.club?igsh=MTFlcWg1eWIyMTNyaA==', icon: Instagram }].map((social, index) => (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 2.5 + (index * 0.1) }}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg glass transition-all duration-300"
                                    style={{ color: 'var(--text)' }}
                                    aria-label={social.label}
                                >
                                    <social.icon size={20} />
                                </motion.a>
                            ))}
                        </div>
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
                                    delay={skipAnimation ? 0 : edge.delay}
                                    duration={skipAnimation ? 0 : edge.duration}
                                    color={isHighlighted ? highlightColor : edge.color || toNode?.color || '#555555'}
                                    isHighlighted={isHighlighted}
                                    label={edge.label}
                                    labelDy={edge.labelDy}
                                    labelOffset={edge.labelOffset}
                                    labelAnchor={edge.labelAnchor}
                                    isMobile={isMobile}
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
                                        delay={skipAnimation ? 0 : (node.delay || 0)}
                                        description={node.description}
                                        color={node.color}
                                        align={node.align}
                                        isMobile={isMobile}
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
                                    delay={skipAnimation ? 0 : (node.delay || 0)}
                                    color={node.color}
                                />
                            );
                        })}
                    </svg>

                    {/* Scroll Connector Line - Desktop Only */}
                    {!isMobile && (
                        <>
                            <motion.div
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-24 w-[1px] bg-gradient-to-b from-transparent via-[#00ffd5]/50 to-[#00ffd5]"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 96, opacity: 1 }}
                                transition={{ delay: skipAnimation ? 0 : 3, duration: 1, ease: "easeOut" }}
                            />
                            <motion.div
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#00ffd5]/50 text-[10px] font-mono"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ delay: skipAnimation ? 0 : 4, duration: 2, repeat: Infinity }}
                            >
                                scroll
                            </motion.div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};
