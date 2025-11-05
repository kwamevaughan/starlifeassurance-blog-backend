import { Icon } from '@iconify/react';
import Select from "react-select";
import { getSelectStyles } from "@/utils/selectStyles";

export default function BaseFilters({
  mode,
  loading,
  viewMode,
  setViewMode,
  filterTerm,
  setFilterTerm,
  sortOrder,
  setSortOrder,
  showFilters,
  setShowFilters,
  type,
  items = [],
  filteredItems = [],
  onResetFilters,
  displayedCount,
  totalCount,
  children
}) {
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'az', label: 'A-Z' },
    { value: 'za', label: 'Z-A' }
  ];

  return (
    <div className="space-y-4">
      {/* Top bar with search and controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Icon 
            icon="heroicons:magnifying-glass" 
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              mode === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} 
          />
          <input
            type="text"
            placeholder={`Search ${type}s...`}
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
              mode === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {/* Sort */}
          <Select
            value={sortOptions.find(option => option.value === sortOrder)}
            onChange={(selectedOption) => setSortOrder(selectedOption?.value)}
            options={sortOptions}
            placeholder="Sort by"
            isClearable={false}
            isSearchable={false}
            styles={getSelectStyles(mode)}
          />

          {/* View mode toggle */}
          <div className={`flex rounded-lg border ${
            mode === 'dark' ? 'border-gray-600' : 'border-gray-300'
          }`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-l-lg transition-colors ${
                viewMode === 'grid'
                  ? mode === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700'
                  : mode === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon icon="heroicons:squares-2x2" className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-r-lg transition-colors ${
                viewMode === 'list'
                  ? mode === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700'
                  : mode === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon icon="heroicons:list-bullet" className="w-4 h-4" />
            </button>
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-2 rounded-lg border text-sm transition-colors ${
              showFilters
                ? mode === 'dark'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
                : mode === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon icon="heroicons:funnel" className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className={`text-sm ${
        mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Showing {displayedCount} of {totalCount} {type}s
        {displayedCount !== totalCount && (
          <button
            onClick={onResetFilters}
            className="ml-2 text-blue-600 hover:text-blue-700 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className={`p-4 rounded-lg border ${
          mode === 'dark' 
            ? 'bg-gray-800/50 border-gray-600' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          {children}
        </div>
      )}
    </div>
  );
}