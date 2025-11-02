/**
 * 通用徽章组件
 * 支持多种颜色和尺寸
 */

import React from 'react';

function Badge({
  children,
  variant = 'default', // 'default', 'primary', 'success', 'warning', 'danger', 'info'
  size = 'medium', // 'small', 'medium', 'large'
  rounded = true,
  className = '',
  ...props
}) {
  // 颜色变体
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    primary: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    danger: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    info: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200'
  };

  // 尺寸变体
  const sizes = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-2.5 py-1 text-sm',
    large: 'px-3 py-1.5 text-base'
  };

  // 基础样式
  const baseStyles = `
    inline-flex items-center font-medium
    ${rounded ? 'rounded-full' : 'rounded-md'}
  `;

  // 组合样式
  const badgeStyles = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.trim();

  return (
    <span className={badgeStyles} {...props}>
      {children}
    </span>
  );
}

export default Badge;
