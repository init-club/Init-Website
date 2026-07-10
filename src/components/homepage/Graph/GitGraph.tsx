import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Linkedin } from 'lucide-react';
import Discord from '../../shared/icons/DiscordIcon';
import { DESKTOP_NODES, DESKTOP_EDGES, MOBILE_NODES, MOBILE_EDGES } from './constants';
import { Node } from './Node';
import { Edge } from './Edge';
import { NavNode } from './NavNode';
import { GraphBackground } from './GraphBackground';
import { GitCloneLoader } from './GitCloneLoader';
import { TypewriterText } from '../../shared/ui/TypewriterText';
import type { GraphNode } from './constants';
import AuthButtons from '../../layout/AuthButtons';
import { useLenis } from '../../layout/SmoothScroll';

export const GitGraph = () => {
    const lenis = useLenis();
    const graphRef = useRef<SVGSVGElement>(null);
    const mobileLoginRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const [activeEdges, setActiveEdges] = useState<string[]>([]);
    const [highlightColor, setHighlightColor] = useState<string>('#fff');
    const [mobileLoginMask, setMobileLoginMask] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    // Check checking session storage for loader
    const [shouldShowLoader] = useState(() => {
        return !sessionStorage.getItem('has_seen_intro');
    });

    const [isLoading, setIsLoading] = useState(shouldShowLoader);

    const syncMobileLoginMask = () => {
        const svg = graphRef.current;
        const login = mobileLoginRef.current;

        if (!isMobile || isLoading || !svg || !login) {
            setMobileLoginMask(current => current ? null : current);
            return;
        }

        const svgBounds = svg.getBoundingClientRect();
        const loginBounds = login.getBoundingClientRect();
        const viewBox = svg.viewBox.baseVal;
        const padding = 3;
        const maskShiftUp = 63 * (viewBox.height / svgBounds.height);
        const nextMask = {
            x: ((loginBounds.left - svgBounds.left) / svgBounds.width) * viewBox.width + viewBox.x - padding,
            y: ((loginBounds.top - svgBounds.top) / svgBounds.height) * viewBox.height + viewBox.y - padding - maskShiftUp,
            width: (loginBounds.width / svgBounds.width) * viewBox.width + padding * 2,
            height: (loginBounds.height / svgBounds.height) * viewBox.height + padding * 2,
        };

        setMobileLoginMask(current => {
            if (current && Object.keys(nextMask).every(key => Math.abs(current[key as keyof typeof current] - nextMask[key as keyof typeof nextMask]) < 0.1)) {
                return current;
            }
            return nextMask;
        });
    };

    useEffect(() => {
        if (isLoading) {
            lenis?.stop();
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
        } else {
            lenis?.start();
            document.body.style.overflow = 'unset';
            document.body.style.height = 'unset';
        }
        return () => {
            lenis?.start();
            document.body.style.overflow = 'unset';
            document.body.style.height = 'unset';
        };
    }, [isLoading, lenis]);

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


    useEffect(() => {
        if (!isMobile || isLoading || !graphRef.current || !mobileLoginRef.current) return;

        const observer = new ResizeObserver(syncMobileLoginMask);
        observer.observe(graphRef.current);
        observer.observe(mobileLoginRef.current);
        window.addEventListener('resize', syncMobileLoginMask);
        syncMobileLoginMask();

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', syncMobileLoginMask);
        };
    }, [isLoading, isMobile]);

    // A CSS top offset changes position without changing element size.
    useLayoutEffect(() => {
        syncMobileLoginMask();
    });

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
    const viewBox = isMobile ? "-50 0 500 1000" : "0 0 1200 800";

    // Helper to find node coordinates
    const getNode = (id: string): GraphNode | undefined => nodes.find(n => n.id === id);

    return (
        <div className="w-full h-screen relative overflow-hidden flex items-center justify-center pb-24 md:pb-0" style={{ color: 'var(--text)' }}>

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
                    {!isMobile && (
                        <motion.div
                            className="absolute top-6 right-6 z-30"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: skipAnimation ? 0 : 0.5, delay: skipAnimation ? 0 : 0.2 }}
                        >
                            <AuthButtons />
                        </motion.div>
                    )}

                    <GraphBackground isMobile={isMobile} />
                    {/* Hero Title */}
                    <motion.div
                        className="absolute top-[5%] sm:top-[4%] w-full left-0 md:left-[2%] md:w-auto md:text-left text-center z-10 pointer-events-none px-4"
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

                        {isMobile && (
                            <div className="relative mx-auto mt-4 h-[104px] w-full pointer-events-auto">
                                <motion.div
                                    ref={mobileLoginRef}
                                    className="absolute inset-x-0 top-[65px] z-20 flex justify-center"
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0, duration: 0.4 }}
                                >
                                    <AuthButtons variant="outline" />
                                </motion.div>

                                <motion.div
                                    className="absolute inset-x-0 top-[-8px] z-20 flex items-center justify-center gap-5"
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: skipAnimation ? 0 : 2.4, duration: 0.4 }}
                                >
                                    {[{ label: 'LinkedIn', href: 'https://www.linkedin.com/company/the-init-club/', icon: Linkedin }, { label: 'Instagram', href: 'https://www.instagram.com/the.init.club?igsh=MTFlcWg1eWIyMTNyaA==', icon: Instagram }, { label: 'Discord', href: 'https://discord.gg/Gx8sdGJkU', icon: Discord }].map((social, index) => (
                                        <motion.a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            initial={{ opacity: 0, y: -2 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: skipAnimation ? 0 : 2.5 + (index * 0.08) }}
                                            className="flex h-10 w-10 items-center justify-center rounded-lg glass transition-all duration-300"
                                            style={{ color: 'var(--text)', backgroundColor: 'var(--bg)' }}
                                            aria-label={social.label}
                                        >
                                            <social.icon size={20} />
                                        </motion.a>
                                    ))}
                                </motion.div>
                            </div>
                        )}

                    </motion.div>

                    <svg
                        ref={graphRef}
                        width="100%"
                        height={isMobile ? "auto" : "100%"}
                        viewBox={viewBox}
                        preserveAspectRatio="xMidYMin meet"
                        className="w-full max-w-8xl px-2 mt-24 md:mt-0 pt-20 md:pt-0"
                    >
                        {isMobile && mobileLoginMask && (
                            <defs>
                                <mask
                                    id="mobile-login-graph-mask"
                                    maskUnits="userSpaceOnUse"
                                    maskContentUnits="userSpaceOnUse"
                                >
                                    <rect x="-50" y="0" width="500" height="1000" fill="white" />
                                    <rect
                                        x={mobileLoginMask.x}
                                        y={mobileLoginMask.y}
                                        width={mobileLoginMask.width}
                                        height={mobileLoginMask.height}
                                        rx="14"
                                        fill="black"
                                    />
                                </mask>
                            </defs>
                        )}
                        <g mask={isMobile && mobileLoginMask ? 'url(#mobile-login-graph-mask)' : undefined}>
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
                        </g>
                    </svg>



                    {/* Mobile socials now rendered within hero block above */}
                </>
            )}
        </div>
    );
};
