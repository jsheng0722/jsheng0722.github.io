import React from 'react';
import { FaBook, FaPencilAlt, FaCode, FaHeart, FaGraduationCap } from 'react-icons/fa';

/** 旧分类到新分类的显示映射（不改存储，仅用于展示与筛选） */
export function getDisplayCategory(category) {
  if (category === '生活') return '日常日记';
  if (category === '随笔') return '随笔写写';
  return category || '随笔写写';
}

/**
 * 笔记分类样式与图标 - 供 NoteCard、NoteListItemCompact、NoteView 等使用
 * 支持新分类：学习笔记、日常日记、随笔写写、算法；兼容旧分类：生活、随笔、LeetCode
 */
export function getCategoryBarClass(category) {
  if (category === '学习笔记') return 'bg-amber-500';
  if (category === '日常日记' || category === '生活') return 'bg-pink-500';
  if (category === '随笔写写' || category === '随笔') return 'bg-purple-500';
  if (category === '算法' || category === 'LeetCode') return 'bg-green-500';
  return 'bg-blue-500';
}

export function getCategoryIconClass(category) {
  if (category === '学习笔记') return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
  if (category === '日常日记' || category === '生活') return 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400';
  if (category === '随笔写写' || category === '随笔') return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
  if (category === '算法' || category === 'LeetCode') return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
  return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
}

export function getCategoryIcon(category, iconSize = 'w-4 h-4') {
  if (category === '学习笔记') return <FaGraduationCap className={iconSize} />;
  if (category === '日常日记' || category === '生活') return <FaHeart className={iconSize} />;
  if (category === '随笔写写' || category === '随笔') return <FaPencilAlt className={iconSize} />;
  if (category === '算法' || category === 'LeetCode') return <FaCode className={iconSize} />;
  return <FaBook className={iconSize} />;
}

export function getDifficultyVariant(difficulty) {
  if (difficulty === '简单') return 'success';
  if (difficulty === '中等') return 'warning';
  return 'danger';
}
