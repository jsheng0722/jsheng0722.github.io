/**
 * 通用颜色选择器
 * 基于原生 input[type="color"]，可配合工具栏使用
 */

import React from 'react';

function ColorPicker({
  value = '#000000',
  onChange,
  title = '选择颜色',
  size = 24,
  className = '',
  ...props
}) {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      title={title}
      className={`cursor-pointer rounded border border-gray-300 dark:border-gray-600 bg-transparent ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      aria-label={title}
      {...props}
    />
  );
}

export default ColorPicker;
