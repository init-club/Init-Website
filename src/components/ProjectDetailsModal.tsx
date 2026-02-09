import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, ExternalLink, Star, GitFork, Tag, Calendar, Users } from 'lucide-react';
import type { Repository, Difficulty } from '../types/repository';

interface ProjectDetailsModalProps {
  project: Repository | null;
  isOpen: boolean;
  onClose: () => void;
}

const difficultyConfig: Record<Difficulty, { label: string; color: string; bg: string }> = {
  beginner: { label: 'Beginner Friendly', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' },
  intermediate: { label: 'Intermediate', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30' },
  advanced: { label: 'Advanced', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30' },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  idea: { label: 'Idea Stage', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  in_progress: { label: 'In Progress', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/20' },
  maintenance: { label: 'Maintenance Mode', color: 'text-orange-400', bg: 'bg-orange-500/20' },
};

// Extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const ProjectDetailsModal = ({ project, isOpen, onClose }: ProjectDetailsModalProps) => {
  if (!project) return null;

  const difficulty = difficultyConfig[project.difficulty] || difficultyConfig.intermediate;
  const status = statusConfig[project.project_status] || statusConfig.in_progress;
  const videoId = project.video_url ? getYouTubeVideoId(project.video_url) : null;

  const lastUpdated = project.pushed_at
    ? new Date(project.pushed_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-800 rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Video Embed or Header */}
            {videoId ? (
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={project.name}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="h-32 bg-gradient-to-br from-cyan-900/30 via-purple-900/20 to-gray-900 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
              </div>
            )}

            {/* Content */}
            <div className="p-8">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${difficulty.bg} ${difficulty.color}`}>
                  {difficulty.label}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {project.name}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6 pb-6 border-b border-gray-800">
                <span className="flex items-center gap-2">
                  <Star size={16} className="text-yellow-500" />
                  {project.stars} stars
                </span>
                <span className="flex items-center gap-2">
                  <GitFork size={16} className="text-gray-400" />
                  {project.forks} forks
                </span>
                {project.language && (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                    {project.language}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  Last updated: {lastUpdated}
                </span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-2">About this Project</h2>
                <p className="text-gray-300 leading-relaxed">
                  {project.description || 'No description available for this project.'}
                </p>
              </div>

              {/* Tech Stack */}
              {project.topics && project.topics.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white mb-3">Tech Stack</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.topics.map(topic => (
                      <span
                        key={topic}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      >
                        <Tag size={12} />
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-800">
                <a
                  href={project.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Github size={18} />
                  View on GitHub
                </a>
                {project.homepage && (
                  <a
                    href={project.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink size={18} />
                    Live Demo
                  </a>
                )}
                <a
                  href={`${project.html_url}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gray-800 text-gray-300 font-medium rounded-xl hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <Users size={18} />
                  I Want to Contribute
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectDetailsModal;
