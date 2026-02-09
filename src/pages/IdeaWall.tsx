import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Loader2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import ProjectCard from '../components/ProjectCard';
import ProjectFilter from '../components/ProjectFilter';
import ProjectDetailsModal from '../components/ProjectDetailsModal';
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
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Extract unique topics from all projects
  const availableTopics = useMemo(() => {
    const topicsSet = new Set<string>();
    projects.forEach(project => {
      project.topics?.forEach(topic => topicsSet.add(topic));
    });
    return Array.from(topicsSet).sort();
  }, [projects]);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('repositories')
        .select('*')
        .eq('is_archived', false);

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

      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [sortBy]);

  // Filter projects based on current filter state
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(project =>
        project.name?.toLowerCase().includes(q) ||
        project.description?.toLowerCase().includes(q) ||
        project.language?.toLowerCase().includes(q) ||
        project.topics?.some(topic => topic.toLowerCase().includes(q))
      );
    }

    // Difficulty filter
    if (difficulty !== 'all') {
      filtered = filtered.filter(project => project.difficulty === difficulty);
    }

    // Status filter
    if (status !== 'all') {
      filtered = filtered.filter(project => project.project_status === status);
    }

    // Topics filter
    if (selectedTopics.length > 0) {
      filtered = filtered.filter(project =>
        selectedTopics.every(topic => project.topics?.includes(topic))
      );
    }

    return filtered;
  }, [projects, searchQuery, difficulty, status, selectedTopics]);

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
      <main className="pt-20 min-h-screen bg-black">
        {/* Hero Section */}
        <section className="relative py-16 px-4 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                  <Lightbulb size={48} className="text-cyan-400" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">
                <span className="text-white">The </span>
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Idea Wall
                </span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-4">
                Explore our active projects. Find something you're passionate about,
                learn new technologies, and contribute to open source.
              </p>
              <p className="text-gray-500 text-sm max-w-xl mx-auto">
                Filter by difficulty level, tech stack, or project status to find the perfect match.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Sort Options */}
        <section className="px-4 pb-4">
          <div className="max-w-6xl mx-auto flex justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-black/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="recent">Most Recent</option>
              <option value="stars">Most Stars</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </section>

        {/* Filter Section */}
        <section className="px-4 pb-8">
          <div className="max-w-6xl mx-auto">
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
              />
            </motion.div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              </div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">
                  <Lightbulb className="inline-block text-gray-600" size={64} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Unable to Load</h3>
                <p className="text-gray-400 mb-6">{error}</p>
                <button
                  onClick={fetchProjects}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-colors"
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
                <div className="text-6xl mb-4">
                  <Lightbulb className="inline-block text-gray-600" size={64} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Projects Found</h3>
                <p className="text-gray-400 mb-6">
                  {hasActiveFilters
                    ? 'Try adjusting your filters to find more projects.'
                    : 'No active projects at the moment. Check back later!'}
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
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
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
