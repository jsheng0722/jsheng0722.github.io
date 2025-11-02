/**
 * 通用对话框组件
 * 支持确认、警告、信息等多种类型
 */

import React from 'react';
import { FaTimes, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaQuestionCircle } from 'react-icons/fa';

function Dialog({
  isOpen = false,
  onClose,
  title,
  children,
  type = 'default', // 'default', 'info', 'success', 'warning', 'danger', 'confirm'
  size = 'medium', // 'small', 'medium', 'large', 'full'
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
  ...props
}) {
  if (!isOpen) return null;

  // 获取类型图标
  const getTypeIcon = () => {
    const iconProps = { className: 'w-6 h-6' };
    
    switch (type) {
      case 'info':
        return <FaInfoCircle {...iconProps} className="w-6 h-6 text-blue-500" />;
      case 'success':
        return <FaCheckCircle {...iconProps} className="w-6 h-6 text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle {...iconProps} className="w-6 h-6 text-yellow-500" />;
      case 'danger':
        return <FaExclamationTriangle {...iconProps} className="w-6 h-6 text-red-500" />;
      case 'confirm':
        return <FaQuestionCircle {...iconProps} className="w-6 h-6 text-blue-500" />;
      default:
        return null;
    }
  };

  // 尺寸变体
  const sizes = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg',
    full: 'max-w-full mx-4'
  };

  // 基础样式
  const overlayStyles = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  const dialogStyles = `
    bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full ${sizes[size]}
    ${className}
  `.trim();

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose?.();
    }
  };

  return (
    <div className={overlayStyles} onClick={handleOverlayClick} {...props}>
      <div className={dialogStyles}>
        {/* 标题栏 */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {getTypeIcon()}
              {title && (
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
              )}
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* 内容区域 */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Dialog;
