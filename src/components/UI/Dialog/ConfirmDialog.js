/**
 * 通用确认对话框组件
 * 基于 Dialog 组件，专门用于确认操作；未传 title/message/confirmText/cancelText 时使用 i18n 默认
 */

import React from 'react';
import Dialog from './Dialog';
import Button from '../Button/Button';
import { useI18n } from '../../../context/I18nContext';

function ConfirmDialog({
  isOpen = false,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText,
  cancelText,
  type = 'confirm', // 'confirm', 'danger', 'warning'
  size = 'small',
  ...props
}) {
  const { t } = useI18n();
  const displayTitle = title ?? t('ConfirmDefaultTitle');
  const displayMessage = message ?? t('ConfirmDefaultMessage');
  const displayConfirm = confirmText ?? t('Confirm');
  const displayCancel = cancelText ?? t('Cancel');
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
      title={displayTitle}
      type={type}
      size={size}
      showCloseButton={false}
      {...props}
    >
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          {displayMessage}
        </p>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            size="medium"
            onClick={handleCancel}
          >
            {displayCancel}
          </Button>
          <Button
            variant={getConfirmVariant()}
            size="medium"
            onClick={handleConfirm}
          >
            {displayConfirm}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

export default ConfirmDialog;
