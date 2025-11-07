import React from 'react';
import { Icon } from '@iconify/react';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  mode = 'light',
  showItemsPerPage = true,
  itemsPerPageOptions = [12, 24, 48, 96]
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t ${
      mode === 'dark' ? 'border-gray-700' : 'border-gray-200'
    }`}>
      {/* Items per page selector */}
      {showItemsPerPage && (
        <div className="flex items-center gap-2">
          <span className={`text-sm ${
            mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Show:
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className={`px-3 py-1 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              mode === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className={`text-sm ${
            mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            per page
          </span>
        </div>
      )}

      {/* Page info */}
      <div className={`text-sm ${
        mode === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{' '}
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === 1
              ? mode === 'dark'
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 cursor-not-allowed'
              : mode === 'dark'
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Icon icon="heroicons:chevron-left" className="w-5 h-5" />
        </button>

        {/* Page numbers */}
        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className={`px-3 py-2 text-sm ${
                mode === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                ...
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : mode === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === totalPages
              ? mode === 'dark'
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 cursor-not-allowed'
              : mode === 'dark'
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Icon icon="heroicons:chevron-right" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;