/**
 * 通用模态框组件
 * 支持多种尺寸和动画效果
 */

import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

function Modal({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'medium', // 'small', 'medium', 'large', 'full'
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = '',
  ...props
}) {
  // 处理ESC键关闭
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // 阻止body滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // 尺寸变体
  const sizes = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg',
    full: 'max-w-full mx-4'
  };

  // 基础样式
  const overlayStyles = `
    fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4
    ${overlayClassName}
  `.trim();

  const modalStyles = `
    bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full ${sizes[size]}
    transform transition-all duration-300 ease-out
    ${className}
  `.trim();

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose?.();
    }
  };

  return (
    <div className={overlayStyles} onClick={handleOverlayClick} {...props}>
      <div className={modalStyles}>
        {/* 标题栏 */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
            )}
            
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

export default Modal;
