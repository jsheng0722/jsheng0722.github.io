/**
 * 通用浮动按钮组件
 * 支持多种位置和样式
 */

import React, { useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

function FloatingButton({
  children,
  position = 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left', 'center'
  variant = 'primary', // 'primary', 'secondary', 'success', 'warning', 'danger'
  size = 'medium', // 'small', 'medium', 'large'
  icon = <FaPlus />,
  expandedIcon = <FaTimes />,
  expanded = false,
  onToggle,
  onClick,
  tooltip,
  className = '',
  ...props
}) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleClick = () => {
    if (onToggle) {
      const newState = !isExpanded;
      setIsExpanded(newState);
      onToggle(newState);
    }
    onClick?.();
  };

  // 位置变体
  const positions = {
    'bottom-right': 'bottom-8 right-8',
    'bottom-left': 'bottom-8 left-8',
    'top-right': 'top-8 right-8',
    'top-left': 'top-8 left-8',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };

  // 样式变体
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-600 hover:bg-gray-700',
    success: 'bg-green-600 hover:bg-green-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    danger: 'bg-red-600 hover:bg-red-700'
  };

  // 尺寸变体
  const sizes = {
    small: 'w-12 h-12',
    medium: 'w-14 h-14',
    large: 'w-16 h-16'
  };

  // 图标尺寸
  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  // 基础样式
  const baseStyles = `
    fixed z-50 rounded-full shadow-2xl flex items-center justify-center
    transition-all duration-300 transform hover:scale-110
    text-white cursor-pointer
  `;

  // 组合样式
  const buttonStyles = `
    ${baseStyles}
    ${positions[position]}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.trim();

  const iconElement = isExpanded ? expandedIcon : icon;

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={buttonStyles}
        title={tooltip}
        {...props}
      >
        <span className={iconSizes[size]}>
          {iconElement}
        </span>
      </button>

      {/* 子元素（展开内容） */}
      {isExpanded && children && (
        <div className={`absolute ${position.includes('right') ? 'right-16' : 'left-16'} ${position.includes('bottom') ? 'bottom-0' : 'top-0'}`}>
          {children}
        </div>
      )}

      {/* 工具提示 */}
      {tooltip && !isExpanded && (
        <div className={`absolute ${position.includes('right') ? 'right-20' : 'left-20'} ${position.includes('bottom') ? 'bottom-4' : 'top-4'} bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none`}>
          {tooltip}
          <div className={`absolute ${position.includes('right') ? 'right-[-6px]' : 'left-[-6px]'} top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ${position.includes('right') ? 'border-l-[6px] border-l-gray-900' : 'border-r-[6px] border-r-gray-900'}`}></div>
        </div>
      )}
    </div>
  );
}

export default FloatingButton;
