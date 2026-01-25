import { motion } from 'framer-motion';
import { Rocket, Globe, Users, Wrench, Calendar, Laptop } from 'lucide-react';

interface CoreValue {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const coreValues: CoreValue[] = [
  {
    title: 'Initialization & Foundations',
    description:
      'We believe the most important step is the first one. We focus on turning raw ideas into working systems by building from the ground up, emphasizing that every great project starts with a strong "init" phase.',
    icon: Rocket,
  },
  {
    title: 'Open-Source Stewardship',
    description:
      "Open-source isn't just a license, it’s our culture. We prioritize developing in the open, contributing to the global ecosystem (like GSoC and Hacktoberfest), and ensuring our work remains accessible, public, and impactful.",
    icon: Globe,
  },
  {
    title: 'Collaborative Growth',
    description:
      "We function as a peer-led community where skill levels don't define worth. Whether through onboarding beginners or experienced members mentoring others, we foster a supportive environment where knowledge is shared freely.",
    icon: Users,
  },
  {
    title: 'Engineering Excellence (Real-World Workflows)',
    description:
      "We don’t just \"write code\", we build reliable systems. We are committed to professional development workflows, including version control, documentation, testing, and deployment, to ensure our projects are sustainable and high-quality.",
    icon: Wrench,
  },
  {
    title: 'Consistency & Accountability',
    description:
      'Through structured project seasons and time-bound initiatives, we value measurable outcomes. We ensure that engagement is sustained and that members are held accountable for the long-term maintenance of their contributions.',
    icon: Calendar,
  },
  {
    title: 'Practical Experimentation',
    description:
      'We value hands-on learning over theory. The club serves as a laboratory for students to experiment, fail, and iterate, ensuring that ideas evolve through actual implementation and real-world usage.',
    icon: Laptop,
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
            <span className="bg-gradient-to-r from-[#ff6b35] to-[#d32f2f] bg-clip-text text-transparent">
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
              className="glass rounded-2xl p-8 text-center hover:border-[#ff6b35]/30 transition-colors duration-300"
            >
              <div className="mb-4 flex justify-center">
                <value.icon className="w-12 h-12 text-[#ff6b35]" />
              </div>
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
