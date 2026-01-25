import React, { useState } from 'react';
import { FaList, FaRedo, FaCode, FaPlus, FaTimes } from 'react-icons/fa';

/**
 * 可视化工具栏 - 美化版本
 * 参考思维导图工具栏的设计
 */
function VisualizationToolbar({ onAddTool }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [draggedTool, setDraggedTool] = useState(null);

  const tools = [
    {
      id: 'list',
      label: '列表',
      icon: <FaList className="w-5 h-5" />,
      description: '创建列表，支持数字、字符串、元组等',
      color: 'from-blue-500 to-blue-700',
    },
    {
      id: 'loop',
      label: '循环',
      icon: <FaRedo className="w-5 h-5" />,
      description: '创建循环，可设置起始值、结束值、步长',
      color: 'from-green-500 to-green-700',
    },
    {
      id: 'variable',
      label: '变量',
      icon: <FaCode className="w-5 h-5" />,
      description: '创建变量，支持数字、字符串、布尔值',
      color: 'from-purple-500 to-purple-700',
    },
  ];

  const handleDragStart = (e, tool) => {
    setDraggedTool(tool);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', tool.id);
  };

  const handleDragEnd = () => {
    setDraggedTool(null);
  };

  const handleClick = (tool) => {
    onAddTool(tool.id, { x: 200, y: 200 });
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4">
        {/* 左侧：工具栏标题和工具 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">工具</h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isExpanded ? '收起工具栏' : '展开工具栏'}
            >
              {isExpanded ? <FaTimes className="w-3 h-3" /> : <FaPlus className="w-3 h-3" />}
            </button>
          </div>

          {isExpanded && (
            <div className="flex items-center gap-3">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="relative group"
                  draggable
                  onDragStart={(e) => handleDragStart(e, tool)}
                  onDragEnd={handleDragEnd}
                >
                  <button
                    onClick={() => handleClick(tool)}
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${tool.color} text-white shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-2xl relative ${
                      draggedTool?.id === tool.id ? 'opacity-50 scale-95' : ''
                    }`}
                    title={tool.description}
                  >
                    {tool.icon}
                  </button>
                  
                  {/* 工具提示 */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                    <div className="font-semibold mb-1">{tool.label}</div>
                    <div className="text-gray-300 text-[10px]">{tool.description}</div>
                    <div className="text-gray-400 text-[10px] mt-1">点击添加或拖拽到画布</div>
                    {/* 小三角 */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                      <div className="w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 右侧：提示信息 */}
        {isExpanded && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            💡 点击工具添加或拖拽到画布
          </div>
        )}
      </div>
    </div>
  );
}

export default VisualizationToolbar;
