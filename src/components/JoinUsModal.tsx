import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Code, Terminal, MessageSquare } from 'lucide-react';

interface JoinUsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const JoinUsModal = ({ isOpen, onClose }: JoinUsModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
                            transition={{
                                type: "spring",
                                damping: 28,
                                stiffness: 300,
                                duration: 0.6
                            }}
                            className="relative w-full max-w-2xl mx-4 sm:mx-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Main Modal Card */}
                            <div className="relative bg-black/90 rounded-2xl shadow-2xl overflow-hidden border-2 border-cyan-500/50">
                                {/* Top accent line */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-cyan-500 to-purple-500" />

                                {/* Subtle glow background */}
                                <div className="absolute inset-0 opacity-30">
                                    <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl" />
                                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-3xl" />
                                </div>

                                {/* Close Button */}
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 text-cyan-300 hover:text-cyan-100 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full p-2 sm:p-2.5 transition-all border border-cyan-500/40"
                                >
                                    <X size={18} className="sm:w-5 sm:h-5" />
                                </motion.button>

                                <div className="relative z-10 p-6 sm:p-8 space-y-5 sm:space-y-6 max-h-[90vh] overflow-y-auto">
                                    {/* Join INIT Club Intro */}
                                    <div className="text-center pb-4 sm:pb-6 border-b border-cyan-500/30 space-y-2 sm:space-y-3">
                                        <div>
                                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black whitespace-nowrap font-heading">
                                                <span className="text-white">The &lt; </span>
                                                <span
                                                    className="bg-gradient-brand-horizontal bg-clip-text text-transparent"
                                                >
                                                    INIT
                                                </span>
                                                <span className="text-white"> Club /&gt;</span>
                                            </h1>
                                        </div>
                                        <p className="text-xs sm:text-sm font-semibold text-cyan-400 uppercase tracking-widest">Take the first step</p>
                                    </div>

                                    {/* Ready Message */}
                                    <div className="text-center space-y-3 py-3 sm:py-4">
                                        <p className="text-cyan-300 font-semibold text-xs sm:text-sm">Ready to grow with us?</p>
                                        <p className="text-gray-400 text-xs leading-relaxed">
                                            Interested in learning, building, and growing alongside amazing people? Join our community on Discord and let's explore this journey together.
                                        </p>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

                                    {/* Key Requirements - Compact */}
                                    <div className="space-y-2">
                                        <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">What We Look For</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { icon: Users, text: "Student", color: "yellow" },
                                                { icon: Terminal, text: "Self-Reliant", color: "purple" },
                                                { icon: Code, text: "No Copy-Paste", color: "cyan" },
                                                { icon: MessageSquare, text: "Communicative", color: "red" }
                                            ].map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2 bg-black/50 rounded-lg p-2 border border-gray-700/50 hover:border-gray-600 transition-all"
                                                >
                                                    <item.icon size={14} className="text-gray-400 flex-shrink-0" />
                                                    <span className="text-gray-300 text-xs">{item.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <motion.a
                                        href="https://discord.com/invite/Gx8sdGJkU"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative block w-full overflow-hidden rounded-xl font-bold text-center py-3 border border-cyan-500/50"
                                        whileHover="hover"
                                        initial="initial"
                                    >
                                        {/* Laser Fill Animation */}
                                        <motion.div
                                            className="absolute inset-0 z-0 origin-left bg-gradient-brand-horizontal"
                                            variants={{
                                                initial: { scaleX: 0 },
                                                hover: { scaleX: 1 }
                                            }}
                                            transition={{ duration: 0.25, ease: "linear" }}
                                        />

                                        {/* Scanning Line */}
                                        <motion.div
                                            className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8),0_0_20px_rgba(0,255,213,0.5)]"
                                            variants={{
                                                initial: { left: '0%', opacity: 0 },
                                                hover: { left: '100%', opacity: 1 }
                                            }}
                                            transition={{ duration: 0.25, ease: "linear" }}
                                        />

                                        {/* Text Content */}
                                        <span className="relative z-10 text-white transition-colors duration-300 group-hover:text-white">
                                            Join Now
                                        </span>
                                    </motion.a>

                                    {/* Tagline */}
                                    <p className="text-center text-gray-400 text-xs">
                                        Be part of a community dedicated to learning and building together
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default JoinUsModal;