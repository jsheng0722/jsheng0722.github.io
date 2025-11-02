/**
 * 通用文本域组件
 * 支持多种尺寸和自动调整
 */

import React, { forwardRef, useEffect, useRef } from 'react';

const Textarea = forwardRef(({
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
  autoResize = false,
  minRows = 3,
  maxRows = 10,
  className = '',
  ...props
}, ref) => {
  const textareaRef = useRef(null);
  const [isFocused, setIsFocused] = React.useState(false);

  // 合并ref
  React.useImperativeHandle(ref, () => textareaRef.current);

  // 自动调整高度
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const minHeight = lineHeight * minRows;
      const maxHeight = lineHeight * maxRows;
      
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      
      textarea.style.height = `${newHeight}px`;
    }
  }, [value, autoResize, minRows, maxRows]);

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
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-4 py-4 text-lg'
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
    resize-none
  `;

  // 组合样式
  const textareaStyles = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${stateStyles}
    ${className}
  `.trim();

  return (
    <div className="space-y-2">
      {/* 标签 */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* 文本域 */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={minRows}
        className={textareaStyles}
        {...props}
      />

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

Textarea.displayName = 'Textarea';

export default Textarea;
