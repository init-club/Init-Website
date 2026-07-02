import { motion } from 'framer-motion';
import { Github, ExternalLink, Tag, Clock, RefreshCw, Archive } from 'lucide-react';
import type { Repository } from '../../types/repository';

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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.012 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="group relative bg-zinc-950/40 backdrop-blur-sm border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 transition-all duration-300"
    >
      {/* Header strip */}
      <div
        className="h-16 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.05), rgba(113,113,122,0.05))' }}
      >
        {/* Top line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

        {/* Ghost archive icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-8">
          <Archive size={40} className="text-zinc-600" />
        </div>

        {/* Revivable Badge */}
        {repo.is_revivable && (
          <div className="absolute top-3 right-3">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-cyan-400 border border-cyan-500/20"
              style={{ background: 'linear-gradient(90deg, rgba(0,255,213,0.08), rgba(168,85,247,0.08))' }}
            >
              <RefreshCw size={10} />
              Revivable
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Topics */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {repo.topics.slice(0, 3).map(topic => (
              <span
                key={topic}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[rgba(168,85,247,0.08)] text-purple-400 border border-purple-500/15"
              >
                <Tag size={9} />
                {topic}
              </span>
            ))}
            {repo.topics.length > 3 && (
              <span className="text-[11px] text-zinc-600">+{repo.topics.length - 3}</span>
            )}
          </div>
        )}

        {/* Name */}
        <h3 className="text-base font-bold text-zinc-200 group-hover:text-white transition-colors duration-200 line-clamp-1 font-mono">
          {repo.name}
        </h3>

        {/* Description */}
        <p className="text-zinc-600 text-xs leading-relaxed line-clamp-2 min-h-[2rem]">
          {repo.description || 'No description available.'}
        </p>

        {/* Archival Reason */}
        {repo.archival_reason && (
          <div className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/50">
            <p className="text-[10px] text-zinc-600 mb-1 font-mono uppercase tracking-widest">Why Archived</p>
            <p className="text-xs text-zinc-500 line-clamp-2">{repo.archival_reason}</p>
          </div>
        )}

        {/* Language */}
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-xs text-zinc-500">{repo.language}</span>
          </div>
        )}

        {/* Meta Row */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
            <Clock size={11} />
            <span>Last active: {lastUpdated}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-medium transition-all duration-200"
          >
            <Github size={14} />
            View on GitHub
          </a>
          {repo.homepage && (
            <a
              href={repo.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all duration-200"
              title="Demo"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      {/* Hover shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-transparent to-zinc-500/3" />
      </div>
    </motion.article>
  );
};

export default GraveyardCard;
