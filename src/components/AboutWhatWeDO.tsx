import React from "react";
import { motion } from "framer-motion";
import ParallaxCard from "./ParallaxCard";


const fadeVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const AboutWhatWeDo: React.FC = () => {
  return (
    <section
      className="relative py-28 px-6"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* ================= ABOUT SECTION ================= */}

      <motion.div
        variants={fadeVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.42, 0, 0.58, 1] }}
        className="max-w-6xl mx-auto mb-32"
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* LEFT LOGO */}
          <div className="flex justify-center md:justify-start">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: [0.42, 0, 0.58, 1],
              }}
              className="relative"
            >
              {/* Glow Ring */}
              <div className="absolute inset-0 rounded-full blur-2xl opacity-40 bg-[linear-gradient(90deg,#00ffd5,#a855f7)]" />

              {/* Logo */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden border-2 border-[#00ffd5] glass flex items-center justify-center">
                <img
                  src="/InitClubLogo.png"
                  alt="Init Club Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              About{" "}
              <span className="bg-[linear-gradient(90deg,#00ffd5,#a855f7)] bg-clip-text text-transparent">
                INIT Club
              </span>
            </h2>

            <p className="mt-3 text-white/80 text-sm uppercase tracking-widest">
              Not just a club. A transformation.
            </p>

            {/* ABOUT TEXT */}
            <div className="mt-6 space-y-4 max-w-xl">
              <p className="text-white leading-relaxed text-lg">
                INIT is an open-source student community where you collaborate,
                learn, and turn ideas into real-world projects. Through our
                GitHub organization, students from different disciplines work
                together to share knowledge, contribute code, and build
                meaningful open-source solutions. INIT promotes hands-on
                learning, teamwork, and transforming ideas into reality.
              </p>

              <p className="text-white leading-relaxed text-lg">
                “Open source is not just about code, it’s about collaboration,
                learning, and building together.”
              </p>
            </div>

            {/* CTA BUTTONS */}
            <motion.div
              variants={fadeVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 flex flex-wrap gap-5 justify-center md:justify-start"
            >
              {/* JOIN BUTTON */}
              <a
                href="/contact"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl glass font-semibold text-base transition-all duration-300 hover:scale-105 hover:bg-[linear-gradient(90deg,#00ffd5,#a855f7)] hover:text-white"
              >
                Join Us Now
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>

              {/* DISCORD BUTTON */}
              <a
                href="https://discord.gg/Gx8sdGJkU"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl glass font-semibold text-base transition-all duration-300 hover:scale-105 hover:bg-[#5865F2] hover:text-white"
              >
                Discord
              </a>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ================= WHAT WE DO SECTION ================= */}

      <motion.div
        variants={fadeVariant}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        transition={{ duration: 0.7, ease: [0.42, 0, 0.58, 1] }}
        className="max-w-6xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white">
          What{" "}
          <span className="bg-[linear-gradient(90deg,#00ffd5,#a855f7)] bg-clip-text text-transparent">
            We Do
          </span>
        </h2>

        <p className="mt-3 text-white/80 text-sm uppercase tracking-widest mb-12">
          We don’t teach theory. We build reality.
        </p>

        {/* CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
  {[
    {
      title: "Build Projects",
      desc: "Real-world open-source projects with production mindset.",
    },
    {
      title: "Host Events",
      desc: "Hackathons, workshops and experiences that push limits.",
    },
    {
      title: "Create Builders",
      desc: "Mentorship driven growth through collaboration.",
    },
    {
      title: "Open Source",
      desc: "Community driven development via GitHub collaboration.",
    },
  ].map((item, index) => (
    <ParallaxCard
      key={index}
      title={item.title}
      desc={item.desc}
    />
  ))}
</div>

      </motion.div>
    </section>
  );
};

export default AboutWhatWeDo;
