/**
 * 通用伸缩组件
 * 支持展开/收起功能
 */

import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaChevronRight, FaChevronLeft } from 'react-icons/fa';

function Collapsible({
  title,
  children,
  defaultExpanded = false,
  variant = 'default', // 'default', 'card', 'minimal'
  direction = 'down', // 'down', 'up', 'right', 'left'
  showIcon = true,
  iconPosition = 'right', // 'left', 'right'
  onToggle,
  className = '',
  headerClassName = '',
  contentClassName = '',
  ...props
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
  };

  // 获取图标
  const getIcon = () => {
    if (!showIcon) return null;
    
    const iconProps = { className: 'w-4 h-4 text-gray-500 transition-transform duration-200' };
    
    switch (direction) {
      case 'up':
        return isExpanded ? <FaChevronUp {...iconProps} /> : <FaChevronDown {...iconProps} />;
      case 'right':
        return isExpanded ? <FaChevronLeft {...iconProps} /> : <FaChevronRight {...iconProps} />;
      case 'left':
        return isExpanded ? <FaChevronRight {...iconProps} /> : <FaChevronLeft {...iconProps} />;
      default: // down
        return isExpanded ? <FaChevronUp {...iconProps} /> : <FaChevronDown {...iconProps} />;
    }
  };

  // 样式变体
  const variants = {
    default: 'border-b border-gray-200 dark:border-gray-700',
    card: 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700',
    minimal: ''
  };

  // 基础样式
  const baseStyles = 'transition-all duration-200';
  const headerBaseStyles = 'flex items-center justify-between w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer';

  // 组合样式
  const containerStyles = `
    ${baseStyles}
    ${variants[variant]}
    ${className}
  `.trim();

  const headerStyles = `
    ${headerBaseStyles}
    ${headerClassName}
  `.trim();

  const contentStyles = `
    overflow-hidden transition-all duration-300 ease-in-out
    ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
    ${contentClassName}
  `.trim();

  return (
    <div className={containerStyles} {...props}>
      {/* 标题栏 */}
      <button
        onClick={handleToggle}
        className={headerStyles}
        type="button"
      >
        <div className="flex items-center gap-3">
          {showIcon && iconPosition === 'left' && (
            <span className="flex-shrink-0">
              {getIcon()}
            </span>
          )}
          
          <span className="text-left font-medium text-gray-900 dark:text-gray-100">
            {title}
          </span>
        </div>

        {showIcon && iconPosition === 'right' && (
          <span className="flex-shrink-0">
            {getIcon()}
          </span>
        )}
      </button>

      {/* 内容区域 */}
      <div className={contentStyles}>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Collapsible;
