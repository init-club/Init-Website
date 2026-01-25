import { motion } from 'framer-motion';
import { Edge } from '../components/Graph/Edge';
import { Node } from '../components/Graph/Node';
import { useNavigate } from 'react-router-dom';
import { GraphBackground } from '../components/Graph/GraphBackground';
import { GlitchText } from '../components/Graph/GlitchText';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="w-full min-h-screen relative overflow-hidden flex flex-col items-center justify-center text-center px-4" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
            <GraphBackground />

            {/* Red glowing orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#ff3366]/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Git graph visualization */}
            <svg width="100%" height="150" viewBox="0 0 500 150" className="mb-8 sm:mb-12 relative z-10 max-w-full" preserveAspectRatio="xMidYMid meet">
                <Edge
                    id="404-e1"
                    x1={50} y1={75}
                    x2={200} y2={75}
                    delay={0.2}
                    duration={0.6}
                    color="#ffffff"
                    isHighlighted={true}
                />
                <Edge
                    id="404-e2"
                    x1={200} y1={75}
                    x2={430} y2={75}
                    delay={0.6}
                    duration={0.8}
                    color="#ff3366"
                    isHighlighted={true}
                    label="ERROR"
                />

                <Node x={50} y={75} type="start" delay={0} color="#ffffff" />
                <Node x={200} y={75} type="commit" delay={0.6} color="#ffffff" />
                <Node x={430} y={75} type="commit" delay={1.2} color="#ff3366" />
            </svg>


            {/* Text Section */}
            <div className="relative z-10 px-4 max-w-full mt-8 mb-8">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.0 }}
                    className="text-xl sm:text-3xl md:text-6xl font-black mb-6 font-mono tracking-tighter break-words"
                    style={{ color: 'var(--text)' }}
                >
                    PAGE STATUS: <span className="text-[#ff3366] block sm:inline">
                        <GlitchText text="404_NOT_FOUND" delay={2.3} />
                    </span>
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 2.5 }}
                    className="space-y-2 mb-8"
                >
                    <p className="text-[#ff3366]/80 font-mono text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] break-words">
                        Branch: dead-end
                    </p>
                    <p className="font-mono text-xs max-w-md mx-auto leading-relaxed px-4" style={{ color: 'var(--muted)' }}>
                        The requested path does not exist in this repository. <br />
                        This branch has been terminated.
                    </p>
                </motion.div>
            </div>

            {/* Return button */}
            <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.5 }}
                onClick={() => navigate('/')}
                className="mt-8 group relative z-10"
            >
                <div className="absolute -inset-1 bg-gradient-to-r from-[#ff3366] to-[#ff6b6b] rounded blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                <div className="relative px-6 sm:px-8 py-3 border border-white/10 rounded-sm leading-none flex items-center" style={{ backgroundColor: 'var(--bg)' }}>
                    <span className="text-[10px] sm:text-xs font-mono text-[#ff3366] group-hover:text-white transition duration-200 uppercase tracking-[0.15em] sm:tracking-[0.2em] whitespace-nowrap">
                        Return to Source (Main)
                    </span>
                </div>
            </motion.button>
        </div >
    );
}
