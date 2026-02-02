import React from 'react';
import { Badge } from '../UI';
import { getCategoryIconClass, getCategoryIcon, getDifficultyVariant } from './noteCategoryUtils';

/**
 * 笔记列表紧凑项 - 单行展示：左侧笔记名+分类，右侧作者与日期（窗口小时可换行）
 */
function NoteListItemCompact({ note, onClick }) {
  const isDraft = note?.status === 'draft' || note?.isDraft === true || note?.draft === true;
  const isAlgorithm = note.category === '算法' || note.category === 'LeetCode';

  return (
    <li>
      <button
        type="button"
        onClick={() => onClick(note)}
        className="w-full flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className={`shrink-0 p-1.5 rounded ${getCategoryIconClass(note.category)}`}>
          {getCategoryIcon(note.category, 'w-3.5 h-3.5')}
        </span>
        <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {note.title}
          </span>
          <Badge variant="default" size="small" className="shrink-0 text-xs">
            {note.category || '未分类'}
          </Badge>
          {isDraft && (
            <Badge variant="warning" size="small">草稿</Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 shrink-0 text-xs text-gray-500 dark:text-gray-400">
          <span>{note.author}</span>
          <span>{note.date}</span>
          {note.readTime && <span>{note.readTime}</span>}
          {isAlgorithm && note.difficulty && (
            <Badge variant={getDifficultyVariant(note.difficulty)} size="small">
              {note.difficulty}
            </Badge>
          )}
        </div>
      </button>
    </li>
  );
}

export default NoteListItemCompact;
