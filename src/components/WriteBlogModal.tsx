import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Hash, FileText, Image, Tag, Send, Eye, Edit3 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { BlogFormData } from '../types/blog';

interface WriteBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SUGGESTED_TAGS = ['AI', 'Web Dev', 'IoT', 'Mobile', 'Cloud', 'Security', 'DevOps', 'ML', 'Blockchain', 'Open Source'];

const WriteBlogModal = ({ isOpen, onClose, onSuccess }: WriteBlogModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<BlogFormData>({
    author_name: '',
    roll_no: '',
    phone_number: '',
    title: '',
    content: '',
    tags: [],
    cover_image_url: ''
  });
  const [customTag, setCustomTag] = useState('');
  // Honeypot field for bot protection
  const [honeypot, setHoneypot] = useState('');

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()]
      }));
      setCustomTag('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Bot protection: if honeypot is filled, silently reject
    if (honeypot) {
      onClose();
      return;
    }

    if (!formData.author_name || !formData.roll_no || !formData.title || !formData.content) {
      alert('Please fill all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Generate a slug from the title
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
        .replace(/(^-|-$)+/g, '') // Remove leading/trailing hyphens
        + '-' + Date.now(); // Add timestamp to ensure uniqueness

      const { error } = await supabase.from('blogs').insert({
        author_name: formData.author_name,
        roll_no: formData.roll_no,
        phone_number: formData.phone_number || null,
        title: formData.title,
        slug: slug, // Add the generated slug
        content: formData.content,
        tags: formData.tags,
        cover_image_url: formData.cover_image_url || null,
        status: 'pending'
      });

      if (error) throw error;

      alert('Blog submitted successfully! It will be published after admin approval.');
      setFormData({
        author_name: '',
        roll_no: '',
        phone_number: '',
        title: '',
        content: '',
        tags: [],
        cover_image_url: ''
      });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Submit error:', error);
      alert('Failed to submit blog: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-black/95 rounded-2xl shadow-2xl border border-purple-500/40">
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />

              {/* Header */}
              <div className="sticky top-0 z-10 bg-black/95 border-b border-gray-800 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Edit3 className="text-purple-400" size={24} />
                    Write a Blog
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Share your knowledge with the community</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className={`p-2 rounded-lg border transition-all ${showPreview
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 rounded-lg transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Honeypot - hidden from users */}
                <input
                  type="text"
                  name="website_url"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* Author Info Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <User size={14} className="text-cyan-400" />
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.author_name}
                      onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                      className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <Hash size={14} className="text-cyan-400" />
                      Roll Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="21BCE1234"
                      value={formData.roll_no}
                      onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                      className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <Phone size={14} className="text-gray-500" />
                      Phone <span className="text-gray-500 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-gray-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <FileText size={14} className="text-cyan-400" />
                    Blog Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="An Awesome Title for Your Blog"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white text-lg focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Cover Image URL */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Image size={14} className="text-gray-500" />
                    Cover Image URL <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.cover_image_url}
                    onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                    className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-gray-600 focus:outline-none transition-colors"
                  />
                  {formData.cover_image_url && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-gray-700 max-h-40">
                      <img
                        src={formData.cover_image_url}
                        alt="Cover preview"
                        className="w-full h-40 object-cover"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Tag size={14} className="text-purple-400" />
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${formData.tags.includes(tag)
                          ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                          : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom tag..."
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                      className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.filter(t => !SUGGESTED_TAGS.includes(t)).map(tag => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 rounded-full text-sm bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-2"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className="hover:text-red-400"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <FileText size={14} className="text-cyan-400" />
                    Content <span className="text-red-500">*</span>
                    <span className="text-gray-500 text-xs ml-2">(Markdown supported)</span>
                  </label>
                  {showPreview ? (
                    <div className="w-full bg-black/50 border border-gray-700 rounded-lg p-4 text-white min-h-[300px] prose prose-invert max-w-none">
                      <div className="whitespace-pre-wrap">{formData.content || 'Nothing to preview...'}</div>
                    </div>
                  ) : (
                    <textarea
                      required
                      placeholder="Write your blog content here... (Markdown is supported)"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full bg-black/50 border border-gray-700 rounded-lg p-4 text-white focus:border-cyan-500 focus:outline-none transition-colors min-h-[300px] resize-y font-mono text-sm"
                    />
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-gray-800">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Submit for Review
                      </>
                    )}
                  </button>
                  <p className="text-center text-gray-500 text-xs mt-3">
                    Your blog will be reviewed by an admin before publishing
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WriteBlogModal;
