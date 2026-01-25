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
                            <div className="relative bg-[#050505]/95 rounded-2xl shadow-2xl overflow-hidden border border-[#D4AF37]/50">
                                {/* Top accent line */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#C0C0C0] to-[#CD7F32]" />

                                {/* Subtle glow background */}
                                <div className="absolute inset-0 opacity-30">
                                    <div className="absolute top-20 right-0 w-96 h-96 bg-[#D4AF37]/10 blur-3xl" />
                                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C0C0C0]/10 blur-3xl" />
                                </div>

                                {/* Close Button */}
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 text-[#D4AF37] hover:text-[#E5E5E5] bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full p-2 sm:p-2.5 transition-all border border-[#D4AF37]/30"
                                >
                                    <X size={18} className="sm:w-5 sm:h-5" />
                                </motion.button>

                                <div className="relative z-10 p-6 sm:p-8 space-y-5 sm:space-y-6 max-h-[90vh] overflow-y-auto">
                                    {/* Join INIT Club Intro */}
                                    <div className="text-center pb-4 sm:pb-6 border-b border-[#D4AF37]/30 space-y-2 sm:space-y-3">
                                        <div>
                                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black whitespace-nowrap" style={{ fontFamily: 'var(--font-heading)' }}>
                                                <span className="text-white">The &lt; </span>
                                                <span
                                                    style={{
                                                        background: 'linear-gradient(90deg, #ff6b35, #d32f2f)',
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent',
                                                        backgroundClip: 'text',
                                                    }}
                                                >
                                                    INIT
                                                </span>
                                                <span className="text-white"> Club /&gt;</span>
                                            </h1>
                                        </div>
                                        <p className="text-xs sm:text-sm font-semibold text-[#D4AF37] uppercase tracking-widest">Take the first step</p>
                                        <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#E5E5E5] via-white to-[#E5E5E5]">
                                            INITIATE <span className="text-[#D4AF37]">YOURSELF</span>
                                        </h2>
                                        <p className="text-[#C0C0C0] font-semibold text-xs sm:text-sm">Ready to prove yourself?</p>
                                        <p className="text-gray-400 text-xs leading-relaxed">
                                            Meet the requirements? Hungry to challenge yourself with real problems and grow as a developer? Then you belong here. Join us on Discord.
                                        </p>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />

                                    {/* Key Requirements - Compact */}
                                    <div className="space-y-3 sm:space-y-4">
                                        <p className="text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">What We Look For</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { icon: Users, text: "Student", color: "yellow" },
                                                { icon: Terminal, text: "Self-Reliant", color: "gray" },
                                                { icon: Code, text: "No Copy-Paste", color: "yellow" },
                                                { icon: MessageSquare, text: "Communicative", color: "gray" }
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
                                    <a
                                        href="https://discord.com/invite/Gx8sdGJkU"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full px-8 py-3 border border-[#D4AF37]/50 text-[#D4AF37] font-mono uppercase text-center
                                                 hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
                                    >
                                        <span className="relative z-10">
                                            Join Now
                                        </span>
                                    </a>

                                    {/* Tagline */}
                                    <p className="text-center text-gray-400 text-xs">
                                        Test your problem-solving skills and join our community
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )
            }
        </AnimatePresence >
    );
};

export default JoinUsModal;