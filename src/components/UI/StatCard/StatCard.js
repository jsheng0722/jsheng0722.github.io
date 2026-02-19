/**
 * Stat / summary card: icon, label, value, optional border color variant.
 * Used for dashboards (e.g. income, expense, balance).
 */

import React from 'react';

const BORDER_VARIANTS = {
  emerald: 'border-l-emerald-500',
  red: 'border-l-red-500',
  blue: 'border-l-blue-500',
  amber: 'border-l-amber-500',
  gray: 'border-l-gray-500',
};

const VALUE_VARIANTS = {
  emerald: 'text-emerald-600 dark:text-emerald-400',
  red: 'text-red-600 dark:text-red-400',
  blue: 'text-blue-600 dark:text-blue-400',
  amber: 'text-amber-600 dark:text-amber-400',
  gray: 'text-gray-700 dark:text-gray-300',
};

function StatCard({
  icon,
  label,
  value,
  borderVariant = 'blue',
  valueVariant,
  size = 'medium', // 'compact' | 'medium' | 'large'
  className = '',
  ...props
}) {
  const borderClass = BORDER_VARIANTS[borderVariant] || BORDER_VARIANTS.blue;
  const valueClass = VALUE_VARIANTS[valueVariant ?? borderVariant] || VALUE_VARIANTS.blue;

  const sizeClasses = {
    compact: 'p-3',
    medium: 'p-4',
    large: 'p-6',
  };
  const labelSizes = {
    compact: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };
  const valueSizes = {
    compact: 'text-lg',
    medium: 'text-2xl',
    large: 'text-3xl',
  };
  const iconSizes = {
    compact: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5',
  };

  return (
    <div
      className={`border-l-4 ${borderClass} bg-white dark:bg-gray-800 rounded-xl shadow-sm ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <div className={`flex items-center gap-1 text-gray-500 dark:text-gray-400 ${labelSizes[size]}`}>
        {icon && <span className={iconSizes[size]}>{icon}</span>}
        {label}
      </div>
      <p className={`font-bold mt-0.5 ${valueSizes[size]} ${valueClass}`}>{value}</p>
    </div>
  );
}

export default StatCard;
