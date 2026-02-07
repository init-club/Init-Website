import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface AdminCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  color?: string;
  badge?: string | number;
}

const colorClasses: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  cyan: {
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-400',
    border: 'hover:border-cyan-500/50',
    glow: 'group-hover:shadow-cyan-500/20'
  },
  purple: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'hover:border-purple-500/50',
    glow: 'group-hover:shadow-purple-500/20'
  },
  green: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'hover:border-green-500/50',
    glow: 'group-hover:shadow-green-500/20'
  },
  yellow: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'hover:border-yellow-500/50',
    glow: 'group-hover:shadow-yellow-500/20'
  },
  red: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'hover:border-red-500/50',
    glow: 'group-hover:shadow-red-500/20'
  },
  blue: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'hover:border-blue-500/50',
    glow: 'group-hover:shadow-blue-500/20'
  }
};

const AdminCard = ({ title, description, icon: Icon, to, color = 'cyan', badge }: AdminCardProps) => {
  const colors = colorClasses[color] || colorClasses.cyan;

  return (
    <Link to={to}>
      <motion.div
        whileHover={{ scale: 1.03, y: -5 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`group relative glass p-6 rounded-2xl border border-white/10 cursor-pointer ${colors.border} transition-all duration-300 shadow-lg ${colors.glow} group-hover:shadow-xl overflow-hidden`}
      >
        {/* Background gradient on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${colors.bg}`} />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 ${colors.bg} rounded-xl ${colors.text} transition-transform group-hover:scale-110`}>
                <Icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>

            {/* Badge */}
            {badge !== undefined && (
              <span className={`px-3 py-1 ${colors.bg} ${colors.text} text-sm font-bold rounded-full`}>
                {badge}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-400 mb-4 leading-relaxed">{description}</p>

          {/* Action hint */}
          <div className={`flex items-center gap-2 ${colors.text} text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity`}>
            <span>Open</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Decorative corner */}
        <div className={`absolute -bottom-8 -right-8 w-24 h-24 ${colors.bg} rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity`} />
      </motion.div>
    </Link>
  );
};

export default AdminCard;
