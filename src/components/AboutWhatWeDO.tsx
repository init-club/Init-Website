import React, { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import ParallaxCard from "./ParallaxCard";
import { Code2, Calendar, Users, Github } from "lucide-react";
import { TypewriterText } from "./TypewriterText";

// --- Internal Component for Scroll Reveal Text ---
const ScrollRevealBlock = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const element = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: element,
    offset: ["start 0.8", "start 0.5"],
  });

  // Transform opacity and color lightness
  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [20, 0]);

  return (
    <motion.div ref={element} style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
};

const fadeVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const AboutWhatWeDo: React.FC = () => {
  // --- Spotlight Logic ---
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the mouse movement
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      className="relative py-20 lg:py-32 px-6 bg-transparent overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">




        {/* Glowing Floor Effect (Slightly reduced to blend better) */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-cyan-900/10 to-transparent pointer-events-none" />
      </div>



      {/* ================= ABOUT SECTION ================= */}

      <div className="max-w-7xl mx-auto relative z-10">

        {/* ================= ABOUT SECTION (Horizontal: Logo | Text) ================= */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20 lg:mb-32 relative">

          {/* Spotlight Effect for Zone A */}
          <motion.div
            className="absolute z-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"
            style={{
              left: springX,
              top: springY,
              translateX: "-50%",
              translateY: "-50%"
            }}
          />

          {/* LEFT: LOGO */}
          <div className="flex justify-center lg:justify-start relative z-10">
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{
                repeat: Infinity,
                duration: 6,
                ease: "easeInOut",
              }}
              className="relative group w-64 h-64 sm:w-80 sm:h-80"
            >
              {/* Animated Rings */}
              <div className="absolute inset-0 rounded-full border border-cyan-500/20 scale-105 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 rounded-full border border-purple-500/20 scale-110 group-hover:scale-125 transition-transform duration-700 delay-100" />

              {/* Glow Ring */}
              <div className="absolute inset-0 rounded-full blur-3xl opacity-30 bg-gradient-brand group-hover:opacity-50 transition-opacity duration-500" />

              {/* Logo Container */}
              <div className="relative w-full h-full rounded-full overflow-hidden border border-white/10 bg-black/50 backdrop-blur-sm flex items-center justify-center shadow-2xl shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow duration-500">
                <div className="absolute inset-0 bg-gradient-brand opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
                <img
                  src="/InitClubLogo.png"
                  alt="Init Club Logo"
                  className="w-full h-full object-cover transition-transform duration-500"
                />
              </div>
            </motion.div>
          </div>

          {/* RIGHT: TEXT CONTENT */}
          <div className="flex flex-col gap-8 text-center lg:text-left relative z-10">
            <motion.div
              variants={fadeVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.42, 0, 0.58, 1] }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2 w-fit mx-auto lg:mx-0 group hover:bg-white/10 transition-colors duration-300"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">The Community</span>
            </motion.div>

            <motion.h2
              variants={fadeVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.42, 0, 0.58, 1] }}
              className="text-4xl md:text-5xl font-black text-white font-heading leading-tight whitespace-nowrap"
            >
              <span className="text-white">
                <TypewriterText text="About < " delay={0.5} />
              </span>
              <span
                style={{
                  background: 'linear-gradient(90deg, #00ffd5, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block'
                }}
              >
                <TypewriterText text="INIT" delay={0.7} />
              </span>
              <span className="text-white">
                <TypewriterText text=" Club />" delay={1.0} />
              </span>
            </motion.h2>

            <div className="space-y-6 text-base sm:text-lg text-muted/80 leading-relaxed text-justify lg:text-left">
              <ScrollRevealBlock>
                <p>
                  <span className="text-white font-bold">Init Club</span> is a student-led open-source community built around the idea of initialization—the first step of turning ideas into working systems. We serve as a launchpad for students to learn, experiment, and collaborate by building projects from the ground up.
                </p>
              </ScrollRevealBlock>

              <ScrollRevealBlock>
                <p>
                  We focus on <span className="text-white font-bold">hands-on learning</span> through real development workflows, including version control, code reviews, and deployment. We don't just recruit; we onboard builders.
                </p>
              </ScrollRevealBlock>

              <ScrollRevealBlock>
                <p>
                  Beyond building projects, we promote participation in the <span className="text-white font-bold">global open-source ecosystem</span>. Our goal is not just to write code, but to build reliable systems, share knowledge, and create a supportive environment where ideas evolve into meaningful work.
                </p>
              </ScrollRevealBlock>
            </div>

            {/* CTA BUTTONS */}
            <motion.div
              variants={fadeVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.42, 0, 0.58, 1] }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4"
            >
              <a
                href="/contact"
                className="group relative px-8 py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-cyan-50 transition-colors duration-300 overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(90deg, #00ffd5, #a855f7)' }}
                />
                <div className="relative flex items-center gap-2">
                  Join Us Now
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </a>

              <a
                href="https://discord.gg/Gx8sdGJkU"
                target="_blank"
                rel="noreferrer"
                className="group relative px-8 py-3.5 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2] font-bold text-sm hover:bg-[#5865F2] hover:text-white transition-all duration-300"
              >
                <span className="relative flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 127.14 96.36" fill="currentColor">
                    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.09,105.09,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.89,105.89,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                  </svg>
                  Discord Community
                </span>
              </a>
            </motion.div>
          </div>
        </div>

        {/* ================= WHAT WE DO SECTION (Vertical Stack) ================= */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col gap-12 relative"
        >
          {/* HEADER */}
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white font-heading mb-6">
              What{" "}
              <span
                style={{
                  background: 'linear-gradient(90deg, #00ffd5, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block'
                }}
              >
                We Do
              </span>
            </h2>
            <p className="text-muted text-sm uppercase tracking-[0.2em]">
              We don’t just teach theory. We build <span className="text-white">reality</span>.
            </p>
          </div>

          {/* CARDS (Horizontal 4-col Grid) with Staggered Entrance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 pb-10">
            {[
              {
                title: "Build Projects",
                desc: "Collaborate on real-world open-source projects with a production mindset.",
                icon: Code2,
              },
              {
                title: "Host Events",
                desc: "Organize hackathons, workshops, and tech talks that push boundaries.",
                icon: Calendar,
              },
              {
                title: "Create Builders",
                desc: "Foster mentorship-driven growth through active collaboration.",
                icon: Users,
              },
              {
                title: "Open Source",
                desc: "Contribute to the global ecosystem via GitHub and community projects.",
                icon: Github,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: index % 2 === 0 ? 50 : -50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                  type: "spring",
                  bounce: 0.2
                }}
              >
                <ParallaxCard
                  title={item.title}
                  desc={item.desc}
                  icon={item.icon}
                  delay={0} // Managed by parent motion.div now
                />
              </motion.div>
            ))}
          </div>


        </motion.div>
      </div>
    </section >
  );
};

export default AboutWhatWeDo;
