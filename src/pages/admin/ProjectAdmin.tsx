import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Loader2, Search, Edit2, X, Save,
  ExternalLink, Video, AlertCircle, Plus, Trash2, CheckCircle2, Star, Archive
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { supabase } from '../../supabaseClient';
import type { Repository, Difficulty, ProjectStatus } from '../../types/repository';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import useSWR from 'swr';
import { fetchAdminProjects } from '../../utils/fetchers';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/shared/modals/ConfirmModal';

interface EditModalProps {
  project: Repository | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Repository) => Promise<void>;
}

const EditModal = ({ project, isOpen, onClose, onSave }: EditModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [htmlUrl, setHtmlUrl] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [status, setStatus] = useState<ProjectStatus>('in_progress');
  const [videoUrl, setVideoUrl] = useState('');
  const [homepage, setHomepage] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setHtmlUrl(project.html_url || '');
      setDifficulty(project.difficulty || 'intermediate');
      setStatus(project.project_status || 'in_progress');
      setVideoUrl(project.video_url || '');
      setHomepage(project.homepage || '');
      setIsFeatured(project.is_featured || false);
      setIsArchived(project.is_archived || false);
      setError(null);
    }
  }, [project]);

  const handleSave = async () => {
    if (!project) return;
    setIsSaving(true);
    setError(null);
    try {
      const updatedProject: Repository = {
        ...project,
        name: name.trim(),
        description: description.trim() || null,
        html_url: htmlUrl.trim(),
        difficulty,
        project_status: status,
        video_url: videoUrl.trim() || null,
        homepage: homepage.trim() || null,
        is_featured: isFeatured,
        is_archived: isArchived
      };
      await onSave(updatedProject);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm px-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-2xl"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <h3 className="text-lg font-bold text-white mb-1">
              {project.id < 0 ? 'Add Custom Project' : 'Edit Project Details'}
            </h3>
            <p className="text-zinc-500 text-xs mb-5">
              {project.id < 0 ? 'Register a student project outside our GitHub organization' : project.name}
            </p>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {/* Form */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {project.id < 0 && (
                <>
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Project Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Repository URL</label>
                    <input
                      type="url"
                      value={htmlUrl}
                      onChange={(e) => setHtmlUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Difficulty</label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                    <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-white text-sm h-9 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Status</label>
                  <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                    <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-white text-sm h-9 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="maintained">Maintained</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Walkthrough Video URL</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">Homepage/Demo URL</label>
                <input
                  type="url"
                  value={homepage}
                  onChange={(e) => setHomepage(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none"
                />
              </div>

              {/* Toggles */}
              <div className="flex justify-between items-center gap-4 py-2 border-t border-zinc-900 mt-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isFeatured"
                    checked={isFeatured}
                    onCheckedChange={(c) => setIsFeatured(c === true)}
                    className="border-zinc-700 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                  />
                  <label htmlFor="isFeatured" className="text-zinc-400 text-xs font-semibold uppercase tracking-wider cursor-pointer">
                    Featured Showcase
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isArchived"
                    checked={isArchived}
                    onCheckedChange={(c) => setIsArchived(c === true)}
                    className="border-zinc-700 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                  />
                  <label htmlFor="isArchived" className="text-zinc-400 text-xs font-semibold uppercase tracking-wider cursor-pointer">
                    Archived
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-900 mt-5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-transparent border border-zinc-900 hover:bg-zinc-900 text-zinc-400 rounded-lg text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                {isSaving && <Loader2 size={12} className="animate-spin" />}
                Save Config
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};



interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function ProjectAdmin() {
  const { isAdmin, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  // Fetch repositories via SWR cache
  const [projects, setProjects] = useState<Repository[]>([]);
  const { data: cachedProjects, error: projectsError, mutate } = useSWR(isAdmin ? 'admin_projects' : null, fetchAdminProjects);

  useEffect(() => {
    if (cachedProjects) {
      setProjects(cachedProjects);
    }
  }, [cachedProjects]);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState<Repository | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isAuthLoading, navigate]);

  const isLoading = isAuthLoading || (!cachedProjects && !projectsError);

  const handleSaveProject = async (updated: Repository) => {
    try {
      if (updated.id < 0) {
        // Create custom project
        const randomId = Math.floor(Date.now() / 1000);
        const { error } = await supabase
          .from('repositories')
          .insert({
            id: randomId,
            github_repo_id: randomId,
            name: updated.name,
            description: updated.description,
            html_url: updated.html_url,
            difficulty: updated.difficulty,
            project_status: updated.project_status,
            video_url: updated.video_url,
            homepage: updated.homepage,
            is_featured: updated.is_featured,
            is_archived: updated.is_archived
          });

        if (error) throw error;
        addToast('success', 'Custom project added successfully!');
      } else {
        // Update project
        const { error } = await supabase
          .from('repositories')
          .update({
            name: updated.name,
            description: updated.description,
            html_url: updated.html_url,
            difficulty: updated.difficulty,
            project_status: updated.project_status,
            video_url: updated.video_url,
            homepage: updated.homepage,
            is_featured: updated.is_featured,
            is_archived: updated.is_archived,
            last_synced_at: new Date().toISOString()
          })
          .eq('id', updated.id);

        if (error) throw error;
        addToast('success', 'Project details saved!');
        
        // Optimistically update the UI state immediately
        setProjects(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
      }
      mutate();
    } catch (err: any) {
      console.error('Error saving project:', err);
      throw err;
    }
  };

  const handleDeleteProject = (projectId: number) => {
    setDeletingProjectId(projectId);
  };

  const confirmDeleteProject = async () => {
    if (deletingProjectId === null) return;
    try {
      // Soft-delete the project by setting is_visible to false
      // This prevents the hourly github-sync cron from recreating it in the DB
      const { error } = await supabase
        .from('repositories')
        .update({ is_visible: false })
        .eq('id', deletingProjectId);

      if (error) throw error;

      addToast('success', 'Project deleted successfully');
      setProjects(prev => prev.filter(p => p.id !== deletingProjectId));
      mutate();
    } catch (err: any) {
      console.error('Error deleting project:', err);
      addToast('error', err.message || 'Failed to delete project');
    }
  };

  const handleAddCustom = () => {
    const mockProject: Repository = {
      id: -1,
      github_repo_id: -1,
      name: '',
      description: '',
      html_url: '',
      is_archived: false,
      is_featured: false,
      stars: 0,
      forks: 0,
      pushed_at: null,
      last_synced_at: null,
      archival_reason: null,
      is_revivable: true,
      topics: [],
      difficulty: 'beginner',
      project_status: 'in_progress',
      video_url: null,
      homepage: null,
      language: null
    };
    setEditingProject(mockProject);
  };

  const filteredProjects = searchQuery
    ? projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  const difficultyColors: Record<string, string> = {
    beginner: 'text-green-400 bg-green-500/10 border-green-500/20',
    intermediate: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    advanced: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  const statusColors: Record<string, string> = {
    in_progress: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    completed: 'text-green-400 bg-green-500/10 border-green-500/20',
    maintained: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    archived: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20',
  };

  if (!isAdmin || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#09090b] text-white pt-20 pb-16 font-sans">
        {/* Subtle Background Surface Grid */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
        </div>

        {/* Dynamic Minimal Toasts */}
        <div className="fixed top-24 right-4 z-50 flex flex-col gap-2">
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg text-xs font-medium ${
                toast.type === 'success'
                  ? 'bg-zinc-950/80 border-green-500/20 text-green-400'
                  : 'bg-zinc-950/80 border-red-500/20 text-red-400'
              }`}
            >
              <CheckCircle2 size={14} />
              {toast.message}
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12"
          >
            <div>
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-semibold uppercase tracking-wider mb-3"
              >
                <ArrowLeft size={14} />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold tracking-tight font-heading text-white">
                Project Showcase
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                Configure repository difficulty, feature showcase statuses, and register custom side-projects.
              </p>
            </div>
            <button
              onClick={handleAddCustom}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-zinc-200 transition-colors shadow-sm"
            >
              <Plus size={14} />
              Add Custom Project
            </button>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-900 rounded-lg text-xs text-white placeholder-zinc-700 focus:border-zinc-800 focus:outline-none transition-colors"
              />
            </div>
            <span className="text-zinc-500 text-xs font-semibold">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
            </span>
          </motion.div>

          {/* Table Area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden backdrop-blur-md"
          >
            {filteredProjects.length === 0 ? (
              <div className="text-center py-20">
                <Search size={36} className="mx-auto text-zinc-800 mb-3" />
                <p className="text-zinc-500 text-xs">No projects found matching the criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 text-[10px] uppercase font-bold tracking-widest">
                      <th className="py-3 px-6 font-bold">Project Details</th>
                      <th className="py-3 px-6 font-bold">Difficulty</th>
                      <th className="py-3 px-6 font-bold">Status</th>
                      <th className="py-3 px-6 font-bold">Showcase</th>
                      <th className="py-3 px-6 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/50">
                    {filteredProjects.map((project) => (
                      <tr key={project.id} className="group hover:bg-zinc-900/10">
                        <td className="px-6 py-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-white truncate">{project.name}</p>
                              {project.is_featured && (
                                <Star size={12} className="fill-yellow-500 text-yellow-500" />
                              )}
                              {project.is_archived && (
                                <Archive size={12} className="text-zinc-500" />
                              )}
                            </div>
                            <p className="text-zinc-500 text-xs line-clamp-1 mt-0.5 max-w-lg">
                              {project.description || 'No description provided.'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${difficultyColors[project.difficulty] || 'text-zinc-500 border-zinc-900 bg-zinc-950'}`}>
                            {project.difficulty || 'Not set'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[project.project_status] || 'text-zinc-500 border-zinc-900 bg-zinc-950'}`}>
                            {project.project_status?.replace('_', ' ') || 'Not set'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {project.video_url ? (
                            <a
                              href={project.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
                            >
                              <Video size={13} />
                              Watch
                              <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="text-zinc-700 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setEditingProject(project)}
                              className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition-colors"
                              title="Edit Details"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="p-1.5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                              title="Delete Project"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <EditModal
        project={editingProject}
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onSave={handleSaveProject}
      />

      <ConfirmModal
        isOpen={deletingProjectId !== null}
        title="Delete Project Showcase"
        message="Are you sure you want to permanently delete this project showcase? This will delete all pull requests linked to it."
        confirmLabel="Delete Project"
        cancelLabel="Keep Project"
        variant="danger"
        onConfirm={confirmDeleteProject}
        onClose={() => setDeletingProjectId(null)}
      />

      <Footer />
    </>
  );
}
