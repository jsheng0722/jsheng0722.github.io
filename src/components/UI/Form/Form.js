/**
 * 通用表单组件
 * 支持多种布局和验证
 */

import React from 'react';

function Form({
  children,
  onSubmit,
  method = 'post',
  action,
  className = '',
  ...props
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <form
      onSubmit={handleSubmit}
      method={method}
      action={action}
      className={`space-y-6 ${className}`}
      {...props}
    >
      {children}
    </form>
  );
}

export default Form;
