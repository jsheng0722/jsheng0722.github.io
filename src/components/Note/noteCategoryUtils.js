import React from 'react';
import { FaBook, FaPencilAlt, FaCode, FaHeart } from 'react-icons/fa';

/**
 * 笔记分类样式与图标 - 供 NoteCard、NoteListItemCompact 等通用组件使用
 */
export function getCategoryBarClass(category) {
  if (category === '生活') return 'bg-pink-500';
  if (category === '随笔') return 'bg-purple-500';
  if (category === '算法' || category === 'LeetCode') return 'bg-green-500';
  return 'bg-blue-500';
}

export function getCategoryIconClass(category) {
  if (category === '生活') return 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400';
  if (category === '随笔') return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
  if (category === '算法' || category === 'LeetCode') return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
  return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
}

export function getCategoryIcon(category, iconSize = 'w-4 h-4') {
  if (category === '生活') return <FaHeart className={iconSize} />;
  if (category === '随笔') return <FaPencilAlt className={iconSize} />;
  if (category === '算法' || category === 'LeetCode') return <FaCode className={iconSize} />;
  return <FaBook className={iconSize} />;
}

export function getDifficultyVariant(difficulty) {
  if (difficulty === '简单') return 'success';
  if (difficulty === '中等') return 'warning';
  return 'danger';
}
