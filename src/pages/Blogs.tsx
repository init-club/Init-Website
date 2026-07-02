import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SortDesc, Plus, X, Calendar, Tag, Hash, Loader2, BookOpen, FileText } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import BlogCard from '../components/blogs/BlogCard';
import WriteBlogModal from '../components/blogs/WriteBlogModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLenis } from '../components/layout/SmoothScroll';
import { supabase } from '../supabaseClient';
import type { Blog } from '../types/blog';
import { BLOG_GUIDELINES } from '../data/blogGuidelines';

const GUIDELINES_BLOG: Blog = {
  id: 'guidelines',
  title: 'Blog Writing Guidelines',
  content: BLOG_GUIDELINES,
  author_name: 'Init Club',
  roll_no: 'ADMIN',
  tags: ['Help', 'Markdown', 'Guide'],
  status: 'published',
  created_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  cover_image_url: 'https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=1974&auto=format&fit=crop'
};

type SortOption = 'newest' | 'oldest';
type SearchType = 'all' | 'roll_no' | 'tags';

export default function BlogsPage() {
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadBlogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setAllBlogs(data || []);

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

  // Client-side filter + sort — instant, no network round-trips
  const blogs = useMemo(() => {
    let filtered = [...allBlogs];

    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase();
      if (searchType === 'roll_no') {
        filtered = filtered.filter(blog => blog.roll_no?.toLowerCase().includes(q));
      } else if (searchType === 'tags') {
        filtered = filtered.filter(blog => blog.tags?.some((tag: string) => tag.toLowerCase().includes(q)));
      } else {
        filtered = filtered.filter(blog =>
          blog.title?.toLowerCase().includes(q) ||
          blog.author_name?.toLowerCase().includes(q) ||
          blog.content?.toLowerCase().includes(q) ||
          blog.roll_no?.toLowerCase().includes(q) ||
          blog.tags?.some((tag: string) => tag.toLowerCase().includes(q))
        );
      }
    }

    if (selectedTag) {
      filtered = filtered.filter(blog => blog.tags?.includes(selectedTag));
    }

    if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.published_at ?? 0).getTime() - new Date(b.published_at ?? 0).getTime());
    }
    // 'newest' order is already the default from the initial fetch

    return filtered;
  }, [allBlogs, debouncedSearchQuery, searchType, selectedTag, sortBy]);

  // Initial load
  useEffect(() => { loadBlogs(); }, []);

  // Lock scroll when modal is open
  const lenis = useLenis();
  useEffect(() => {
    if (selectedBlog) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      lenis?.start();
      document.body.style.overflow = '';
    }
    return () => {
      lenis?.start();
      document.body.style.overflow = '';
    };
  }, [selectedBlog, lenis]);

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
      <main className="pt-20 min-h-screen bg-background overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative py-16 px-4">
          {/* Subtle ambient orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 
                className="text-4xl md:text-6xl font-black mb-6 tracking-tight" 
                style={{ 
                  fontFamily: 'var(--font-heading)',
                  textShadow: '0 0 20px rgba(0, 255, 213, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)' 
                }}
              >
                <span style={{ color: 'var(--text)' }}>Community </span>
                <span style={{
                  background: 'linear-gradient(90deg, #00ffd5, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Blogs
                </span>
              </h1>
              <p className="text-zinc-500 text-base max-w-xl mx-auto mb-8 leading-relaxed">
                Discover insights, tutorials, and stories from our community members.
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowWriteModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                  style={{ background: 'linear-gradient(90deg, #a855f7, #00ffd5)' }}
                >
                  <Plus size={16} />
                  Write a Blog
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedBlog(GUIDELINES_BLOG)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-zinc-300 text-sm font-medium rounded-xl hover:bg-zinc-800 hover:text-white transition-all duration-200 border border-zinc-800"
                >
                  <BookOpen size={16} />
                  Read Guidelines
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="px-4 pb-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 md:p-5"
            >
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={15} />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:border-zinc-700 focus:outline-none transition-colors"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-2 md:flex md:flex-row gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-zinc-600 flex-shrink-0" />
                  <Select value={searchType} onValueChange={(val) => setSearchType(val as SearchType)}>
                    <SelectTrigger className="bg-black/50 border-zinc-800 text-white text-xs h-9 rounded-lg w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fields</SelectItem>
                      <SelectItem value="roll_no">Roll Number</SelectItem>
                      <SelectItem value="tags">Tags</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <SortDesc size={14} className="text-zinc-600 flex-shrink-0" />
                  <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                    <SelectTrigger className="bg-black/50 border-zinc-800 text-white text-xs h-9 rounded-lg w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Tag size={12} className="text-zinc-600" />
                  <span className="text-zinc-600 text-xs mr-1 font-mono uppercase tracking-widest">Filter:</span>
                  {allTags.slice(0, 10).map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${selectedTag === tag
                        ? 'text-white border border-purple-500/50'
                        : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
                        }`}
                      style={selectedTag === tag ? { background: 'linear-gradient(90deg, rgba(168,85,247,0.3), rgba(0,255,213,0.2))' } : {}}
                    >
                      {tag}
                    </button>
                  ))}
                  {allTags.length > 10 && (
                    <span className="text-zinc-700 text-xs">+{allTags.length - 10} more</span>
                  )}
                </div>
              )}

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{blogs.length} result{blogs.length !== 1 ? 's' : ''}</span>
                    {selectedTag && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/15 text-purple-400 rounded-full border border-purple-500/20">
                        {selectedTag}
                        <X size={11} className="cursor-pointer hover:text-white" onClick={() => setSelectedTag(null)} />
                      </span>
                    )}
                  </div>
                  <button onClick={clearFilters} className="text-xs text-zinc-600 hover:text-white transition-colors">
                    Clear all
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Blogs Grid */}
        <section className="px-4 pb-20">
          <div className="max-w-5xl mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              </div>
            ) : blogs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="flex justify-center mb-4"><FileText size={48} className="text-zinc-700" /></div>
                <h3 className="text-lg font-bold text-zinc-300 mb-2">No blogs found</h3>
                <p className="text-zinc-600 text-sm mb-6">
                  {searchQuery || selectedTag
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to share your knowledge!'}
                </p>
                <button
                  onClick={() => setShowWriteModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:text-white transition-all text-sm"
                >
                  <Plus size={14} />
                  Write the first blog
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blogs.map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
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
        onSuccess={loadBlogs}
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
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedBlog(null)}
                className="absolute top-4 right-4 z-10 p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors border border-zinc-800"
              >
                <X size={16} />
              </button>

              {/* Cover Image */}
              {selectedBlog.cover_image_url && (
                <div className="relative h-56 overflow-hidden rounded-t-2xl">
                  <img
                    src={selectedBlog.cover_image_url}
                    alt={selectedBlog.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className="p-7">
                {/* Tags */}
                {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {selectedBlog.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/12 text-purple-400 border border-purple-500/20"
                      >
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                  {selectedBlog.title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 mb-7 pb-5 border-b border-zinc-900">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, #a855f7, #00ffd5)' }}
                    >
                      {selectedBlog.author_name.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-zinc-400">{selectedBlog.author_name}</span>
                  </span>
                  {selectedBlog.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
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
                  <div className="whitespace-pre-wrap font-mono text-sm text-zinc-400 leading-relaxed">
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
