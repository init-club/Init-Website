import React from "react";
import { motion } from "framer-motion";



const AboutWhatWeDo: React.FC = () => {
  return (
    <section className="relative py-28 px-6" style={{ backgroundColor: "var(--bg)" }}>

      {/* ABOUT SECTION */}
     {/* ABOUT SECTION */}
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.3 }}
  variants={{
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
  }}
  transition={{ duration: 0.7, ease: "easeOut" }}
  className="max-w-6xl mx-auto mb-32"
>

  <div className="grid md:grid-cols-2 gap-12 items-center">

    {/* LEFT LOGO */}
    <div className="flex justify-center md:justify-start">

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="relative"
      >

        {/* Glow Ring */}
        <div className="absolute inset-0 rounded-full blur-2xl opacity-40 bg-gradient-to-r from-cyan-400 to-purple-500" />

        {/* Logo Container */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden border-2 border-cyan-400 glass flex items-center justify-center">

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

      <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)]">
        About{" "}
        <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          INIT Club
        </span>
      </h2>

      <p className="mt-3 text-cyan-400 text-sm uppercase tracking-widest">
        Not just a club. A transformation.
      </p>

      <div className="mt-6 space-y-4 max-w-xl">

  <p className="text-[var(--muted)] leading-relaxed text-lg">
    INIT is an open-source student community built to turn ideas into reality
    through collaboration and innovation. It provides a platform where students
    from all disciplines come together, share knowledge, and work on real-world
    projects that demand multidisciplinary thinking.
  </p>

  <p className="text-[var(--muted)] leading-relaxed text-lg">
    Whether you’re into <span className="text-cyan-400">coding</span>,{" "}
    <span className="text-purple-400">design</span>,{" "}
    <span className="text-blue-400">electronics</span>,{" "}
    <span className="text-pink-400">management</span>, or{" "}
    <span className="text-purple-400">research</span>,
    INIT encourages learning by doing.
  </p>

  <p className="text-[var(--muted)] leading-relaxed text-lg">
    With our online GitHub organization, members collaborate, contribute, and
    build openly — making innovation{" "}
    <span className="text-cyan-400">accessible</span>,{" "}
    <span className="text-purple-400">practical</span>, and{" "}
    <span className="text-blue-400">community-driven</span>.
  </p>

</div>
{/* CTA BUTTONS */}
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.3 }}
  variants={{
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }}
  transition={{ duration: 0.5, delay: 0.25 }}
  className="mt-8 flex flex-wrap gap-5 justify-center md:justify-start"
>

  {/* JOIN US BUTTON */}
  <a
    href="/contact"
    className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl glass font-semibold text-base transition-all duration-300 hover:scale-105"
    style={{ color: "var(--text)" }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "linear-gradient(90deg, #00ffd5, #a855f7)";
      e.currentTarget.style.color = "white";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "";
      e.currentTarget.style.color = "var(--text)";
    }}
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
    className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl glass font-semibold text-base transition-all duration-300 hover:scale-105"
    style={{ color: "var(--text)" }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "#5865F2";
      e.currentTarget.style.color = "white";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "";
      e.currentTarget.style.color = "var(--text)";
    }}
  >
    Discord
  </a>

</motion.div>

    </div>

  </div>



</motion.div>



      {/* WHAT WE DO */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0 }
        }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-6xl mx-auto text-center"
      >

        <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)]">
          What <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            We Do
          </span>
        </h2>

        <p className="mt-3 text-purple-400 text-sm uppercase tracking-widest mb-12">
          We don’t teach theory. We build reality.
        </p>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">

          {[
            {
              title: "Build Projects",
              desc: "Real-world open-source projects with production mindset.",
              color: "#00ffd5",
            },
            {
              title: "Host Events",
              desc: "Hackathons, workshops and experiences that push limits.",
              color: "#a855f7",
            },
            {
              title: "Create Builders",
              desc: "Mentorship driven growth through collaboration.",
              color: "#3b82f6",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="glass rounded-xl p-8 border border-[var(--border)] cursor-pointer"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = item.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <h3
                className="text-xl font-semibold mb-3"
                style={{ color: item.color }}
              >
                {item.title}
              </h3>

              <p className="text-[var(--muted)]">
                {item.desc}
              </p>
            </motion.div>
          ))}

        </div>

      </motion.div>

    </section>
  );
};

export default AboutWhatWeDo;
