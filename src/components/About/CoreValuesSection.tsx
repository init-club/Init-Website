import { motion } from 'framer-motion';

interface CoreValue {
  title: string;
  description: string;
  icon: string;
}

const coreValues: CoreValue[] = [
  {
    title: 'Community',
    description:
      'Building a vibrant network of developers, designers, and innovators who support and inspire each other.',
    icon: '👥',
  },
  {
    title: 'Code',
    description:
      'Crafting elegant solutions through clean, efficient, and maintainable code that pushes boundaries.',
    icon: '💻',
  },
  {
    title: 'Creativity',
    description:
      'Fostering innovative thinking and out-of-the-box solutions to tackle real-world challenges.',
    icon: '✨',
  },
];

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

export const CoreValuesSection = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-[var(--font-heading)] text-[var(--text)] mb-4">
            Core{' '}
            <span className="bg-gradient-to-r from-[#00ffd5] to-[#a855f7] bg-clip-text text-transparent">
              Values
            </span>
          </h2>
          <p className="text-[var(--muted)] max-w-xl mx-auto">
            The principles that guide everything we do at Init Club.
          </p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {coreValues.map((value) => (
            <motion.div
              key={value.title}
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
              className="glass rounded-2xl p-8 text-center hover:border-[#00ffd5]/30 transition-colors duration-300"
            >
              <div className="text-5xl mb-4">{value.icon}</div>
              <h3 className="text-xl font-bold font-[var(--font-heading)] text-[var(--text)] mb-3">
                {value.title}
              </h3>
              <p className="text-[var(--muted)] text-sm leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
