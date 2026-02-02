import React from 'react';
import { Card, Badge } from '../UI';
import { FaCalendar, FaUser, FaClock } from 'react-icons/fa';
import { getCategoryBarClass, getCategoryIconClass, getCategoryIcon, getDifficultyVariant } from './noteCategoryUtils';

/**
 * 笔记卡片 - 卡片视图单条展示
 */
function NoteCard({ note, onClick }) {
  const isDraft = note?.status === 'draft' || note?.isDraft === true || note?.draft === true;
  const isAlgorithm = note.category === '算法' || note.category === 'LeetCode';

  return (
    <Card onClick={() => onClick(note)} hover clickable>
      <div className={`h-2 rounded-t-xl ${getCategoryBarClass(note.category)}`} />
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`p-2 rounded-lg ${getCategoryIconClass(note.category)}`}>
            {getCategoryIcon(note.category)}
          </span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {note.category || '未分类'}
          </span>
          {isDraft && <Badge variant="warning" size="small">草稿</Badge>}
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
          {note.title}
        </h3>

        {note.excerpt && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {note.excerpt}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <FaUser className="w-3 h-3 shrink-0" />
            {note.author}
          </span>
          <span className="flex items-center gap-1">
            <FaCalendar className="w-3 h-3 shrink-0" />
            {note.date}
          </span>
          {note.readTime && (
            <span className="flex items-center gap-1">
              <FaClock className="w-3 h-3 shrink-0" />
              {note.readTime}
            </span>
          )}
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {note.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="default" size="small">
                #{tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="default" size="small">
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {isAlgorithm && note.difficulty && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">难度</span>
              <Badge variant={getDifficultyVariant(note.difficulty)} size="small">
                {note.difficulty}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default NoteCard;
