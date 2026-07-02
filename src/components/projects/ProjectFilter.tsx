import { Search, Filter, X, ArrowUpDown } from 'lucide-react';
import type { Difficulty, ProjectStatus } from '../../types/repository';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SortOption = 'recent' | 'stars' | 'name';

interface ProjectFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  difficulty: Difficulty | 'all';
  onDifficultyChange: (difficulty: Difficulty | 'all') => void;
  status: ProjectStatus | 'all';
  onStatusChange: (status: ProjectStatus | 'all') => void;
  selectedTopics: string[];
  onTopicsChange: (topics: string[]) => void;
  availableTopics: string[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  resultCount: number;
  /** Optional sort control rendered at the right end of the filters row */
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
}

const ProjectFilter = ({
  searchQuery,
  onSearchChange,
  difficulty,
  onDifficultyChange,
  status,
  onStatusChange,
  selectedTopics,
  onTopicsChange,
  availableTopics,
  onClearFilters,
  hasActiveFilters,
  resultCount,
  sortBy,
  onSortChange,
}: ProjectFilterProps) => {
  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      onTopicsChange(selectedTopics.filter(t => t !== topic));
    } else {
      onTopicsChange([...selectedTopics, topic]);
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 md:p-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Difficulty Filter */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500 flex-shrink-0" />
          <Select value={difficulty} onValueChange={(v) => onDifficultyChange(v as Difficulty | 'all')}>
            <SelectTrigger className="bg-black/50 border-gray-700 text-white text-sm h-10 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => onStatusChange(v as ProjectStatus | 'all')}>
            <SelectTrigger className="bg-black/50 border-gray-700 text-white text-sm h-10 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="idea">Idea</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort — pushed to the right end */}
        {sortBy !== undefined && onSortChange && (
          <div className="flex items-center gap-2 ml-auto">
            <ArrowUpDown size={14} className="text-gray-500 flex-shrink-0" />
            <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
              <SelectTrigger className="bg-black/50 border-gray-700 text-white text-sm h-10 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="stars">Most Stars</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Tech Stack Filter */}
      {availableTopics.length > 0 && (
        <div className="space-y-2">
          <span className="text-gray-500 text-sm">Filter by Tech Stack:</span>
          <div className="flex flex-wrap gap-2">
            {availableTopics.slice(0, 15).map(topic => (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedTopics.includes(topic)
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                {topic}
              </button>
            ))}
            {availableTopics.length > 15 && (
              <span className="text-gray-600 text-xs self-center">+{availableTopics.length - 15} more</span>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Showing {resultCount} project{resultCount !== 1 ? 's' : ''}</span>
            {selectedTopics.length > 0 && (
              <div className="flex items-center gap-1">
                {selectedTopics.map(topic => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-full text-xs"
                  >
                    {topic}
                    <X
                      size={12}
                      className="cursor-pointer hover:text-white"
                      onClick={() => toggleTopic(topic)}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClearFilters}
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectFilter;

