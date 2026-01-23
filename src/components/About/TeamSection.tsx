import { motion } from 'framer-motion';
import { useState } from 'react';
import { GlitchText } from '../Graph/GlitchText';
import President from '../assets/President.jpeg'

type TierType = 'sudo' | 'maintainer' | 'orchestrator';

interface TeamMember {
  username: string;
  role: string;
  avatar: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  tier: TierType;
}

interface TierConfig {
  label: string;
  title: string;
  glowColor: string;
  borderColor: string;
  badgeColor: string;
}

const tierConfigs: Record<TierType, TierConfig> = {
  sudo: {
    label: 'Executive Board',
    title: 'SUDO USER',
    glowColor: 'rgba(168, 85, 247, 0.3)',
    borderColor: '#a855f7',
    badgeColor: '#a855f7',
  },
  maintainer: {
    label: 'Technical & Creative Leads',
    title: 'MAINTAINER',
    glowColor: 'rgba(0, 255, 213, 0.2)',
    borderColor: '#00ffd5',
    badgeColor: '#00ffd5',
  },
  orchestrator: {
    label: 'Operations & Outreach Leads',
    title: 'ORCHESTRATOR',
    glowColor: 'rgba(250, 204, 21, 0.2)',
    borderColor: '#facc15',
    badgeColor: '#facc15',
  },
};

const executiveBoard: TeamMember[] = [
  {
    username: 'president_init',
    role: 'President',
    avatar: President,
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    tier: 'sudo',
  },
  {
    username: 'vp_tech',
    role: 'VP - Tech',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=vptech&backgroundColor=0a0a0a',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    tier: 'sudo',
  },
  {
    username: 'vp_nontech',
    role: 'VP - Non Tech',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=vpnontech&backgroundColor=0a0a0a',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    tier: 'sudo',
  },
];

const technicalLeads: TeamMember[] = [
  {
    username: 'web_lead',
    role: 'Website Lead',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=weblead&backgroundColor=0a0a0a',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    tier: 'maintainer',
  },
  {
    username: 'research_lead',
    role: 'Research Lead',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=researchlead&backgroundColor=0a0a0a',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    tier: 'maintainer',
  },
  {
    username: 'github_lead',
    role: 'GitHub Lead',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=githublead&backgroundColor=0a0a0a',
    github: 'https://github.com',
    tier: 'maintainer',
  },
  {
    username: 'multimedia_lead',
    role: 'Multimedia Lead',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=multimedialead&backgroundColor=0a0a0a',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    tier: 'maintainer',
  },
];

const operationsLeads: TeamMember[] = [
  {
    username: 'logistics_lead',
    role: 'Logistics Lead',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=logisticslead&backgroundColor=0a0a0a',
    linkedin: 'https://linkedin.com',
    tier: 'orchestrator',
  },
  {
    username: 'pr_lead',
    role: 'PR Lead',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=prlead&backgroundColor=0a0a0a',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    tier: 'orchestrator',
  },
  {
    username: 'events_lead',
    role: 'Event Management Lead',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=eventslead&backgroundColor=0a0a0a',
    linkedin: 'https://linkedin.com',
    instagram: 'https://instagram.com',
    tier: 'orchestrator',
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

const GitHubIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const ProfileCard = ({ member, isLarge = false }: { member: TeamMember; isLarge?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  const config = tierConfigs[member.tier];

  return (
    <motion.div
      variants={fadeInUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full group ${isLarge ? 'max-w-[320px]' : 'max-w-[260px]'}`}
    >
      {/* Main Card */}
      <div
        className="relative bg-[#0a0a0a] border rounded-lg overflow-hidden transition-all duration-300"
        style={{
          borderColor: isHovered ? config.borderColor : 'var(--glass-border)',
          boxShadow: isHovered ? `0 0 40px ${config.glowColor}` : 'none',
        }}
      >
        {/* Header Bar */}
        <div
          className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--glass-border)]"
          style={{
            background: isLarge
              ? `linear-gradient(90deg, rgba(168, 85, 247, 0.1) 0%, #0f0f0f 100%)`
              : 'linear-gradient(90deg, #0f0f0f 0%, #141414 100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: config.badgeColor }}
            />
            <span className="text-[9px] font-[var(--font-mono)] text-[var(--muted)] uppercase tracking-wider">
              {config.title}
            </span>
          </div>
        </div>

        {/* Profile Content */}
        <div className={isLarge ? 'p-5' : 'p-4'}>
          {/* Avatar & Info */}
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-3">
              <div
                className={`${isLarge ? 'w-20 h-20' : 'w-16 h-16'} rounded-lg overflow-hidden border-2 transition-colors duration-300`}
                style={{
                  borderColor: isHovered ? config.borderColor : `${config.borderColor}4D`,
                }}
              >
                <img
                  src={member.avatar}
                  alt={member.username}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Online Indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0a0a0a] rounded-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              </div>
            </div>

            {/* Username */}
            <div className="flex items-center gap-1 mb-1">
              <span
                className="font-[var(--font-mono)] text-xs"
                style={{ color: `${config.badgeColor}99` }}
              >
                @
              </span>
              <h3 className="font-[var(--font-mono)] text-[var(--text)] font-bold">
                <GlitchText
                  text={member.username}
                  trigger={isHovered}
                  className={isLarge ? 'text-sm' : 'text-xs'}
                />
              </h3>
            </div>

            {/* Role */}
            <p
              className={`${isLarge ? 'text-xs' : 'text-[10px]'} font-[var(--font-mono)] uppercase tracking-wide`}
              style={{ color: config.badgeColor }}
            >
              {member.role}
            </p>

            {/* Social Links - Show on Hover */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: isHovered ? 'auto' : 0,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 pt-3">
                {member.github && (
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md bg-[#0f0f0f] border border-[var(--glass-border)] text-[var(--muted)] hover:text-white hover:border-[#333] transition-all duration-200"
                  >
                    <GitHubIcon />
                  </a>
                )}
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md bg-[#0f0f0f] border border-[var(--glass-border)] text-[var(--muted)] hover:text-[#0a66c2] hover:border-[#0a66c2]/50 transition-all duration-200"
                  >
                    <LinkedInIcon />
                  </a>
                )}
                {member.instagram && (
                  <a
                    href={member.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md bg-[#0f0f0f] border border-[var(--glass-border)] text-[var(--muted)] hover:text-[#e4405f] hover:border-[#e4405f]/50 transition-all duration-200"
                  >
                    <InstagramIcon />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scanline Effect on Hover */}
      <div
        className={`absolute inset-0 pointer-events-none rounded-lg overflow-hidden transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="absolute inset-0 animate-scan"
          style={{
            background: `linear-gradient(to bottom, transparent, ${config.badgeColor}0D, transparent)`,
          }}
        />
      </div>
    </motion.div>
  );
};

const TierSection = ({
  title,
  members,
  isLarge = false,
  gridCols,
}: {
  title: string;
  members: TeamMember[];
  isLarge?: boolean;
  gridCols: string;
}) => {
  const config = tierConfigs[members[0]?.tier || 'maintainer'];

  return (
    <div className="mb-14">
      {/* Tier Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4 mb-8"
      >
        <div
          className="h-px flex-1 max-w-[60px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${config.badgeColor})`,
          }}
        />
        <div className="flex items-center gap-3">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: config.badgeColor }}
          />
          <h3 className="text-base font-[var(--font-heading)] text-[var(--text)]">
            {title}
          </h3>
          <span
            className="text-[9px] font-[var(--font-mono)] px-2 py-0.5 rounded"
            style={{
              backgroundColor: `${config.badgeColor}1A`,
              color: config.badgeColor,
              border: `1px solid ${config.badgeColor}33`,
            }}
          >
            {config.title}
          </span>
        </div>
        <div
          className="h-px flex-1"
          style={{
            background: `linear-gradient(90deg, ${config.badgeColor}, transparent)`,
          }}
        />
      </motion.div>

      {/* Cards Grid */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-50px' }}
        variants={staggerContainer}
        className={`grid ${gridCols} gap-5 justify-items-center`}
      >
        {members.map((member) => (
          <ProfileCard key={member.username} member={member} isLarge={isLarge} />
        ))}
      </motion.div>
    </div>
  );
};

export const TeamSection = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 mb-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-[#0f0f0f] border border-[var(--glass-border)] rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#00ffd5] animate-pulse" />
            <span className="text-xs font-[var(--font-mono)] text-[var(--muted)] uppercase tracking-wider">
              Core Contributors
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-[var(--font-heading)] text-[var(--text)] mb-4">
            Meet the{' '}
            <span className="bg-gradient-to-r from-[#00ffd5] to-[#a855f7] bg-clip-text text-transparent">
              Team
            </span>
          </h2>
          <p className="text-[var(--muted)] max-w-xl mx-auto font-[var(--font-mono)] text-sm">
            The passionate maintainers driving Init forward.
          </p>
        </motion.div>

        {/* Tier 1: Executive Board - President */}
        <TierSection
          title="Executive Board"
          members={[executiveBoard[0]]}
          isLarge={true}
          gridCols="grid-cols-1"
        />

        {/* Tier 1: Executive Board - VPs */}
        <div className="-mt-8 mb-14">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5 justify-items-center max-w-2xl mx-auto"
          >
            {executiveBoard.slice(1).map((member) => (
              <ProfileCard key={member.username} member={member} isLarge={true} />
            ))}
          </motion.div>
        </div>

        {/* Tier 2: Technical & Creative Leads */}
        <TierSection
          title="Technical & Creative Leads"
          members={technicalLeads}
          gridCols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
        />

        {/* Tier 3: Operations & Outreach Leads */}
        <TierSection
          title="Operations & Outreach Leads"
          members={operationsLeads}
          gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        />
      </div>
    </section>
  );
};
