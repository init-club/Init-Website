import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SystemAlert = () => {
    const [isVisible, setIsVisible] = useState(true);
    const navigate = useNavigate();

    if (!isVisible) return null;

    // Reusable block of marquee text
    const MarqueeContent = () => (
        <div className="flex items-center shrink-0">
            {[...Array(8)].map((_, i) => (
                <span key={i} className="flex items-center px-8 text-red-500 font-mono text-sm font-bold tracking-widest whitespace-nowrap">
                    INDUCTION PHASE: CLICK TO KNOW MORE
                </span>
            ))}
        </div>
    );

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="sticky top-0 z-[60] bg-black border-b border-red-900/50 cursor-pointer group"
            onClick={() => navigate('/contact')}
        >
            <div className="relative flex items-center h-10 overflow-hidden">
                {/* Marquee Wrapper */}
                <div className="flex-1 overflow-hidden relative flex items-center select-none">
                    <motion.div
                        className="flex"
                        animate={{ x: "-50%" }}
                        transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 60
                        }}
                    >
                        <MarqueeContent />
                        <MarqueeContent />
                    </motion.div>
                </div>

                {/* Close Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsVisible(false);
                    }}
                    className="flex-shrink-0 px-4 h-full flex items-center hover:bg-white/5 transition-colors z-10 bg-black border-l border-red-900/30"
                >
                    <X className="text-red-500/50 hover:text-red-500" size={14} />
                </button>
            </div>
        </motion.div>
    );
};

export default SystemAlert;
