import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Abhijith from '../assets/slideshow/abhijith.jpg';
import Group from '../assets/slideshow/group.jpg';
import Selfie from '../assets/slideshow/Selfie.jpg';
import Pic1 from '../assets/slideshow/pic1.png';
import Rema from '../assets/slideshow/Rema.jpg';


// Scroll-driven mission sections
const scrollSections = [
  {
    title: 'Our Mission',
    text: 'Init Club is a student-led open-source community built around the idea of initialization, the first step of turning ideas into working systems. The club serves as a starting point for students to learn, experiment, and collaborate by building projects from the ground up.',
    image: Group,
  },
  {
    title: 'Hands-On Learning',
    text: 'We focus on hands-on learning through real development workflows, including version control, code reviews, documentation, testing, and deployment. Members work in collaborative teams to ideate, design, and implement projects, contributing to public repositories and maintaining them over time.',
    image: Selfie,
  },
  {
    title: 'All Skill Levels',
    text: 'Init Club welcomes members of all skill levels. Beginners are supported through onboarding tasks, peer-led sessions, and guided contributions, while experienced members mentor others and lead project initiatives. The club follows a structured approach to development through time-bound project seasons, ensuring consistency, accountability, and measurable outcomes.',
    image: Pic1,
  },
  {
    title: 'Open-Source Ecosystem',
    text: 'Beyond building projects, Init Club promotes participation in the global open-source ecosystem by encouraging contributions to external projects and programs such as Hacktoberfest and GSoC. Contributions are tracked and recognized to foster sustained engagement and growth.',
    image: Abhijith,
  },
  {
    title: 'Long-term Impact',
    text: 'All projects under Init Club are developed openly, with an emphasis on collaboration, learning, and long-term impact. The goal is not just to write code, but to build reliable systems, share knowledge, and create a supportive environment where ideas evolve into meaningful open-source works.',
    image: Rema,
  },
];

// Scroll-driven component
const ScrollDrivenMission = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    const sectionElement = sectionRef.current;
    if (!sectionElement) return;

    let scrollAccumulator = 0;
    const scrollThreshold = 200; // Amount of scroll needed to trigger change

    const onWheel = (e: WheelEvent) => {
      // Quick viewport check for performance
      const rect = sectionElement.getBoundingClientRect();
      const inSection = rect.top <= 100 && rect.bottom >= window.innerHeight - 100;
      
      if (!inSection) {
        scrollAccumulator = 0; // Reset when outside section
        return;
      }
      
      e.preventDefault();
      if (isAnimating.current) return;

      // Accumulate scroll delta for more natural feel
      scrollAccumulator += e.deltaY;

      if (Math.abs(scrollAccumulator) >= scrollThreshold) {
        isAnimating.current = true;
        const direction = scrollAccumulator > 0 ? 1 : -1;
        scrollAccumulator = 0; // Reset accumulator

        if (direction > 0) {
          // Scrolling down
          if (activeIndex < scrollSections.length - 1) {
            setActiveIndex(prev => prev + 1);
          } else {
            // Allow scroll to next section
            isAnimating.current = false;
            window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
            return;
          }
        } else {
          // Scrolling up
          if (activeIndex > 0) {
            setActiveIndex(prev => prev - 1);
          } else {
            // Allow scroll to previous section
            isAnimating.current = false;
            window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
            return;
          }
        }

        // Dynamic animation timing based on scroll speed
        const animationDuration = Math.min(1500, Math.max(800, Math.abs(e.deltaY) * 5));
        setTimeout(() => {
          isAnimating.current = false;
        }, animationDuration);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [activeIndex]);

  const section = scrollSections[activeIndex];

  return (
    <section ref={sectionRef} className="h-screen flex items-center justify-center bg-[var(--bg)] px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Text */}
          <div className="relative h-[250px] sm:h-[280px] lg:h-[300px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 lg:mb-6 text-[var(--text)] font-[var(--font-heading)]">
                  {(() => {
                    const words = section.title.split(' ');
                    const allButLast = words.slice(0, -1).join(' ');
                    const lastWord = words[words.length - 1];
                    
                    return (
                      <>
                        {allButLast}{allButLast ? ' ' : ''}
                        <span className="bg-gradient-to-r from-[#00ffd5] to-[#a855f7] bg-clip-text text-transparent">
                          {lastWord}
                        </span>
                      </>
                    );
                  })()}
                </h2>
                <p className="text-[var(--muted)] leading-relaxed max-w-lg text-base lg:text-lg">
                  {section.text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Image */}
          <div className="relative h-[320px] sm:h-[400px] lg:h-[450px] overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                src={section.image}
                alt={section.title}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
              />
            </AnimatePresence>
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5 pointer-events-none" />
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center mt-4 gap-2">
          {scrollSections.map((_, i) => (
            <motion.div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-8 bg-gradient-to-r from-[#00ffd5] to-[#a855f7]'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};


export const MissionSection = () => {
  return <ScrollDrivenMission />;
};
