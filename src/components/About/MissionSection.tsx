import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Abhijith from '../assets/abhijith.jpg';
import Group from '../assets/group.jpg';
import Selfie from '../assets/Selfie.jpg';
import Pic1 from '../assets/pic1.png';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const stackImages = [
  Group,
  Selfie,
  Pic1,
  Abhijith,
];

const AnimatedImageStack = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % stackImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Calculate positions for stacked effect
  const getStackPosition = (index: number) => {
    const relativeIndex = (index - activeIndex + stackImages.length) % stackImages.length;
    
    switch (relativeIndex) {
      case 0: // Top/active image
        return {
          zIndex: 30,
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          opacity: 1,
        };
      case 1: // Second image
        return {
          zIndex: 20,
          x: 15,
          y: 10,
          rotate: 3,
          scale: 0.95,
          opacity: 0.8,
        };
      case 2: // Third/bottom image
        return {
          zIndex: 10,
          x: 30,
          y: 20,
          rotate: 6,
          scale: 0.9,
          opacity: 0.6,
        };
      default:
        return {
          zIndex: 0,
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          opacity: 0,
        };
    }
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[450px] lg:h-[500px]">
      {/* Multiple glow effects for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00ffd5]/30 to-[#a855f7]/30 rounded-3xl blur-3xl translate-x-6 translate-y-6 animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#a855f7]/20 to-[#00ffd5]/20 rounded-3xl blur-2xl translate-x-2 translate-y-2" />
      
      {/* Image stack */}
      <div className="relative w-full h-full perspective-1000">
        {stackImages.map((src, index) => {
          const position = getStackPosition(index);
          const isActive = (index - activeIndex + stackImages.length) % stackImages.length === 0;
          return (
            <motion.div
              key={src}
              className="absolute inset-0 cursor-pointer"
              initial={false}
              animate={{
                x: position.x,
                y: position.y,
                rotate: position.rotate,
                scale: position.scale,
                opacity: position.opacity,
                zIndex: position.zIndex,
              }}
              whileHover={isActive ? { scale: 1.02, y: -5 } : {}}
              transition={{
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
              }}
              onClick={() => setActiveIndex(index)}
            >
              {/* Image container with frame effect */}
              <div className="relative w-full h-full group">
                {/* Gradient border frame */}
                <div className="absolute -inset-[2px] bg-gradient-to-br from-[#00ffd5]/60 via-transparent to-[#a855f7]/60 rounded-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Inner shadow overlay for depth */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 via-transparent to-white/10 z-10 pointer-events-none" />
                
                <img
                  src={src}
                  alt={`Team collaboration ${index + 1}`}
                  className="relative w-full h-full object-cover rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10"
                  style={{
                    filter: isActive ? 'brightness(1.05) contrast(1.05)' : 'brightness(0.9)',
                  }}
                />
                
                {/* Shine effect on hover */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Indicator dots */}
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex gap-3">
        {stackImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
              index === activeIndex
                ? 'bg-gradient-to-r from-[#00ffd5] to-[#a855f7] w-8 shadow-[0_0_10px_rgba(0,255,213,0.5)]'
                : 'bg-[var(--muted)]/30 w-2.5 hover:bg-[var(--muted)]/60 hover:scale-125'
            }`}
            aria-label={`View image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export const MissionSection = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          {/* Text Column */}
          <motion.div variants={fadeInUp} className="order-2 lg:order-1">
            <h2 className="text-3xl sm:text-4xl font-bold font-[var(--font-heading)] text-[var(--text)] mb-6">
              Our{' '}
              <span className="bg-gradient-to-r from-[#00ffd5] to-[#a855f7] bg-clip-text text-transparent">
                Mission
              </span>
            </h2>
            <div className="space-y-4 text-[var(--muted)] leading-relaxed">
              <p>
                Init Club is a student-led open-source community built around the idea of initialization, the first step of turning ideas into working systems. The club serves as a starting point for students to learn, experiment, and collaborate by building projects from the ground up.
              </p>
              <p>
                We focus on hands-on learning through real development workflows, including version control, code reviews, documentation, testing, and deployment. Members work in collaborative teams to ideate, design, and implement projects, contributing to public repositories and maintaining them over time.
              </p>
              <p>
                Init Club welcomes members of all skill levels. Beginners are supported through onboarding tasks, peer-led sessions, and guided contributions, while experienced members mentor others and lead project initiatives. The club follows a structured approach to development through time-bound project seasons, ensuring consistency, accountability, and measurable outcomes.
              </p>
              <p>
                Beyond building projects, Init Club promotes participation in the global open-source ecosystem by encouraging contributions to external projects and programs such as Hacktoberfest and GSoC. Contributions are tracked and recognized to foster sustained engagement and growth.
              </p>
              <p>
                All projects under Init Club are developed openly, with an emphasis on collaboration, learning, and long-term impact. The goal is not just to write code, but to build reliable systems, share knowledge, and create a supportive environment where ideas evolve into meaningful open-source works.
              </p>
            </div>
          </motion.div>

          {/* Image Column - Animated Stack */}
          <motion.div variants={fadeInUp} className="order-1 lg:order-2 pb-10">
            <AnimatedImageStack />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
