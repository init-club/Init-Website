import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SortDesc, Plus, X, Calendar, Tag, Hash, Loader2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import BlogCard from '../components/BlogCard';
import WriteBlogModal from '../components/WriteBlogModal';
import { supabase } from '../supabaseClient';
import type { Blog } from '../types/blog';

type SortOption = 'newest' | 'oldest';
type SearchType = 'all' | 'roll_no' | 'tags';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('blogs')
        .select('*')
        .eq('status', 'published');

      // Apply sorting
      query = query.order('published_at', { ascending: sortBy === 'oldest' });

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      // Apply search filter
      if (searchQuery.trim()) {
        if (searchType === 'roll_no') {
          filteredData = filteredData.filter(blog =>
            blog.roll_no?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        } else if (searchType === 'tags') {
          filteredData = filteredData.filter(blog =>
            blog.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        } else {
          // Search all: title, author, content, roll_no, tags
          const query = searchQuery.toLowerCase();
          filteredData = filteredData.filter(blog =>
            blog.title?.toLowerCase().includes(query) ||
            blog.author_name?.toLowerCase().includes(query) ||
            blog.content?.toLowerCase().includes(query) ||
            blog.roll_no?.toLowerCase().includes(query) ||
            blog.tags?.some((tag: string) => tag.toLowerCase().includes(query))
          );
        }
      }

      // Apply tag filter
      if (selectedTag) {
        filteredData = filteredData.filter(blog =>
          blog.tags?.includes(selectedTag)
        );
      }

      setBlogs(filteredData);

      // Extract unique tags
      const tags = new Set<string>();
      (data || []).forEach(blog => {
        blog.tags?.forEach((tag: string) => tags.add(tag));
      });
      setAllTags(Array.from(tags).sort());
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBlogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchType, selectedTag]);

  const clearFilters = () => {
    setSearchQuery('');
    setSearchType('all');
    setSelectedTag(null);
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || selectedTag || sortBy !== 'newest';

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-black">
        {/* Hero Section */}
        <section className="relative py-16 px-4 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">
                <span className="text-white">Community </span>
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Blogs
                </span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                Discover insights, tutorials, and stories from our community members.
                Share your knowledge and experiences with fellow developers.
              </p>

              {/* Write Blog CTA */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowWriteModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                <Plus size={20} />
                Write a Blog
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="px-4 pb-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 md:p-6"
            >
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-2 md:flex md:flex-row gap-3 mb-4">
                {/* Search Type Selector */}
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-500 flex-shrink-0" />
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as SearchType)}
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="all">All Fields</option>
                    <option value="roll_no">Roll Number</option>
                    <option value="tags">Tags</option>
                  </select>
                </div>

                {/* Sort Selector */}
                <div className="flex items-center gap-2">
                  <SortDesc size={16} className="text-gray-500 flex-shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Tag size={14} className="text-gray-500" />
                  <span className="text-gray-500 text-sm mr-2">Filter by tag:</span>
                  {allTags.slice(0, 10).map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedTag === tag
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {allTags.length > 10 && (
                    <span className="text-gray-600 text-xs">+{allTags.length - 10} more</span>
                  )}
                </div>
              )}

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>Showing {blogs.length} result{blogs.length !== 1 ? 's' : ''}</span>
                    {selectedTag && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                        {selectedTag}
                        <X
                          size={12}
                          className="cursor-pointer hover:text-white"
                          onClick={() => setSelectedTag(null)}
                        />
                      </span>
                    )}
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Blogs Grid */}
        <section className="px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : blogs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-white mb-2">No blogs found</h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery || selectedTag
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to share your knowledge!'}
                </p>
                <button
                  onClick={() => setShowWriteModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
                >
                  <Plus size={16} />
                  Write the first blog
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <BlogCard blog={blog} onClick={() => setSelectedBlog(blog)} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Write Blog Modal */}
      <WriteBlogModal
        isOpen={showWriteModal}
        onClose={() => setShowWriteModal(false)}
        onSuccess={fetchBlogs}
      />

      {/* Blog Detail Modal */}
      <AnimatePresence>
        {selectedBlog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedBlog(null)}
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
                onClick={() => setSelectedBlog(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {/* Cover Image */}
              {selectedBlog.cover_image_url && (
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={selectedBlog.cover_image_url}
                    alt={selectedBlog.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className="p-8">
                {/* Tags */}
                {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedBlog.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      >
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {selectedBlog.title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-800">
                  <span className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {selectedBlog.author_name.charAt(0).toUpperCase()}
                    </span>
                    {selectedBlog.author_name}
                  </span>
                  {selectedBlog.roll_no && (
                    <span className="flex items-center gap-1">
                      <Hash size={14} />
                      {selectedBlog.roll_no}
                    </span>
                  )}
                  {selectedBlog.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(selectedBlog.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  )}
                </div>

                {/* Blog Content */}
                <article className="prose prose-invert prose-purple max-w-none">
                  <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                    {selectedBlog.content}
                  </div>
                </article>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
