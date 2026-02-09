import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Loader2, Search, Edit2, X, Save,
  ExternalLink, Video, AlertCircle
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { supabase } from '../../supabaseClient';
import type { Repository, Difficulty, ProjectStatus } from '../../types/repository';

interface EditModalProps {
  project: Repository | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, difficulty: Difficulty, status: ProjectStatus, videoUrl: string) => Promise<void>;
}

const EditModal = ({ project, isOpen, onClose, onSave }: EditModalProps) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [status, setStatus] = useState<ProjectStatus>('in_progress');
  const [videoUrl, setVideoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setDifficulty(project.difficulty || 'intermediate');
      setStatus(project.project_status || 'in_progress');
      setVideoUrl(project.video_url || '');
      setError(null);
    }
  }, [project]);

  const handleSave = async () => {
    if (!project) return;
    setIsSaving(true);
    setError(null);
    try {
      await onSave(project.id, difficulty, status, videoUrl);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (!project) return null;

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
            className="relative w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <h2 className="text-xl font-bold text-white mb-1">Edit Project</h2>
            <p className="text-cyan-400 text-sm mb-6">{project.name}</p>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Project Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="idea">Idea</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Video URL (YouTube)
                </label>
                <div className="relative">
                  <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full pl-12 pr-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-800">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function ProjectAdmin() {
  const [projects, setProjects] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState<Repository | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/');
        return;
      }

      // Check role
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('auth_user_id', session.user.id)
        .single();

      if (error || !data || (data.role !== 'admin' && data.role !== 'semi_admin')) {
        navigate('/');
        return;
      }

      setIsAdmin(true);
      fetchProjects();
    };

    checkAdminAndFetch();
  }, [navigate]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('repositories')
        .select('*')
        .eq('is_archived', false)
        .order('name', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProject = async (
    id: number,
    difficulty: Difficulty,
    status: ProjectStatus,
    videoUrl: string
  ) => {
    const { error } = await supabase.rpc('update_project_details', {
      target_repo_id: id,
      new_difficulty: difficulty,
      new_status: status,
      new_video_url: videoUrl || null
    });

    if (error) throw error;

    // Refresh the list
    await fetchProjects();
  };

  const filteredProjects = searchQuery
    ? projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  const difficultyColors: Record<Difficulty, string> = {
    beginner: 'text-green-400',
    intermediate: 'text-yellow-400',
    advanced: 'text-red-400'
  };

  const statusColors: Record<ProjectStatus, string> = {
    idea: 'text-purple-400',
    in_progress: 'text-cyan-400',
    completed: 'text-green-400',
    maintenance: 'text-orange-400'
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black pt-20">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-white mb-2">
              Project Management
            </h1>
            <p className="text-gray-400">
              Manage metadata for active projects: difficulty, status, and demo videos.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </motion.div>

          {/* Projects Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                {searchQuery ? 'No projects match your search.' : 'No active projects found.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Project</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Difficulty</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Video</th>
                      <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr
                        key={project.id}
                        className="border-b border-gray-800/50 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{project.name}</p>
                            <p className="text-gray-500 text-sm line-clamp-1">
                              {project.description || 'No description'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium capitalize ${difficultyColors[project.difficulty] || 'text-gray-400'}`}>
                            {project.difficulty || 'Not set'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${statusColors[project.project_status] || 'text-gray-400'}`}>
                            {project.project_status?.replace('_', ' ') || 'Not set'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {project.video_url ? (
                            <a
                              href={project.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm"
                            >
                              <Video size={14} />
                              View
                              <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span className="text-gray-600 text-sm">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setEditingProject(project)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm transition-colors"
                          >
                            <Edit2 size={14} />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-white">{projects.length}</p>
              <p className="text-gray-500 text-sm">Total Projects</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-400">
                {projects.filter(p => p.difficulty === 'beginner').length}
              </p>
              <p className="text-gray-500 text-sm">Beginner</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-cyan-400">
                {projects.filter(p => p.project_status === 'in_progress').length}
              </p>
              <p className="text-gray-500 text-sm">In Progress</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <p className="text-2xl font-bold text-purple-400">
                {projects.filter(p => p.video_url).length}
              </p>
              <p className="text-gray-500 text-sm">With Videos</p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Edit Modal */}
      <EditModal
        project={editingProject}
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onSave={handleSaveProject}
      />

      <Footer />
    </>
  );
}
