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
              '0 0 20px rgba(212, 175, 55, 0.5), 0 0 40px rgba(192, 192, 192, 0.3)',
          }}
        >
          <span>
            Initializing
          </span>

          <span className="pl-3 text-white">
            Innovation
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

    </section>
  );
};
