import { motion } from 'framer-motion';

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Alex Chen',
    role: 'President',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
  },
  {
    name: 'Jordan Lee',
    role: 'Vice President',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
  },
  {
    name: 'Sam Taylor',
    role: 'Tech Lead',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
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

export const TeamSection = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 mb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-[var(--font-heading)] text-[var(--text)] mb-4">
            Meet the{' '}
            <span className="bg-gradient-to-r from-[#00ffd5] to-[#a855f7] bg-clip-text text-transparent">
              Team
            </span>
          </h2>
          <p className="text-[var(--muted)] max-w-xl mx-auto">
            The passionate individuals driving Init Club forward.
          </p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center"
        >
          {teamMembers.map((member) => (
            <motion.div
              key={member.name}
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00ffd5] to-[#a855f7] p-[3px]" />
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-[var(--bg)] p-[3px]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-r from-[#00ffd5] to-[#a855f7] p-[2px]">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover bg-[var(--glass-bg)]"
                    />
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold font-[var(--font-heading)] text-[var(--text)] mb-1">
                {member.name}
              </h3>
              <p className="text-[var(--muted)] text-sm">{member.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
