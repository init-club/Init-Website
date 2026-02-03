import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Code, Terminal, MessageSquare, Github, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient'; 

interface JoinUsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const JoinUsModal = ({ isOpen, onClose }: JoinUsModalProps) => {
    const [isLoading, setIsLoading] = useState(false);

    
    const handleGithubLogin = async () => {
        try {
            setIsLoading(true);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    
                    redirectTo: window.location.origin, 
                },
            });

            if (error) throw error;
        } catch (error: any) {
            console.error('Login error:', error.message);
            alert('Failed to login with GitHub. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
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
                                <div className="absolute inset-0 opacity-30 pointer-events-none">
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
                                    {/* Header Section */}
                                    <div className="text-center pb-4 sm:pb-6 border-b border-cyan-500/30 space-y-2 sm:space-y-3">
                                        <div>
                                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black whitespace-nowrap font-heading">
                                                <span className="text-white">The &lt; </span>
                                                <span className="bg-gradient-brand-horizontal bg-clip-text text-transparent">
                                                    INIT
                                                </span>
                                                <span className="text-white"> Club /&gt;</span>
                                            </h1>
                                        </div>
                                        <p className="text-xs sm:text-sm font-semibold text-cyan-400 uppercase tracking-widest">
                                            Member Access Portal
                                        </p>
                                    </div>

                                    {/* Intro Message */}
                                    <div className="text-center space-y-3 py-2">
                                        <p className="text-cyan-300 font-semibold text-xs sm:text-sm">
                                            Already a Member?
                                        </p>
                                        <p className="text-gray-400 text-xs leading-relaxed max-w-md mx-auto">
                                            Login with your GitHub account to access the Idea Wall, Leaderboard, and manage your profile.
                                        </p>
                                    </div>

                                    {/* --- PRIMARY ACTION: GITHUB LOGIN --- */}
                                    <div className="space-y-4">
                                        <motion.button
                                            onClick={handleGithubLogin}
                                            disabled={isLoading}
                                            className="group relative block w-full overflow-hidden rounded-xl font-bold text-center py-4 border border-cyan-500/50 bg-black/50 hover:bg-cyan-950/30 transition-all"
                                            whileHover="hover"
                                            initial="initial"
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {/* Button Background Animation */}
                                            <motion.div
                                                className="absolute inset-0 z-0 origin-left bg-gradient-brand-horizontal opacity-20"
                                                variants={{
                                                    initial: { scaleX: 0 },
                                                    hover: { scaleX: 1 }
                                                }}
                                                transition={{ duration: 0.3, ease: "linear" }}
                                            />
                                            
                                            {/* Button Content */}
                                            <div className="relative z-10 flex items-center justify-center gap-3 text-white">
                                                {isLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Connecting...
                                                    </span>
                                                ) : (
                                                    <>
                                                        <Github size={20} />
                                                        <span>Login with GitHub</span>
                                                    </>
                                                )}
                                            </div>
                                        </motion.button>

                                        {/* Divider */}
                                        <div className="flex items-center gap-4">
                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-700" />
                                            <span className="text-xs text-gray-500 uppercase font-mono">Or</span>
                                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-700" />
                                        </div>

                                        {/* Secondary Action: Discord Join */}
                                        <a 
                                            href="https://discord.com/invite/Gx8sdGJkU"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-700 hover:border-purple-500/50 hover:bg-purple-900/20 text-gray-400 hover:text-white transition-all text-sm font-medium"
                                        >
                                            <span>New here? Join our Discord</span>
                                            <ArrowRight size={14} />
                                        </a>
                                    </div>

                                    {/* Requirements Grid (Kept for aesthetic/info) */}
                                    <div className="pt-4 border-t border-cyan-500/30">
                                        <p className="text-cyan-400 text-[10px] font-semibold uppercase tracking-wider mb-3 text-center">
                                            Community Values
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { icon: Users, text: "Student First", color: "yellow" },
                                                { icon: Terminal, text: "Self-Reliant", color: "purple" },
                                                { icon: Code, text: "No Copy-Paste", color: "cyan" },
                                                { icon: MessageSquare, text: "Open Comms", color: "red" }
                                            ].map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2 bg-black/50 rounded-lg p-2 border border-gray-800 hover:border-gray-600 transition-all"
                                                >
                                                    <item.icon size={12} className="text-gray-500 flex-shrink-0" />
                                                    <span className="text-gray-400 text-[10px]">{item.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

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