import React from 'react';

/** 列表项卡片：索引标签 + 值，可选高亮（如两数之和结果） */
export default function ListItemCard({ indexLabel, value, highlight = false }) {
  return (
    <div
      className={`flex flex-col items-center rounded-lg border-2 min-w-[48px] py-2 px-2 ${
        highlight
          ? 'border-green-500 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200'
          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
      }`}
    >
      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">{indexLabel}</span>
      <span className="font-mono font-bold text-sm">{String(value)}</span>
    </div>
  );
}
