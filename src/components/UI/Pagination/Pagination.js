/**
 * Generic pagination component.
 * Props: total, pageSize, currentPage, onPageChange, itemLabel (e.g. "条")
 */

import React from 'react';

function Pagination({
  total,
  pageSize,
  currentPage,
  onPageChange,
  itemLabel = '条',
  prevLabel = '上一页',
  nextLabel = '下一页',
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showPagination = total > pageSize;

  if (!showPagination) return null;

  return (
    <div
      className={`flex items-center justify-between gap-2 pt-3 border-t border-gray-200 dark:border-gray-700 ${className}`}
    >
      <span className="text-xs text-gray-500 dark:text-gray-400">
        共 {total} {itemLabel}，第 {currentPage} / {totalPages} 页
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-2 py-1 rounded text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {prevLabel}
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-2 py-1 rounded text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

export default Pagination;
