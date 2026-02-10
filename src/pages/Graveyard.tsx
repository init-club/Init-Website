import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SortDesc, RefreshCw, Loader2, Archive } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import GraveyardCard from '../components/GraveyardCard';
import { supabase } from '../supabaseClient';
import type { Repository } from '../types/repository';

type SortOption = 'recent' | 'stars' | 'name';

export default function GraveyardPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showRevivableOnly, setShowRevivableOnly] = useState(false);

  const fetchArchivedRepos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('repositories')
        .select('*')
        .eq('is_archived', true);

      // Apply sorting
      if (sortBy === 'recent') {
        query = query.order('pushed_at', { ascending: false });
      } else if (sortBy === 'stars') {
        query = query.order('stars', { ascending: false });
      } else if (sortBy === 'name') {
        query = query.order('name', { ascending: true });
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      let filteredData = data || [];

      // Apply search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filteredData = filteredData.filter(repo =>
          repo.name?.toLowerCase().includes(q) ||
          repo.description?.toLowerCase().includes(q) ||
          repo.language?.toLowerCase().includes(q) ||
          repo.topics?.some((topic: string) => topic.toLowerCase().includes(q)) ||
          repo.archival_reason?.toLowerCase().includes(q)
        );
      }

      // Apply revivable filter
      if (showRevivableOnly) {
        filteredData = filteredData.filter(repo => repo.is_revivable === true);
      }

      setRepos(filteredData);
    } catch (err) {
      console.error('Error fetching archived repositories:', err);
      setError('Failed to load archived projects. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedRepos();
  }, [sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArchivedRepos();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, showRevivableOnly]);

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('recent');
    setShowRevivableOnly(false);
  };

  const hasActiveFilters = searchQuery || showRevivableOnly || sortBy !== 'recent';

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-black">
        {/* Hero Section */}
        <section className="relative py-16 px-4 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                  <Archive size={48} className="text-purple-400" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">
                <span className="text-white">The </span>
                <span className="bg-gradient-to-r from-purple-400 to-gray-400 bg-clip-text text-transparent">
                  Graveyard
                </span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-4">
                A museum of our club's history. These projects may have ended, but their legacy lives on.
                Some are waiting for new contributors to revive them.
              </p>
              <p className="text-gray-500 text-sm max-w-xl mx-auto">
                Look for the <span className="text-cyan-400 font-medium">Revivable</span> badge to find projects open for revival.
              </p>
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
                  placeholder="Search archived projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-2 md:flex md:flex-row gap-3 mb-4">
                {/* Revivable Filter */}
                <button
                  onClick={() => setShowRevivableOnly(!showRevivableOnly)}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all text-sm ${showRevivableOnly
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-black/50 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                >
                  <RefreshCw size={16} />
                  Revivable Only
                </button>

                {/* Sort Selector */}
                <div className="flex items-center gap-2">
                  <SortDesc size={16} className="text-gray-500 flex-shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-3 py-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="stars">Most Stars</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>Showing {repos.length} archived project{repos.length !== 1 ? 's' : ''}</span>
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

        {/* Projects Grid */}
        <section className="px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">
                  <Archive className="inline-block text-gray-600" size={64} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Unable to Load</h3>
                <p className="text-gray-400 mb-6">{error}</p>
                <button
                  onClick={fetchArchivedRepos}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
              </motion.div>
            ) : repos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">
                  <Archive className="inline-block text-gray-600" size={64} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Archived Projects Found</h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery || showRevivableOnly
                    ? 'Try adjusting your search or filters.'
                    : 'The graveyard is empty. All projects are still active!'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {repos.map((repo, index) => (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
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
