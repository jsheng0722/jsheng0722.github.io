/**
 * Generic pagination component.
 * Props: total, pageSize, currentPage, onPageChange, itemLabel, prevLabel, nextLabel (optional; defaults from i18n)
 */

import React from 'react';
import { useI18n } from '../../../context/I18nContext';

function Pagination({
  total,
  pageSize,
  currentPage,
  onPageChange,
  itemLabel,
  prevLabel,
  nextLabel,
  className = '',
}) {
  const { t } = useI18n();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showPagination = total > pageSize;
  const label = itemLabel ?? t('PaginationItemLabel');
  const prev = prevLabel ?? t('PaginationPrev');
  const next = nextLabel ?? t('PaginationNext');
  const summary = t('PaginationSummary')
    .replace('{total}', String(total))
    .replace('{itemLabel}', label)
    .replace('{current}', String(currentPage))
    .replace('{totalPages}', String(totalPages));

  if (!showPagination) return null;

  return (
    <div
      className={`flex items-center justify-between gap-2 pt-3 border-t border-gray-200 dark:border-gray-700 ${className}`}
    >
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {summary}
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-2 py-1 rounded text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {prev}
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-2 py-1 rounded text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {next}
        </button>
      </div>
    </div>
  );
}

export default Pagination;
