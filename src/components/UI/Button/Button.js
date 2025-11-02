/**
 * 通用按钮组件
 * 支持多种样式和尺寸
 */

import React from 'react';
import { FaSpinner } from 'react-icons/fa';

function Button({
  children,
  variant = 'primary', // 'primary', 'secondary', 'success', 'warning', 'danger', 'ghost'
  size = 'medium', // 'small', 'medium', 'large'
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left', // 'left', 'right'
  onClick,
  className = '',
  type = 'button',
  ...props
}) {
  // 样式变体
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
  };

  // 尺寸变体
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  // 禁用状态
  const disabledStyles = disabled || loading 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer';

  // 基础样式
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';

  // 组合样式
  const buttonStyles = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${disabledStyles}
    ${className}
  `.trim();

  // 渲染图标
  const renderIcon = () => {
    if (loading) {
      return <FaSpinner className="animate-spin" />;
    }
    if (icon) {
      return icon;
    }
    return null;
  };

  // 图标位置
  const iconElement = renderIcon();
  const iconClasses = size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <button
      type={type}
      className={buttonStyles}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {iconElement && iconPosition === 'left' && (
        <span className={`${iconClasses} ${children ? 'mr-2' : ''}`}>
          {iconElement}
        </span>
      )}
      
      {children && (
        <span>{children}</span>
      )}
      
      {iconElement && iconPosition === 'right' && (
        <span className={`${iconClasses} ${children ? 'ml-2' : ''}`}>
          {iconElement}
        </span>
      )}
    </button>
  );
}

export default Button;
