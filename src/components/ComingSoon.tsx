import { motion } from 'framer-motion';
import { Edge } from './Graph/Edge';
import { Node } from './Graph/Node';
import { useNavigate } from 'react-router-dom';
import { GraphBackground } from './Graph/GraphBackground';
import { GlitchText } from './Graph/GlitchText';

interface ComingSoonProps {
    pageName: string;
}

export const ComingSoon = ({ pageName }: ComingSoonProps) => {
    const navigate = useNavigate();

    return (
        <div className="w-full h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center text-center">
            <GraphBackground />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00ffd5]/5 rounded-full blur-[120px] pointer-events-none" />

            <svg width="500" height="150" viewBox="0 0 500 150" className="mb-12 relative z-10">

                <Edge
                    id="cs-e1"
                    x1={50} y1={75}
                    x2={200} y2={75}
                    delay={0.2}
                    duration={0.6}
                    color="#ffffff"
                    isHighlighted={true}
                />
                <Edge
                    id="cs-e2"
                    x1={200} y1={75}
                    x2={430} y2={75}
                    delay={0.6}
                    duration={0.8}
                    color="#00ffd5"
                    isHighlighted={true}
                    label="DEVELOPMENT"
                />

                <Node x={50} y={75} type="start" delay={0} color="#ffffff" />
                <Node x={200} y={75} type="commit" delay={0.6} color="#ffffff" />
                <Node x={430} y={75} type="commit" delay={1.2} color="#00ffd5" />
            </svg>

            <div className="relative z-10 px-4">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    className="text-3xl md:text-6xl font-black text-white mb-6 font-mono tracking-tighter"
                >
                    PAGE_STATUS: <span className="text-[#00ffd5]">
                        <GlitchText text="UNDER_CONSTRUCTION" delay={1.8} />
                    </span>
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 2.0 }}
                    className="space-y-2"
                >
                    <p className="text-[#00ffd5]/80 font-mono text-sm uppercase tracking-[0.3em]">
                        Branch: {pageName.toLowerCase().replace(' ', '-')}
                    </p>
                    <p className="text-slate-500 font-mono text-xs max-w-md mx-auto leading-relaxed">
                        The requested feature is currently being compiled. <br />
                        Access will be granted once the merge is complete.
                    </p>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.5 }}
                    onClick={() => navigate('/')}
                    className="mt-16 group relative"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#00ffd5] to-[#2979ff] rounded blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                    <div className="relative px-8 py-3 bg-black border border-white/10 rounded-sm leading-none flex items-center">
                        <span className="text-xs font-mono text-[#00ffd5] group-hover:text-white transition duration-200 uppercase tracking-[0.2em]">
                            Return to Source (Main)
                        </span>
                    </div>
                </motion.button>
            </div>

        </div>
    );
};
