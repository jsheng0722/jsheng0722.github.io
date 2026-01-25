import React, { useState } from 'react';
import { FaMagic, FaPlus, FaTimes } from 'react-icons/fa';
import VisualizationModal from './VisualizationModal';

/**
 * 可视化工具悬浮菜单
 * 可以在笔记页面等地方使用
 */
function VisualizationFloatingMenu({ code = null, position = 'right' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'left-8 top-1/2 -translate-y-1/2';
      case 'right':
        return 'right-8 top-1/2 -translate-y-1/2';
      case 'bottom':
        return 'bottom-8 left-1/2 -translate-x-1/2';
      default:
        return 'right-8 top-1/2 -translate-y-1/2';
    }
  };

  const getExpandDirection = () => {
    switch (position) {
      case 'left':
      case 'right':
        return 'flex-col-reverse';
      case 'bottom':
        return 'flex-row-reverse';
      default:
        return 'flex-col-reverse';
    }
  };

  const getTooltipPosition = () => {
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
    <>
      {/* 悬浮菜单 */}
      <div className={`fixed ${getPositionClasses()} z-40`}>
        <div className={`flex ${getExpandDirection()} gap-3 items-center`}>
          {/* 可视化工具按钮 */}
          {isExpanded && (
            <div
              className="relative group"
              style={{
                animation: 'slideIn 0.3s ease-out both'
              }}
            >
              <button
                onClick={() => {
                  setShowVisualization(true);
                  setIsExpanded(false);
                }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-2xl"
                title="打开可视化工具"
              >
                <FaMagic className="w-5 h-5" />
              </button>
              
              {/* 工具提示 */}
              <div className={`absolute ${getTooltipPosition()} bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
                算法可视化工具
              </div>
            </div>
          )}

          {/* 主按钮 */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-2xl"
            title={isExpanded ? '收起菜单' : '展开菜单'}
          >
            {isExpanded ? (
              <FaTimes className="w-5 h-5" />
            ) : (
              <FaPlus className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* 可视化工具模态窗口 */}
      <VisualizationModal
        isOpen={showVisualization}
        onClose={() => setShowVisualization(false)}
        initialCode={code}
      />
    </>
  );
}

export default VisualizationFloatingMenu;

