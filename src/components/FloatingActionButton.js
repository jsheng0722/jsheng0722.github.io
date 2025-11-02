import React, { useState } from 'react';
import { FaProjectDiagram } from 'react-icons/fa';

function FloatingActionButton({ onAddDiagram, hasDiagram }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* 主按钮 */}
      <button
        onClick={() => {
          if (isExpanded) {
            setIsExpanded(false);
          } else {
            onAddDiagram();
          }
        }}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
          hasDiagram
            ? 'bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800'
            : 'bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
        }`}
        title={hasDiagram ? '编辑图表' : '添加图表'}
      >
        <FaProjectDiagram className="w-8 h-8 text-white" />
      </button>

      {/* 提示标签 */}
      <div className="absolute right-20 bottom-4 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        {hasDiagram ? '编辑图表' : '添加图表'}
        <div className="absolute right-[-6px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-gray-900"></div>
      </div>

      {/* 徽章（如果已有图表） */}
      {hasDiagram && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </div>
  );
}

export default FloatingActionButton;
