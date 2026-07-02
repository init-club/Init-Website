import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Loader2, Search, Edit2, Trash2, X, Plus,
  FileText, Check, AlertCircle, CheckCircle2, Eye, Calendar, User, Tag, Send
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { supabase } from '../../supabaseClient';
import type { Blog } from '../../types/blog';
import useSWR from 'swr';
import { fetchAdminBlogs } from '../../utils/fetchers';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/shared/modals/ConfirmModal';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function BlogsAdminPage() {
  const { session, isAdmin, userProfile, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  // Fetch blogs via SWR cache
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const { data: cachedBlogs, error: blogsError, mutate } = useSWR(isAdmin ? 'admin_blogs' : null, fetchAdminBlogs);

  useEffect(() => {
    if (cachedBlogs) {
      setBlogs(cachedBlogs);
    }
  }, [cachedBlogs]);

  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'create'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Current logged in admin profile
  const [adminUserRowId, setAdminUserRowId] = useState<string | null>(null);

  // Edit / Create Form States
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Preview States
  const [previewBlog, setPreviewBlog] = useState<Blog | null>(null);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);
  
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAdmin) {
        navigate('/');
      } else if (userProfile) {
        setAdminUserRowId(userProfile.id);
        setAuthorName(userProfile.name || '');
      }
    }
  }, [isAdmin, isAuthLoading, userProfile, navigate]);

  const isLoading = isAuthLoading || (!cachedBlogs && !blogsError);

  const handleApproveReject = async (blogId: string, newStatus: 'published' | 'rejected') => {
    try {
      const { error } = await supabase.rpc('approve_blog_post', {
        target_blog_id: blogId,
        new_status: newStatus
      });

      if (error) throw error;

      addToast('success', `Blog post ${newStatus === 'published' ? 'approved' : 'rejected'} successfully!`);
      mutate();
    } catch (err: any) {
      console.error('Error approving/rejecting blog:', err);
      addToast('error', err.message || 'Action failed');
    }
  };

  const handleDelete = (blogId: string) => {
    setDeletingBlogId(blogId);
  };

  const confirmDeleteBlog = async () => {
    if (deletingBlogId === null) return;
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', deletingBlogId);

      if (error) throw error;

      addToast('success', 'Blog post deleted successfully');
      mutate();
      setBlogs(prev => prev.filter(b => b.id !== deletingBlogId));
    } catch (err: any) {
      console.error('Error deleting blog:', err);
      addToast('error', err.message || 'Failed to delete blog');
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);
    try {
      const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(Date.now() / 1000)}`;

      if (editingBlog) {
        // Edit Blog
        const { error } = await supabase
          .from('blogs')
          .update({
            title: title.trim(),
            content: content.trim(),
            tags,
            cover_image_url: coverImageUrl.trim() || null,
            author_name: authorName.trim() || 'Admin'
          })
          .eq('id', editingBlog.id);

        if (error) throw error;
        addToast('success', 'Blog post updated successfully!');
        setEditingBlog(null);
      } else {
        // Create direct published Admin Blog
        const { error } = await supabase
          .from('blogs')
          .insert({
            title: title.trim(),
            slug,
            content: content.trim(),
            tags,
            cover_image_url: coverImageUrl.trim() || null,
            author_name: authorName.trim() || 'Admin',
            author_id: adminUserRowId,
            status: 'published',
            is_published: true,
            published_at: new Date().toISOString()
          });

        if (error) throw error;
        addToast('success', 'Blog post published immediately!');
        setActiveTab('published');
      }

      // Reset fields
      setTitle('');
      setContent('');
      setTags([]);
      setCoverImageUrl('');
      mutate();
    } catch (err: any) {
      console.error('Error saving blog:', err);
      addToast('error', err.message || 'Failed to save blog');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setContent(blog.content);
    setTags(blog.tags || []);
    setCoverImageUrl(blog.cover_image_url || '');
    setAuthorName(blog.author_name || '');
  };

  const handleTagToggle = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const filteredBlogs = searchQuery
    ? blogs.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : blogs;

  const tabFilteredBlogs = filteredBlogs.filter(b => {
    if (activeTab === 'pending') return b.status === 'pending';
    if (activeTab === 'published') return b.status === 'published';
    return false;
  });

  const SUGGESTED_TAGS = ['AI', 'Web Dev', 'IoT', 'Mobile', 'Cloud', 'Security', 'DevOps', 'ML', 'Blockchain', 'Open Source'];

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

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
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
                Blog Submissions
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                Moderate draft submissions, update published articles, and write direct admin updates.
              </p>
            </div>
          </motion.div>

          {/* Sub Nav Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4 border-b border-zinc-950 pb-5 mb-8"
          >
            <div className="inline-flex rounded-lg border border-zinc-900 p-0.5 bg-zinc-950">
              <button
                onClick={() => { setActiveTab('pending'); setEditingBlog(null); }}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  activeTab === 'pending' && !editingBlog
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Pending Reviews ({blogs.filter(b => b.status === 'pending').length})
              </button>
              <button
                onClick={() => { setActiveTab('published'); setEditingBlog(null); }}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  activeTab === 'published' && !editingBlog
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Published ({blogs.filter(b => b.status === 'published').length})
              </button>
              <button
                onClick={() => { setActiveTab('create'); setEditingBlog(null); }}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  activeTab === 'create' || editingBlog
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {editingBlog ? 'Edit Post' : 'Write Post'}
              </button>
            </div>

            {activeTab !== 'create' && !editingBlog && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-650" size={13} />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-900 rounded-lg text-xs text-white placeholder-zinc-700 focus:border-zinc-800 focus:outline-none transition-colors"
                />
              </div>
            )}
          </motion.div>

          {/* Tab contents */}
          <div className="min-h-[40vh]">
            {activeTab === 'create' || editingBlog ? (
              // Create / Edit Form
              <motion.form
                onSubmit={handleSaveBlog}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 max-w-3xl bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 backdrop-blur-md"
              >
                <div className="border-b border-zinc-900 pb-4 mb-4 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {editingBlog ? 'Modify Blog Draft' : 'Publish New Admin Post'}
                  </h3>
                  {editingBlog && (
                    <button
                      type="button"
                      onClick={() => setEditingBlog(null)}
                      className="text-xs text-zinc-500 hover:text-white"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-zinc-400 text-[10px] font-semibold uppercase tracking-widest mb-1.5">Article Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Title of your post..."
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-850"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 text-[10px] font-semibold uppercase tracking-widest mb-1.5">Author Display Name</label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Author name..."
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-850"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-[10px] font-semibold uppercase tracking-widest mb-1.5">Cover Image URL (Optional)</label>
                      <input
                        type="url"
                        value={coverImageUrl}
                        onChange={(e) => setCoverImageUrl(e.target.value)}
                        placeholder="https://example.com/cover.jpg"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-lg text-xs text-white focus:outline-none focus:border-zinc-850"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-[10px] font-semibold uppercase tracking-widest mb-1.5">Suggested Tags</label>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {SUGGESTED_TAGS.map(tag => {
                        const isSelected = tags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className={`px-2.5 py-1 text-[10px] rounded-lg border transition-all ${
                              isSelected
                                ? 'bg-white text-black font-semibold border-white'
                                : 'bg-transparent border-zinc-900 text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Custom tag..."
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        className="px-2.5 py-1 bg-zinc-950 border border-zinc-900 rounded-lg text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomTag}
                        className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-[10px] font-semibold uppercase tracking-widest mb-1.5">Content Markdown</label>
                    <textarea
                      required
                      rows={12}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your article in markdown format..."
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-900 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-zinc-850"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    {editingBlog ? 'Save Changes' : 'Publish Instantly'}
                  </button>
                </div>
              </motion.form>
            ) : (
              // Lists
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {tabFilteredBlogs.length === 0 ? (
                  <div className="text-center py-20 border border-zinc-900 rounded-2xl bg-zinc-950/20">
                    <FileText className="mx-auto text-zinc-850 mb-3" size={32} />
                    <p className="text-zinc-500 text-xs">No blogs found in this tab.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tabFilteredBlogs.map(blog => (
                      <div
                        key={blog.id}
                        className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 hover:border-zinc-850 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                              blog.status === 'pending'
                                ? 'bg-yellow-500/5 text-yellow-500 border-yellow-500/10'
                                : blog.status === 'published'
                                ? 'bg-green-500/5 text-green-400 border-green-500/10'
                                : 'bg-red-500/5 text-red-400 border-red-500/10'
                            }`}>
                              {blog.status}
                            </span>
                            <div className="flex items-center gap-1.5 text-zinc-500 text-[10px]">
                              <Calendar size={11} />
                              {new Date(blog.created_at || '').toLocaleDateString()}
                            </div>
                          </div>

                          <h4 className="text-white font-bold text-sm leading-snug line-clamp-1">{blog.title}</h4>
                          <p className="text-zinc-500 text-xs line-clamp-2 mt-1.5 leading-relaxed">{blog.content}</p>

                          {/* Tags Display */}
                          {blog.tags && blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3.5">
                              {blog.tags.map(t => (
                                <span key={t} className="px-2 py-0.5 bg-zinc-900 border border-zinc-900/60 rounded text-[9px] text-zinc-400">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between border-t border-zinc-900/60 pt-4 mt-5">
                          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-semibold">
                            <User size={12} />
                            {blog.author_name || 'Anonymous'}
                          </div>

                          <div className="inline-flex gap-2">
                            {blog.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveReject(blog.id, 'published')}
                                  className="p-1.5 hover:bg-green-500/10 text-zinc-500 hover:text-green-400 rounded-lg transition-colors"
                                  title="Approve Submission"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => handleApproveReject(blog.id, 'rejected')}
                                  className="p-1.5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                                  title="Reject Submission"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setPreviewBlog(blog)}
                              className="p-1.5 hover:bg-zinc-900 text-zinc-500 hover:text-white rounded-lg transition-colors"
                              title="Preview Article"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => handleStartEdit(blog)}
                              className="p-1.5 hover:bg-zinc-900 text-zinc-500 hover:text-white rounded-lg transition-colors"
                              title="Edit Article"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(blog.id)}
                              className="p-1.5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                              title="Delete Article"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        <AnimatePresence>
          {previewBlog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4 py-8">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => setPreviewBlog(null)}
                  className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>

                <div className="border-b border-zinc-900 pb-4 mb-4">
                  <h3 className="text-lg font-bold text-white">{previewBlog.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2">
                    <span className="flex items-center gap-1">
                      <User size={12} /> {previewBlog.author_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(previewBlog.created_at || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {previewBlog.cover_image_url && (
                  <img
                    src={previewBlog.cover_image_url}
                    alt="Cover"
                    className="w-full h-48 object-cover rounded-xl border border-zinc-900 mb-4"
                  />
                )}

                <div className="text-zinc-300 text-xs font-mono leading-relaxed whitespace-pre-wrap font-sans">
                  {previewBlog.content}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
      <ConfirmModal
        isOpen={deletingBlogId !== null}
        title="Delete Blog Post"
        message="Are you sure you want to permanently delete this blog post? This action is irreversible."
        confirmLabel="Delete Post"
        cancelLabel="Keep Post"
        variant="danger"
        onConfirm={confirmDeleteBlog}
        onClose={() => setDeletingBlogId(null)}
      />

      <Footer />
    </>
  );
}
