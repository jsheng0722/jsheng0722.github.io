/**
 * 通用加载组件
 * 支持多种样式和尺寸
 */

import React from 'react';
import { FaSpinner } from 'react-icons/fa';

function Loading({
  size = 'medium', // 'small', 'medium', 'large'
  variant = 'spinner', // 'spinner', 'dots', 'pulse'
  text,
  className = '',
  ...props
}) {
  // 尺寸变体
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  // 文本尺寸
  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  // 渲染加载动画
  const renderLoading = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${sizes[size]} bg-blue-600 rounded-full animate-pulse`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`${sizes[size]} bg-blue-600 rounded-full animate-pulse`} />
        );
      
      default: // spinner
        return (
          <FaSpinner className={`${sizes[size]} text-blue-600 animate-spin`} />
        );
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`} {...props}>
      <div className="flex items-center space-x-3">
        {renderLoading()}
        {text && (
          <span className={`${textSizes[size]} text-gray-600 dark:text-gray-400`}>
            {text}
          </span>
        )}
      </div>
    </div>
  );
}

export default Loading;
