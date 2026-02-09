import { motion } from 'framer-motion';
import { Github, ExternalLink, Tag, Star, GitFork } from 'lucide-react';
import type { Repository, Difficulty } from '../types/repository';

interface ProjectCardProps {
  project: Repository;
  onViewDetails: () => void;
}

const difficultyConfig: Record<Difficulty, { label: string; color: string; bg: string }> = {
  beginner: { label: 'Beginner', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' },
  intermediate: { label: 'Intermediate', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30' },
  advanced: { label: 'Advanced', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  idea: { label: 'Idea', color: 'text-purple-400' },
  in_progress: { label: 'In Progress', color: 'text-cyan-400' },
  completed: { label: 'Completed', color: 'text-green-400' },
  maintenance: { label: 'Maintenance', color: 'text-orange-400' },
};

const ProjectCard = ({ project, onViewDetails }: ProjectCardProps) => {
  const difficulty = difficultyConfig[project.difficulty] || difficultyConfig.intermediate;
  const status = statusConfig[project.project_status] || statusConfig.in_progress;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="group relative bg-black/50 border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all"
    >
      {/* Header with gradient */}
      <div className="h-20 bg-gradient-to-br from-cyan-900/30 via-purple-900/20 to-gray-900 relative overflow-hidden">
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>
        {/* Difficulty Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${difficulty.bg} ${difficulty.color}`}>
            {difficulty.label}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Project Name */}
        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
          {project.name}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm line-clamp-2 min-h-[2.5rem]">
          {project.description || 'No description available.'}
        </p>

        {/* Tech Stack / Topics */}
        {project.topics && project.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.topics.slice(0, 4).map(topic => (
              <span
                key={topic}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              >
                <Tag size={10} />
                {topic}
              </span>
            ))}
            {project.topics.length > 4 && (
              <span className="text-xs text-gray-500">+{project.topics.length - 4} more</span>
            )}
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-4 pt-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Star size={14} className="text-yellow-500" />
            {project.stars}
          </span>
          <span className="flex items-center gap-1">
            <GitFork size={14} className="text-gray-400" />
            {project.forks}
          </span>
          {project.language && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              {project.language}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-800">
          <button
            onClick={onViewDetails}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 text-white rounded-lg text-sm font-medium transition-colors border border-cyan-500/30"
          >
            View Details
          </button>
          <a
            href={project.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
            title="View on GitHub"
          >
            <Github size={18} />
          </a>
          {project.homepage && (
            <a
              href={project.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
              title="Live Demo"
            >
              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-xl" />
      </div>
    </motion.article>
  );
};

export default ProjectCard;
