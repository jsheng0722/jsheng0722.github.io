/**
 * 通用输入框组件
 * 支持多种类型和验证状态
 */

import React, { forwardRef } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Input = forwardRef(({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  error,
  helperText,
  size = 'medium', // 'small', 'medium', 'large'
  variant = 'default', // 'default', 'filled', 'outlined'
  icon,
  iconPosition = 'left', // 'left', 'right'
  showPasswordToggle = false,
  className = '',
  ...props
}, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  // 处理密码可见性
  const handlePasswordToggle = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // 处理焦点事件
  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // 尺寸变体
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-4 py-3 text-lg'
  };

  // 样式变体
  const variants = {
    default: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700',
    filled: 'border-0 bg-gray-100 dark:bg-gray-800',
    outlined: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent'
  };

  // 状态样式
  const stateStyles = error 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : isFocused 
    ? 'border-blue-500 focus:border-blue-500 focus:ring-blue-500' 
    : '';

  // 基础样式
  const baseStyles = `
    w-full rounded-lg transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed
    text-gray-900 dark:text-gray-100
    placeholder-gray-500 dark:placeholder-gray-400
  `;

  // 组合样式
  const inputStyles = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${stateStyles}
    ${className}
  `.trim();

  // 图标尺寸
  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  // 输入框类型
  const inputType = type === 'password' && isPasswordVisible ? 'text' : type;

  return (
    <div className="space-y-2">
      {/* 标签 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* 输入框容器 */}
      <div className="relative">
        {/* 左侧图标 */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <span className={iconSizes[size]}>
              {icon}
            </span>
          </div>
        )}

        {/* 输入框 */}
        <input
          ref={ref}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${inputStyles} ${icon && iconPosition === 'left' ? 'pl-10' : ''} ${(icon && iconPosition === 'right') || showPasswordToggle ? 'pr-10' : ''}`}
          {...props}
        />

        {/* 右侧图标 */}
        {(icon && iconPosition === 'right') && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <span className={iconSizes[size]}>
              {icon}
            </span>
          </div>
        )}

        {/* 密码可见性切换 */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={handlePasswordToggle}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {isPasswordVisible ? (
              <FaEyeSlash className={iconSizes[size]} />
            ) : (
              <FaEye className={iconSizes[size]} />
            )}
          </button>
        )}
      </div>

      {/* 错误信息 */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* 帮助文本 */}
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
