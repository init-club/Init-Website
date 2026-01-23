import { motion } from 'framer-motion';

export const HeroSection = () => {
  return (
    <section className="relative pt-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-[var(--font-heading)] text-[var(--text)] mb-6"
          style={{
            textShadow:
              '0 0 20px rgba(0, 255, 213, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)',
          }}
        >
          <span className="bg-gradient-to-r from-[#00ffd5] to-[#a855f7] bg-clip-text text-transparent">
            Initializing Innovation
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto"
        >
          Where ideas transform into reality through code, collaboration, and creativity.
        </motion.p>
      </div>
      {/* Decorative gradient orbs */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#00ffd5]/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-[#a855f7]/10 rounded-full blur-3xl -z-10" />
    </section>
  );
};
