/**
 * 通用确认对话框组件
 * 基于 Dialog 组件，专门用于确认操作
 */

import React from 'react';
import Dialog from './Dialog';
import Button from '../Button/Button';

function ConfirmDialog({
  isOpen = false,
  onConfirm,
  onCancel,
  title = '确认操作',
  message = '确定要执行此操作吗？',
  confirmText = '确认',
  cancelText = '取消',
  type = 'confirm', // 'confirm', 'danger', 'warning'
  size = 'small',
  ...props
}) {
  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  // 根据类型设置确认按钮样式
  const getConfirmVariant = () => {
    switch (type) {
      case 'danger':
        return 'danger';
      case 'warning':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      type={type}
      size={size}
      showCloseButton={false}
      {...props}
    >
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          {message}
        </p>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            size="medium"
            onClick={handleCancel}
          >
            {cancelText}
          </Button>
          <Button
            variant={getConfirmVariant()}
            size="medium"
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

export default ConfirmDialog;
