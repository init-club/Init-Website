import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, XCircle, Eye, Calendar, User, Hash, Tag, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { Blog } from '../types/blog';

interface AdminBlogReviewProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminBlogReview = ({ isOpen, onClose }: AdminBlogReviewProps) => {
  const [pendingBlogs, setPendingBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPendingBlogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_pending_blogs');

      if (error) throw error;
      setPendingBlogs(data || []);
    } catch (error: any) {
      console.error('Error fetching pending blogs:', error);
      // Fallback: try direct query (requires admin RLS)
      try {
        const { data, error: fallbackError } = await supabase
          .from('blogs')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (fallbackError) throw fallbackError;
        setPendingBlogs(data || []);
      } catch (fallbackErr) {
        console.error('Fallback fetch also failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPendingBlogs();
    }
  }, [isOpen]);

  const handleApprove = async (blogId: string) => {
    setActionLoading(blogId);
    try {
      const { error } = await supabase.rpc('approve_blog_post', {
        target_blog_id: blogId,
        new_status: 'published'
      });

      if (error) throw error;

      setPendingBlogs(prev => prev.filter(b => b.id !== blogId));
      setSelectedBlog(null);
    } catch (error: any) {
      console.error('Error approving blog:', error);
      alert('Failed to approve: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (blogId: string) => {
    if (!confirm('Are you sure you want to reject this blog?')) return;

    setActionLoading(blogId);
    try {
      const { error } = await supabase.rpc('approve_blog_post', {
        target_blog_id: blogId,
        new_status: 'rejected'
      });

      if (error) throw error;

      setPendingBlogs(prev => prev.filter(b => b.id !== blogId));
      setSelectedBlog(null);
    } catch (error: any) {
      console.error('Error rejecting blog:', error);
      alert('Failed to reject: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
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
        className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-gray-900 border border-gray-800 rounded-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Blog Review Panel</h2>
            <p className="text-gray-400 text-sm mt-1">
              {pendingBlogs.length} pending submission{pendingBlogs.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Blog List */}
          <div className="w-1/3 border-r border-gray-800 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
              </div>
            ) : pendingBlogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <Check className="w-12 h-12 text-green-500 mb-4" />
                <p className="text-gray-400">All caught up!</p>
                <p className="text-gray-600 text-sm">No pending blogs to review</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {pendingBlogs.map(blog => (
                  <button
                    key={blog.id}
                    onClick={() => setSelectedBlog(blog)}
                    className={`w-full text-left p-4 hover:bg-gray-800/50 transition-colors ${selectedBlog?.id === blog.id ? 'bg-purple-500/10 border-l-2 border-purple-500' : ''
                      }`}
                  >
                    <h3 className="text-white font-medium line-clamp-1">{blog.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">by {blog.author_name}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                      <Calendar size={12} />
                      {new Date(blog.created_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Blog Preview */}
          <div className="flex-1 overflow-y-auto">
            {selectedBlog ? (
              <div className="p-6">
                {/* Cover Image */}
                {selectedBlog.cover_image_url && (
                  <div className="relative h-48 rounded-xl overflow-hidden mb-6">
                    <img
                      src={selectedBlog.cover_image_url}
                      alt={selectedBlog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Tags */}
                {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedBlog.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300"
                      >
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-2xl font-bold text-white mb-4">{selectedBlog.title}</h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6 pb-4 border-b border-gray-800">
                  <span className="flex items-center gap-2">
                    <User size={14} className="text-cyan-400" />
                    {selectedBlog.author_name}
                  </span>
                  {selectedBlog.roll_no && (
                    <span className="flex items-center gap-1">
                      <Hash size={14} />
                      {selectedBlog.roll_no}
                    </span>
                  )}
                  {selectedBlog.phone_number && (
                    <span className="text-yellow-500/70 text-xs">
                      Phone: {selectedBlog.phone_number}
                    </span>
                  )}
                </div>

                {/* Content Preview */}
                <div className="prose prose-invert prose-sm max-w-none mb-8">
                  <div className="whitespace-pre-wrap text-gray-300">
                    {selectedBlog.content}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-gray-900 pt-4 border-t border-gray-800 flex gap-4">
                  <button
                    onClick={() => handleApprove(selectedBlog.id)}
                    disabled={actionLoading === selectedBlog.id}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === selectedBlog.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Check size={18} />
                    )}
                    Approve & Publish
                  </button>
                  <button
                    onClick={() => handleReject(selectedBlog.id)}
                    disabled={actionLoading === selectedBlog.id}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Eye className="w-12 h-12 text-gray-700 mb-4" />
                <p className="text-gray-500">Select a blog to preview</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminBlogReview;
