import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';

interface ComingSoonProps {
    pageName: string;
}
export default function ComingSoon({ pageName }: ComingSoonProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] relative px-4">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="glass relative z-10 p-8 md:p-14 rounded-[2rem] max-w-2xl w-full border border-white/10 shadow-2xl overflow-hidden"
            >
                {/* Animated Background Elements inside card */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Main Icon */}
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full" />
                        <motion.div
                            animate={{ rotate: [0, 10, 0, -10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="relative bg-gradient-to-br from-cyan-900/50 to-teal-900/50 p-6 rounded-2xl border border-white/10 shadow-inner"
                        >
                            <Construction className="w-16 h-16 text-cyan-400" />
                        </motion.div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
                        <span className="bg-gradient-to-r from-cyan-200 via-teal-200 to-white bg-clip-text text-transparent">
                            {pageName}
                        </span>
                    </h1>

                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-cyan-500/50" />
                        <span className="text-cyan-400 font-mono text-sm tracking-widest uppercase">Under Construction</span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-cyan-500/50" />
                    </div>

                    <p className="text-lg text-[var(--text)]/80 max-w-md mx-auto leading-relaxed mb-10">
                        Our team is currently diving deep to build this page.
                        Check back soon for something amazing!
                    </p>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="group relative px-8 py-3 rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-teal-600 opacity-90 transition-opacity group-hover:opacity-100" />
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 opacity-0 group-hover:opacity-20 blur-md transition-opacity" />
                        <div className="relative flex items-center gap-2 text-white font-semibold">
                            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                            <span>Return Home</span>
                        </div>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
