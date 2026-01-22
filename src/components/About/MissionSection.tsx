import { motion } from 'framer-motion';

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
                Init Club is a community-driven organization dedicated to empowering the next
                generation of tech innovators. We believe in learning by doing, sharing
                knowledge, and building together.
              </p>
              <p>
                Our mission is to create an inclusive environment where students and
                professionals can collaborate on meaningful projects, learn cutting-edge
                technologies, and develop skills that matter in today's rapidly evolving tech
                landscape.
              </p>
              <p>
                Whether you're a seasoned developer or just starting your coding journey, Init
                Club provides the resources, mentorship, and community you need to thrive.
              </p>
            </div>
          </motion.div>

          {/* Image Column */}
          <motion.div variants={fadeInUp} className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ffd5]/20 to-[#a855f7]/20 rounded-2xl blur-xl" />
              <img
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b"
                alt="Technology and Innovation"
                className="relative rounded-2xl w-full h-auto object-cover border border-[var(--glass-border)]"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
