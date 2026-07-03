import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, ClipboardList, FileText, Filter, Loader2, Search, SortDesc, X } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchPublishedForms } from '../utils/fetchers';

type PublishedForm = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: 'draft' | 'published' | 'closed';
  updated_at: string;
};

type SortOption = 'newest' | 'oldest' | 'title';

export default function FormsPage() {
  const [forms, setForms] = useState<PublishedForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const loadForms = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPublishedForms();
        setForms(data as PublishedForm[]);
      } catch (error) {
        console.error('Error fetching published forms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadForms();
  }, []);

  const visibleForms = useMemo(() => {
    let filtered = [...forms];

    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (form) =>
          form.title.toLowerCase().includes(q) ||
          (form.description || '').toLowerCase().includes(q) ||
          form.slug.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }

    return filtered;
  }, [forms, debouncedSearchQuery, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('newest');
  };

  const hasActiveFilters = Boolean(searchQuery) || sortBy !== 'newest';

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-background overflow-x-hidden">
        <section className="relative py-16 px-4">
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
                  textShadow: '0 0 20px rgba(0,255,213,0.45), 0 0 40px rgba(168,85,247,0.25)',
                }}
              >
                <span style={{ color: 'var(--text)' }}>Community </span>
                <span
                  style={{
                    background: 'linear-gradient(90deg, #00ffd5, #a855f7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Forms
                </span>
              </h1>
              <p className="text-zinc-500 text-base max-w-xl mx-auto mb-8 leading-relaxed">
                Every published form is listed here. Open one to submit without refreshing the page.
              </p>


            </motion.div>
          </div>
        </section>

        <section className="px-4 pb-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 md:p-5"
            >
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={15} />
                <input
                  type="text"
                  placeholder="Search published forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:border-zinc-700 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 md:flex md:flex-row gap-3">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-zinc-600 flex-shrink-0" />
                  <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                    <SelectTrigger className="bg-black/50 border-zinc-800 text-white text-xs h-9 rounded-lg w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <SortDesc size={14} className="text-zinc-600 flex-shrink-0" />
                  <span className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
                    Sorted
                  </span>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{visibleForms.length} result{visibleForms.length !== 1 ? 's' : ''}</span>
                    {searchQuery && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/15 text-purple-400 rounded-full border border-purple-500/20">
                        {searchQuery}
                        <X size={11} className="cursor-pointer hover:text-white" onClick={() => setSearchQuery('')} />
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

        <section className="px-4 pb-20">
          <div className="max-w-5xl mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              </div>
            ) : visibleForms.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <div className="flex justify-center mb-4">
                  <FileText size={48} className="text-zinc-700" />
                </div>
                <h3 className="text-lg font-bold text-zinc-300 mb-2">No forms found</h3>
                <p className="text-zinc-600 text-sm mb-6">
                  {searchQuery ? 'Try adjusting your search.' : 'There are no published forms yet.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:text-white transition-all text-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleForms.map((form, index) => (
                  <motion.article
                    key={form.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="group relative bg-zinc-950/40 border border-zinc-900 rounded-3xl p-5 hover:border-zinc-800 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-purple-500/0 group-hover:from-cyan-500/5 group-hover:to-purple-500/5 transition-colors duration-300 pointer-events-none" />
                    <div className="relative flex flex-col h-full">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <h2 className="text-xl font-black tracking-tight text-white group-hover:text-cyan-100 transition-colors line-clamp-1">
                            {form.title}
                          </h2>
                          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-purple-400 mt-1">
                            /forms/{form.slug}
                          </p>
                        </div>
                        <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          Live
                        </span>
                      </div>

                      <p className="text-sm text-zinc-500 leading-relaxed min-h-[3rem]">
                        {form.description || 'No description provided.'}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-zinc-600 mt-4">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={12} />
                          Updated {new Date(form.updated_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="mt-5 pt-4 border-t border-zinc-900 flex items-center justify-between gap-3">
                        <p className="text-xs text-zinc-500">Open this form to submit your response.</p>
                        <Link
                          to={`/forms/${form.slug}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
                        >
                          Open Form
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
