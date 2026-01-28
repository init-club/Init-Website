import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface Props {
  title: string;
  desc: string;
  icon: LucideIcon;
  delay?: number;
}

const ParallaxCard: React.FC<Props> = ({ title, desc, icon: Icon, delay = 0 }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !contentRef.current || !glowRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;

    // Calculate rotation
    const rotateY = ((x - midX) / midX) * 20; // Increased rotation for more 3D feel
    const rotateX = -((y - midY) / midY) * 20;

    // Apply transforms
    // 1. Main Card Rotation
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;

    // 2. Internal Content Pop (Parallax)
    contentRef.current.style.transform = `translateZ(60px)`;

    // 3. Volumetric Backlight (Opposite movement for depth)
    const glowX = ((x - midX) / midX) * -25;
    const glowY = ((y - midY) / midY) * -25;
    glowRef.current.style.transform = `translate3d(${glowX}px, ${glowY}px, -50px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current || !contentRef.current || !glowRef.current) return;
    setIsHovered(false);

    // Reset EVERYTHING
    cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    contentRef.current.style.transform = "translateZ(0px)";
    glowRef.current.style.transform = "translate3d(0, 0, 0)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: delay, ease: "easeOut" }}
      className="relative w-full h-full"
      style={{ perspective: "1000px" }} // Parent perspective
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-full transition-all duration-200 ease-out preserve-3d group"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* ================= VOLUMETRIC BACKLIGHT ================= */}
        {/* This sits physically behind the card in 3D space */}
        <div
          ref={glowRef}
          className="absolute inset-4 rounded-xl bg-gradient-to-br from-white/20 via-cyan-500/20 to-purple-500/20 blur-[40px] transition-all duration-300 opacity-30 group-hover:opacity-100 will-change-transform"
          style={{ transform: "translateZ(-50px)" }}
        />

        {/* ================= GLASS CARD SURFACE ================= */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_-5px_25px_rgba(255,255,255,0.05)] overflow-hidden group-hover:border-cyan-500/30 transition-colors duration-300">
          {/* Surface Glare Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </div>

        {/* ================= FLOATING CONTENT LAYER ================= */}
        {/* This layer floats ABOVE the glass surface */}
        <div
          ref={contentRef}
          className="relative p-8 h-full flex flex-col transition-all duration-200 ease-out"
          style={{ transform: "translateZ(0px)" }}
        >
          {/* Glow Effects - Stronger resting glow */}
          <div
            className="absolute -inset-px opacity-40 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
            style={{
              background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0, 255, 213, 0.2), transparent 40%)`
            }}
          />

          {/* Top Gradient accent - Clearer by default */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Icon Box - Plain floating icon */}
          <div className="relative mb-4 group-hover:scale-110 transition-transform duration-300">
            <Icon
              className={`w-10 h-10 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300 ${isHovered ? 'drop-shadow-[0_0_8px_rgba(0,255,213,0.8)]' : ''}`}
              strokeWidth={1.5}
            />
          </div>

          <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-300 transition-colors duration-300 tracking-wide">
            {title}
          </h3>

          <p className="text-muted text-sm leading-relaxed group-hover:text-white/80 transition-colors duration-300">
            {desc}
          </p>

          {/* Bottom Active Indicator */}
          <div className="mt-auto pt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
            <div className="h-[2px] w-8 bg-cyan-400 rounded-full" />
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Active</span>
          </div>

          {/* Bottom Corner decoration - Highly visible */}
          <div className="absolute bottom-4 right-4 opacity-80 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M19 19L14 19M19 19L19 14" stroke="currentColor" className="text-cyan-400/50 group-hover:text-[#00ffd5]" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ParallaxCard;
