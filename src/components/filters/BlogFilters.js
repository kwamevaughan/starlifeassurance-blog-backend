export default function BlogFilters({
  selectedCategory,
  onCategoryChange,
  selectedTags,
  onTagsChange,
  selectedStatus,
  onStatusChange,
  selectedAuthor,
  onAuthorChange,
  dateRange,
  onDateRangeChange,
  categories = [],
  tags = [],
  statuses = [],
  authors = [],
  dateRanges = [],
  mode,
  loading
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Category Filter */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
            mode === 'dark'
              ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
        >
          <option value="All">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Status
        </label>
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
            mode === 'dark'
              ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
        >
          <option value="All">All Statuses</option>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Author Filter */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          mode === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Author
        </label>
        <select
          value={selectedAuthor}
          onChange={(e) => onAuthorChange(e.target.value)}
          className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors ${
            mode === 'dark'
              ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500'
              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
        >
          <option value="All">All Authors</option>
          {authors.map((author) => (
            <option key={author} value={author}>
              {author}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}