import { motion } from 'framer-motion';
import { Github, ExternalLink, Tag, Clock, RefreshCw, Archive } from 'lucide-react';
import type { Repository } from '../types/repository';

interface GraveyardCardProps {
  repo: Repository;
}

const GraveyardCard = ({ repo }: GraveyardCardProps) => {
  const lastUpdated = repo.pushed_at
    ? new Date(repo.pushed_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Unknown';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="group relative bg-black/50 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all"
    >
      {/* Header with gradient */}
      <div className="h-24 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <Archive size={60} className="text-gray-400" />
        </div>
        {/* Revivable Badge */}
        {repo.is_revivable && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <RefreshCw size={12} />
              Revivable
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Topics/Tags */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {repo.topics.slice(0, 3).map(topic => (
              <span
                key={topic}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30"
              >
                <Tag size={10} />
                {topic}
              </span>
            ))}
            {repo.topics.length > 3 && (
              <span className="text-xs text-gray-500">+{repo.topics.length - 3} more</span>
            )}
          </div>
        )}

        {/* Project Name */}
        <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
          {repo.name}
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-sm line-clamp-2 min-h-[2.5rem]">
          {repo.description || 'No description available.'}
        </p>

        {/* Archival Reason */}
        {repo.archival_reason && (
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
            <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Why Archived</p>
            <p className="text-sm text-gray-300 line-clamp-2">{repo.archival_reason}</p>
          </div>
        )}

        {/* Language Badge */}
        {repo.language && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
            <span className="text-sm text-gray-400">{repo.language}</span>
          </div>
        )}

        {/* Meta Row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock size={14} />
            <span>Last active: {lastUpdated}</span>
          </div>
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-2 pt-2">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Github size={16} />
            View on GitHub
          </a>
          {repo.homepage && (
            <a
              href={repo.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-200 rounded-lg text-sm font-medium transition-colors border border-purple-500/30"
            >
              <ExternalLink size={16} />
              Demo
            </a>
          )}
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 blur-xl" />
      </div>
    </motion.article>
  );
};

export default GraveyardCard;
