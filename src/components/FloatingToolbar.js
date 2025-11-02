import React, { useState } from 'react';
import { FaProjectDiagram, FaCode, FaTable, FaListUl, FaQuoteRight, FaPlus, FaTimes, FaCog } from 'react-icons/fa';

function FloatingToolbar({ 
  onAddDiagram, 
  onInsertCode, 
  onInsertTable, 
  onInsertList,
  onInsertQuote,
  hasDiagram,
  position = 'right' // 'left', 'right', 'bottom'
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState(position);

  const tools = [
    {
      id: 'diagram',
      icon: <FaProjectDiagram className="w-5 h-5" />,
      label: hasDiagram ? '编辑图表' : '添加图表',
      onClick: onAddDiagram,
      color: hasDiagram ? 'from-purple-500 to-purple-700' : 'from-blue-500 to-blue-700',
      badge: hasDiagram
    },
    {
      id: 'code',
      icon: <FaCode className="w-5 h-5" />,
      label: '插入代码块',
      onClick: onInsertCode,
      color: 'from-gray-600 to-gray-800'
    },
    {
      id: 'table',
      icon: <FaTable className="w-5 h-5" />,
      label: '插入表格',
      onClick: onInsertTable,
      color: 'from-green-500 to-green-700'
    },
    {
      id: 'list',
      icon: <FaListUl className="w-5 h-5" />,
      label: '插入列表',
      onClick: onInsertList,
      color: 'from-orange-500 to-orange-700'
    },
    {
      id: 'quote',
      icon: <FaQuoteRight className="w-5 h-5" />,
      label: '插入引用',
      onClick: onInsertQuote,
      color: 'from-indigo-500 to-indigo-700'
    }
  ];

  const getPositionClasses = () => {
    switch (toolbarPosition) {
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

  const getExpandDirection = () => {
    switch (toolbarPosition) {
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

  return (
    <>
      {/* 浮动工具栏 */}
      <div className={`fixed ${getPositionClasses()} z-50`}>
        <div className={`flex ${getExpandDirection()} gap-3 items-center`}>
          {/* 工具按钮 */}
          {isExpanded && tools.map((tool, index) => (
            <div
              key={tool.id}
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
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${tool.color} text-white shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-2xl relative`}
                title={tool.label}
              >
                {tool.icon}
                {tool.badge && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-[10px]">✓</span>
                  </div>
                )}
              </button>
              
              {/* 提示标签 */}
              <div className={`absolute ${
                toolbarPosition === 'bottom' 
                  ? 'bottom-14 left-1/2 -translate-x-1/2' 
                  : toolbarPosition === 'left'
                  ? 'left-14 top-1/2 -translate-y-1/2'
                  : 'right-14 top-1/2 -translate-y-1/2'
              } bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
                {tool.label}
              </div>
            </div>
          ))}

          {/* 主按钮 */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
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
        </div>

        {/* 设置按钮 */}
        {!isExpanded && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="absolute -top-2 -left-2 w-6 h-6 bg-gray-700 hover:bg-gray-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
          >
            <FaCog className="w-3 h-3" />
          </button>
        )}

        {/* 设置面板 */}
        {showSettings && (
          <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 min-w-[200px] border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">工具栏位置</h4>
            <div className="space-y-2">
              {['left', 'right', 'bottom'].map(pos => (
                <button
                  key={pos}
                  onClick={() => {
                    setToolbarPosition(pos);
                    setShowSettings(false);
                  }}
                  className={`w-full px-3 py-2 text-sm rounded transition-colors ${
                    toolbarPosition === pos
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {pos === 'left' && '左侧'}
                  {pos === 'right' && '右侧'}
                  {pos === 'bottom' && '底部'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

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
    </>
  );
}

export default FloatingToolbar;
