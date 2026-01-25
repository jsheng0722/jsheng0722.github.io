/**
 * 通用导航组件
 * 支持水平导航菜单
 */

import React from 'react';

function Navigation({ 
  items = [],
  onItemClick,
  activeItem,
  className = '',
  variant = 'default', // 'default', 'tabs', 'pills'
  ...props
}) {
  // 样式变体
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-800',
    tabs: 'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
    pills: 'bg-transparent'
  };

  // 按钮样式变体
  const buttonVariants = {
    default: 'text-black dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 hover:font-bold',
    tabs: 'px-4 py-2 border-b-2 transition-colors',
    pills: 'px-4 py-2 rounded-full transition-colors'
  };

  const getActiveStyles = (item, variant) => {
    if (activeItem && (activeItem === item.id || activeItem === item.name)) {
      switch (variant) {
        case 'tabs':
          return 'border-blue-500 text-blue-600 dark:text-blue-400 font-semibold';
        case 'pills':
          return 'bg-blue-600 text-white dark:bg-blue-500';
        default:
          return 'text-blue-500 dark:text-blue-400 font-bold';
      }
    }
    return '';
  };

  const getButtonStyles = (item, variant) => {
    const base = buttonVariants[variant] || buttonVariants.default;
    const active = getActiveStyles(item, variant);
    return `${base} ${active}`.trim();
  };

  return (
    <nav className={`w-full ${variants[variant]} ${className}`} {...props}>
      <div className="mx-auto w-4/5 flex items-center justify-center py-3">
        {items.map((item, index) => (
          <button
            key={item.id || index}
            onClick={() => onItemClick?.(item)}
            className={`mx-4 transition-all duration-200 ${getButtonStyles(item, variant)}`}
          >
            {item.name || item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default Navigation;
