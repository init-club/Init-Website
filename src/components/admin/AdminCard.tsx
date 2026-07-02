import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

interface AdminCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  color?: string; // Accent color: 'purple' | 'orange' | 'cyan' | 'yellow' | 'green' | 'blue'
  badge?: string | number;
}

const colorClasses: Record<string, { iconBg: string; iconText: string; borderHover: string; glowHover: string; textHover: string }> = {
  purple: {
    iconBg: 'bg-purple-500/10 border-purple-500/20',
    iconText: 'text-purple-400',
    borderHover: 'hover:border-purple-500/30',
    glowHover: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.06)]',
    textHover: 'group-hover:text-purple-400'
  },
  orange: {
    iconBg: 'bg-orange-500/10 border-orange-500/20',
    iconText: 'text-orange-400',
    borderHover: 'hover:border-orange-500/30',
    glowHover: 'group-hover:shadow-[0_0_30px_rgba(249,115,22,0.06)]',
    textHover: 'group-hover:text-orange-400'
  },
  cyan: {
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    iconText: 'text-cyan-400',
    borderHover: 'hover:border-cyan-500/30',
    glowHover: 'group-hover:shadow-[0_0_30px_rgba(6,182,212,0.06)]',
    textHover: 'group-hover:text-cyan-400'
  },
  yellow: {
    iconBg: 'bg-yellow-500/10 border-yellow-500/20',
    iconText: 'text-yellow-400',
    borderHover: 'hover:border-yellow-500/30',
    glowHover: 'group-hover:shadow-[0_0_30px_rgba(234,179,8,0.06)]',
    textHover: 'group-hover:text-yellow-400'
  },
  green: {
    iconBg: 'bg-green-500/10 border-green-500/20',
    iconText: 'text-green-400',
    borderHover: 'hover:border-green-500/30',
    glowHover: 'group-hover:shadow-[0_0_30px_rgba(34,197,94,0.06)]',
    textHover: 'group-hover:text-green-400'
  },
  blue: {
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    iconText: 'text-blue-400',
    borderHover: 'hover:border-blue-500/30',
    glowHover: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.06)]',
    textHover: 'group-hover:text-blue-400'
  }
};

const AdminCard = ({ title, description, icon: Icon, to, color = 'cyan', badge }: AdminCardProps) => {
  const accent = colorClasses[color] || colorClasses.cyan;

  return (
    <Link to={to}>
      <motion.div
        whileHover={{ scale: 1.015, y: -2 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`group relative bg-zinc-950/40 p-5 rounded-2xl border border-zinc-900 ${accent.borderHover} transition-all duration-300 backdrop-blur-md cursor-pointer flex flex-col justify-between h-full ${accent.glowHover}`}
      >
        {/* Content */}
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${accent.iconBg} border rounded-lg ${accent.iconText} transition-all`}>
                <Icon size={20} />
              </div>
              <h3 className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{title}</h3>
            </div>

            {/* Badge */}
            {badge !== undefined && (
              <span className={`px-2 py-0.5 ${accent.iconBg} border text-[10px] font-bold ${accent.iconText} rounded-md`}>
                {badge}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-zinc-500 text-xs leading-relaxed">{description}</p>
        </div>

        {/* Action arrow indicator */}
        <div className={`flex items-center gap-1 ${accent.iconText} text-[10px] font-bold uppercase tracking-wider mt-5 opacity-0 group-hover:opacity-100 transition-opacity`}>
          <span>Manage</span>
          <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </motion.div>
    </Link>
  );
};

export default AdminCard;
