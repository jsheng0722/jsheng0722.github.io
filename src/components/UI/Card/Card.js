/**
 * 通用卡片组件
 * 支持多种样式和交互效果
 */

import React from 'react';

function Card({
  children,
  variant = 'default', // 'default', 'elevated', 'outlined', 'filled'
  padding = 'medium', // 'none', 'small', 'medium', 'large'
  hover = false,
  clickable = false,
  onClick,
  className = '',
  ...props
}) {
  // 样式变体
  const variants = {
    default: 'bg-white dark:bg-gray-800 shadow-sm',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg',
    outlined: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    filled: 'bg-gray-50 dark:bg-gray-900'
  };

  // 内边距变体
  const paddings = {
    none: '',
    small: 'p-3',
    medium: 'p-6',
    large: 'p-8'
  };

  // 交互效果
  const interactiveStyles = clickable 
    ? 'cursor-pointer transform hover:scale-105 transition-all duration-200' 
    : hover 
    ? 'hover:shadow-xl transition-shadow duration-200' 
    : '';

  // 基础样式
  const baseStyles = 'rounded-xl';

  // 组合样式
  const cardStyles = `
    ${baseStyles}
    ${variants[variant]}
    ${paddings[padding]}
    ${interactiveStyles}
    ${className}
  `.trim();

  const Component = clickable ? 'button' : 'div';

  return (
    <Component
      className={cardStyles}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Card;
