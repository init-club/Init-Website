import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Loader2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectFilter from '../components/projects/ProjectFilter';
import ProjectDetailsModal from '../components/projects/ProjectDetailsModal';
import { supabase } from '../supabaseClient';
import type { Repository, Difficulty, ProjectStatus } from '../types/repository';

type SortOption = 'recent' | 'stars' | 'name';

export default function IdeaWallPage() {
  const [projects, setProjects] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Repository | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Extract unique topics from all projects
  const availableTopics = useMemo(() => {
    const topicsSet = new Set<string>();
    projects.forEach(project => {
      project.topics?.forEach(topic => topicsSet.add(topic));
    });
    return Array.from(topicsSet).sort();
  }, [projects]);

  const loadProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('repositories')
        .select('*')
        .eq('is_archived', false)
        .eq('is_visible', true);

      if (fetchError) throw fetchError;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // One-time fetch — all sorting/filtering is client-side for instant response
  useEffect(() => {
    loadProjects();
  }, []);

  // Filter + sort projects client-side — instant, no round-trips
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.name?.toLowerCase().includes(q) ||
        project.description?.toLowerCase().includes(q) ||
        project.language?.toLowerCase().includes(q) ||
        project.topics?.some(topic => topic.toLowerCase().includes(q))
      );
    }

    if (difficulty !== 'all') {
      filtered = filtered.filter(project => project.difficulty === difficulty);
    }
    if (status !== 'all') {
      filtered = filtered.filter(project => project.project_status === status);
    }
    if (selectedTopics.length > 0) {
      filtered = filtered.filter(project =>
        selectedTopics.every(topic => project.topics?.includes(topic))
      );
    }

    // Client-side sort
    if (sortBy === 'stars') {
      filtered.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    } else {
      filtered.sort((a, b) => new Date(b.pushed_at ?? 0).getTime() - new Date(a.pushed_at ?? 0).getTime());
    }

    return filtered;
  }, [projects, debouncedSearchQuery, difficulty, status, selectedTopics, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setDifficulty('all');
    setStatus('all');
    setSelectedTopics([]);
    setSortBy('recent');
  };

  const hasActiveFilters = Boolean(searchQuery) || difficulty !== 'all' || status !== 'all' || selectedTopics.length > 0;

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-background overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative py-16 px-4">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
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
                  textShadow: '0 0 20px rgba(0,255,213,0.5), 0 0 40px rgba(168,85,247,0.3)' 
                }}
              >
                <span style={{ color: 'var(--text)' }}>The </span>
                <span style={{
                  background: 'linear-gradient(90deg, #00ffd5, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Idea Wall
                </span>
              </h1>
              <p className="text-zinc-400 text-base max-w-xl mx-auto mb-3 leading-relaxed">
                Explore our active projects. Find something you're passionate about
                and contribute to open source.
              </p>
              <p className="text-zinc-600 text-sm max-w-lg mx-auto">
                Filter by difficulty, tech stack, or project status.
              </p>
            </motion.div>
          </div>
        </section>


        {/* Filter Section */}
        <section className="px-4 pb-8">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ProjectFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                difficulty={difficulty}
                onDifficultyChange={setDifficulty}
                status={status}
                onStatusChange={setStatus}
                selectedTopics={selectedTopics}
                onTopicsChange={setSelectedTopics}
                availableTopics={availableTopics}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
                resultCount={filteredProjects.length}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </motion.div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="px-4 pb-20">
          <div className="max-w-5xl mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              </div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="mb-4">
                  <Lightbulb className="inline-block text-zinc-700" size={48} />
                </div>
                <h3 className="text-lg font-bold text-zinc-300 mb-2">Unable to Load</h3>
                <p className="text-zinc-600 text-sm mb-6">{error}</p>
                <button
                  onClick={loadProjects}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:text-white transition-all text-sm"
                >
                  Try Again
                </button>
              </motion.div>
            ) : filteredProjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="mb-4">
                  <Lightbulb className="inline-block text-zinc-700" size={48} />
                </div>
                <h3 className="text-lg font-bold text-zinc-300 mb-2">No Projects Found</h3>
                <p className="text-zinc-600 text-sm mb-6">
                  {hasActiveFilters
                    ? 'Try adjusting your filters to find more projects.'
                    : 'No active projects at the moment. Check back later!'}
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
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <ProjectCard
                      project={project}
                      onViewDetails={() => setSelectedProject(project)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <Footer />
    </>
  );
}
