import React from 'react';

/** 可视化组件通用“空状态”提示 */
export default function EmptyVizMessage({ children }) {
  return (
    <div className="text-xs text-gray-400 dark:text-gray-500 italic py-2">
      {children}
    </div>
  );
}
