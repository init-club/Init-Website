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
