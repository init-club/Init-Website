import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Archive, Search, SortDesc, RefreshCw, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import GraveyardCard from '../components/projects/GraveyardCard';
import { supabase } from '../supabaseClient';
import type { Repository } from '../types/repository';

type SortOption = 'recent' | 'stars' | 'name';

export default function GraveyardPage() {
  const [allRepos, setAllRepos] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showRevivableOnly, setShowRevivableOnly] = useState(false);

  // One-time fetch on mount — all filtering is client-side for instant response
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('repositories')
          .select('*')
          .eq('is_archived', true)
          .eq('is_visible', true);

        if (fetchError) throw fetchError;
        setAllRepos(data || []);
      } catch (err) {
        console.error('Error fetching archived repositories:', err);
        setError('Failed to load archived projects. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const repos = useMemo(() => {
    let filtered = [...allRepos];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(repo =>
        repo.name?.toLowerCase().includes(q) ||
        repo.description?.toLowerCase().includes(q) ||
        repo.language?.toLowerCase().includes(q) ||
        repo.topics?.some((t: string) => t.toLowerCase().includes(q)) ||
        repo.archival_reason?.toLowerCase().includes(q)
      );
    }

    if (showRevivableOnly) {
      filtered = filtered.filter(repo => repo.is_revivable === true);
    }

    if (sortBy === 'stars') {
      filtered.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    } else {
      filtered.sort((a, b) => new Date(b.pushed_at ?? 0).getTime() - new Date(a.pushed_at ?? 0).getTime());
    }

    return filtered;
  }, [allRepos, searchQuery, showRevivableOnly, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('recent');
    setShowRevivableOnly(false);
  };

  const hasActiveFilters = Boolean(searchQuery) || showRevivableOnly || sortBy !== 'recent';

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-background overflow-x-hidden">

        {/* Hero */}
        <section className="relative px-4 py-20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto text-center"
          >
            <h1 
              className="text-4xl md:text-6xl font-black mb-6 tracking-tight" 
              style={{ 
                fontFamily: 'var(--font-heading)',
                textShadow: '0 0 20px rgba(0, 255, 213, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)' 
              }}
            >
              <span style={{ color: 'var(--text)' }}>The </span>
              <span style={{
                background: 'linear-gradient(90deg, #00ffd5, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Graveyard
              </span>
            </h1>
            <p className="text-zinc-400 text-base max-w-xl mx-auto mb-3 leading-relaxed">
              A museum of our club's history. These projects may have ended, but their legacy lives on.
              Some are waiting for new contributors to revive them.
            </p>
            <p className="text-zinc-600 text-sm">
              Look for the <span className="text-cyan-400 font-medium">Revivable</span> badge to find projects open for revival.
            </p>
          </motion.div>
        </section>

        {/* Search and Filter */}
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
                  placeholder="Search archived projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:border-zinc-700 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowRevivableOnly(!showRevivableOnly)}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-medium ${
                    showRevivableOnly
                      ? 'text-cyan-300 border-cyan-500/40'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                  style={showRevivableOnly ? { background: 'linear-gradient(90deg, rgba(0,255,213,0.1), rgba(168,85,247,0.1))' } : {}}
                >
                  <RefreshCw size={13} />
                  Revivable Only
                </button>

                <div className="flex items-center gap-2">
                  <SortDesc size={14} className="text-zinc-600 flex-shrink-0" />
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-300 text-xs font-mono h-8 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="stars">Most Stars</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{repos.length} result{repos.length !== 1 ? 's' : ''}</span>
                  <button onClick={clearFilters} className="text-xs text-zinc-600 hover:text-white transition-colors">
                    Clear all
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Grid */}
        <section className="px-4 pb-20">
          <div className="max-w-5xl mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              </div>
            ) : error ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <Archive className="inline-block text-zinc-700 mb-4" size={48} />
                <h3 className="text-lg font-bold text-zinc-300 mb-2">Unable to Load</h3>
                <p className="text-zinc-600 text-sm mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:text-white transition-all text-sm"
                >
                  <RefreshCw size={13} /> Try Again
                </button>
              </motion.div>
            ) : repos.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <Archive className="inline-block text-zinc-700 mb-4" size={48} />
                <h3 className="text-lg font-bold text-zinc-300 mb-2">No Archived Projects Found</h3>
                <p className="text-zinc-600 text-sm mb-6">
                  {hasActiveFilters
                    ? 'Try adjusting your search or filters.'
                    : 'The graveyard is empty. All projects are still active!'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {repos.map((repo, index) => (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <GraveyardCard repo={repo} />
                  </motion.div>
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
