/**
 * 通用图标切换按钮
 * 仅图标、无文字；选中时高亮，再次点击取消并失焦
 */

import React from 'react';
import Button from '../Button/Button';

function IconToggleButton({
  icon,
  active = false,
  onClick,
  title,
  activeClassName = 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 ring-0',
  inactiveClassName = 'hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-0 focus:outline-none',
  variant = 'ghost',
  size = 'small',
  className = '',
  ...props
}) {
  const handleClick = (e) => {
    const nextActive = !active;
    onClick?.(nextActive, e);
    if (!nextActive) e.currentTarget?.blur();
  };

  return (
    <Button
      variant={variant}
      size={size}
      icon={icon}
      onClick={handleClick}
      title={title}
      className={active ? activeClassName : inactiveClassName + (className ? ` ${className}` : '')}
      aria-pressed={active}
      {...props}
    />
  );
}

export default IconToggleButton;
