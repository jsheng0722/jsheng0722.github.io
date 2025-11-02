/**
 * 通用浮动工具栏组件
 * 支持多种工具和位置
 */

import React, { useState } from 'react';
import { FaPlus, FaTimes, FaCog } from 'react-icons/fa';

function FloatingToolbar({
  tools = [],
  position = 'right', // 'left', 'right', 'bottom'
  expanded = false,
  onToggle,
  showSettings = false,
  settingsContent,
  className = '',
  ...props
}) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
    setIsExpanded(newState);
  };

  // 位置样式
  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'left-8 top-1/2 -translate-y-1/2';
      case 'right':
        return 'right-8 top-1/2 -translate-y-1/2';
      case 'bottom':
        return 'bottom-8 left-1/2 -translate-x-1/2';
      default:
        return 'right-8 bottom-8';
    }
  };

  // 展开方向
  const getExpandDirection = () => {
    switch (position) {
      case 'left':
        return 'flex-col-reverse';
      case 'right':
        return 'flex-col-reverse';
      case 'bottom':
        return 'flex-row-reverse';
      default:
        return 'flex-col-reverse';
    }
  };

  // 工具提示位置
  const getTooltipPosition = (index) => {
    switch (position) {
      case 'bottom':
        return 'bottom-14 left-1/2 -translate-x-1/2';
      case 'left':
        return 'left-14 top-1/2 -translate-y-1/2';
      case 'right':
        return 'right-14 top-1/2 -translate-y-1/2';
      default:
        return 'right-14 top-1/2 -translate-y-1/2';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50 ${className}`} {...props}>
      <div className={`flex ${getExpandDirection()} gap-3 items-center`}>
        {/* 工具按钮 */}
        {isExpanded && tools.map((tool, index) => (
          <div
            key={tool.id || index}
            className="relative group"
            style={{
              animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
            }}
          >
            <button
              onClick={() => {
                tool.onClick?.();
                setIsExpanded(false);
              }}
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${tool.color || 'from-gray-600 to-gray-800'} text-white shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-2xl relative`}
              title={tool.label}
            >
              {tool.icon}
              {tool.badge && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-[10px]">✓</span>
                </div>
              )}
            </button>
            
            {/* 工具提示 */}
            {tool.label && (
              <div className={`absolute ${getTooltipPosition(index)} bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
                {tool.label}
              </div>
            )}
          </div>
        ))}

        {/* 主按钮 */}
        <button
          onClick={handleToggle}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
            isExpanded 
              ? 'bg-gradient-to-br from-red-500 to-red-700 rotate-45' 
              : 'bg-gradient-to-br from-blue-600 to-blue-800'
          }`}
        >
          {isExpanded ? (
            <FaTimes className="w-6 h-6 text-white" />
          ) : (
            <FaPlus className="w-6 h-6 text-white" />
          )}
        </button>

        {/* 设置按钮 */}
        {showSettings && !isExpanded && (
          <button
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
            className="absolute -top-2 -left-2 w-6 h-6 bg-gray-700 hover:bg-gray-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
          >
            <FaCog className="w-3 h-3" />
          </button>
        )}

        {/* 设置面板 */}
        {showSettingsPanel && (
          <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 min-w-[200px] border border-gray-200 dark:border-gray-700">
            {settingsContent || (
              <div>
                <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">工具栏设置</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">设置内容</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 动画样式 */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default FloatingToolbar;
