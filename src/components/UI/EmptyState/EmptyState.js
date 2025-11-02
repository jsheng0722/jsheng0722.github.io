/**
 * 通用空状态组件
 * 用于显示无数据时的状态
 */

import React from 'react';
import { FaInbox, FaSearch, FaExclamationTriangle } from 'react-icons/fa';

function EmptyState({
  icon = 'inbox', // 'inbox', 'search', 'warning', 'custom'
  customIcon,
  title = '暂无数据',
  description,
  action,
  size = 'medium', // 'small', 'medium', 'large'
  className = '',
  ...props
}) {
  // 获取图标
  const getIcon = () => {
    if (customIcon) return customIcon;
    
    const iconProps = {
      className: size === 'small' ? 'w-12 h-12' : size === 'large' ? 'w-20 h-20' : 'w-16 h-16',
      style: { color: '#9CA3AF' }
    };

    switch (icon) {
      case 'search':
        return <FaSearch {...iconProps} />;
      case 'warning':
        return <FaExclamationTriangle {...iconProps} />;
      default: // inbox
        return <FaInbox {...iconProps} />;
    }
  };

  // 尺寸变体
  const sizes = {
    small: 'py-8',
    medium: 'py-12',
    large: 'py-16'
  };

  // 文本尺寸
  const textSizes = {
    small: {
      title: 'text-lg',
      description: 'text-sm'
    },
    medium: {
      title: 'text-xl',
      description: 'text-base'
    },
    large: {
      title: 'text-2xl',
      description: 'text-lg'
    }
  };

  return (
    <div className={`text-center ${sizes[size]} ${className}`} {...props}>
      {/* 图标 */}
      <div className="flex justify-center mb-4">
        {getIcon()}
      </div>

      {/* 标题 */}
      <h3 className={`${textSizes[size].title} font-semibold text-gray-700 dark:text-gray-300 mb-2`}>
        {title}
      </h3>

      {/* 描述 */}
      {description && (
        <p className={`${textSizes[size].description} text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto`}>
          {description}
        </p>
      )}

      {/* 操作按钮 */}
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
