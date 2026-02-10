import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SystemAlert = () => {
    const [isVisible, setIsVisible] = useState(true);
    const navigate = useNavigate();

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="sticky top-0 z-[60] bg-black border-b border-red-900/50 cursor-pointer group"
            onClick={() => navigate('/contact')}
        >
            <div className="relative flex items-center h-10 overflow-hidden">
                {/* Marquee Container */}
                <div className="flex-1 overflow-hidden relative flex items-center">
                    <motion.div
                        className="whitespace-nowrap flex items-center gap-12 text-red-500 font-mono text-xs font-bold tracking-widest"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 40
                        }}
                    >
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <span key={i} className="flex items-center gap-12">
                                <span>INDUCTION PHASE 1: CLICK TO KNOW MORE</span>
                            </span>
                        ))}
                    </motion.div>
                </div>

                {/* Close Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsVisible(false);
                    }}
                    className="flex-shrink-0 px-4 h-full flex items-center hover:bg-white/5 transition-colors z-10"
                >
                    <X className="text-red-500/50 hover:text-red-500" size={14} />
                </button>
            </div>
        </motion.div>
    );
};

export default SystemAlert;
