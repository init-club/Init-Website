import { motion } from 'framer-motion';
import { Github, ExternalLink, Tag, Star, GitFork } from 'lucide-react';
import type { Repository, Difficulty } from '../../types/repository';

interface ProjectCardProps {
  project: Repository;
  onViewDetails: () => void;
}

const difficultyConfig: Record<Difficulty, { label: string; color: string; bg: string }> = {
  beginner: { label: 'Beginner', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  intermediate: { label: 'Intermediate', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  advanced: { label: 'Advanced', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
};

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  idea: { label: 'Idea', color: 'text-purple-400', dot: 'bg-purple-400' },
  in_progress: { label: 'In Progress', color: 'text-cyan-400', dot: 'bg-cyan-400' },
  completed: { label: 'Completed', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  maintenance: { label: 'Maintenance', color: 'text-orange-400', dot: 'bg-orange-400' },
};

const ProjectCard = ({ project, onViewDetails }: ProjectCardProps) => {
  const difficulty = difficultyConfig[project.difficulty] || difficultyConfig.intermediate;
  const status = statusConfig[project.project_status] || statusConfig.in_progress;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.012 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="group relative bg-zinc-950/40 backdrop-blur-sm border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 transition-all duration-300"
    >
      {/* Header strip */}
      <div
        className="h-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(0,255,213,0.05), rgba(168,85,247,0.05))' }}
      >
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

        {/* Status */}
        <div className="absolute top-3.5 left-4 flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
          <span className={`text-[11px] font-medium font-mono ${status.color}`}>{status.label}</span>
        </div>

        {/* Difficulty */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${difficulty.bg} ${difficulty.color}`}>
            {difficulty.label}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Name */}
        <h3 className="text-base font-bold text-zinc-200 group-hover:text-white transition-colors duration-200 line-clamp-1 font-mono">
          {project.name}
        </h3>

        {/* Description */}
        <p className="text-zinc-600 text-xs leading-relaxed line-clamp-2 min-h-[2rem]">
          {project.description || 'No description available.'}
        </p>

        {/* Topics */}
        {project.topics && project.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.topics.slice(0, 4).map(topic => (
              <span
                key={topic}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[rgba(0,255,213,0.08)] text-cyan-400 border border-cyan-500/15"
              >
                <Tag size={9} />
                {topic}
              </span>
            ))}
            {project.topics.length > 4 && (
              <span className="text-[11px] text-zinc-600">+{project.topics.length - 4}</span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 pt-1 text-xs text-zinc-600">
          <span className="flex items-center gap-1">
            <Star size={12} className="text-yellow-500" />
            {project.stars}
          </span>
          <span className="flex items-center gap-1">
            <GitFork size={12} className="text-zinc-500" />
            {project.forks}
          </span>
          {project.language && (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              {project.language}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-zinc-900">
          <button
            onClick={onViewDetails}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(90deg, rgba(0,255,213,0.15), rgba(168,85,247,0.15))', border: '1px solid rgba(0,255,213,0.2)' }}
          >
            View Details
          </button>
          <a
            href={project.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all duration-200"
            title="View on GitHub"
          >
            <Github size={16} />
          </a>
          {project.homepage && (
            <a
              href={project.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all duration-200"
              title="Live Demo"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>

      {/* Hover shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/3 via-transparent to-purple-500/3" />
      </div>
    </motion.article>
  );
};

export default ProjectCard;
