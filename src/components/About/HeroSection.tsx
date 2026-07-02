import { motion } from 'framer-motion';

export const HeroSection = () => {
  return (
    <section className="relative pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-heading text-text mb-6 [text-shadow:_0_0_20px_rgba(0,255,213,0.5),_0_0_40px_rgba(168,85,247,0.3)]"
        >
          <span className="block sm:inline">
            Initializing
          </span>

          <span className="block sm:inline sm:pl-3 bg-gradient-to-r from-[#00ffd5] to-[#a855f7] bg-clip-text text-transparent">
            Innovation
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg sm:text-xl text-muted max-w-2xl mx-auto"
        >
          Where ideas transform into reality through code, collaboration, and creativity.
        </motion.p>
      </div>
      {/* Decorative gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#00ffd5]/10 rounded-full blur-3xl" />
      </div>
    </section>
  );
};
