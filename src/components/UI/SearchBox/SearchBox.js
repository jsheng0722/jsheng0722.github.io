import React from 'react';
import { FaSearch } from 'react-icons/fa';
import Input from '../Input/Input';

/**
 * 通用搜索框组件
 * 
 * @param {string} value - 搜索值
 * @param {function} onChange - 值变化回调
 * @param {string} placeholder - 占位符文本
 * @param {string} className - 额外样式类
 * @param {object} inputProps - 传递给 Input 组件的额外属性
 */
function SearchBox({ 
  value, 
  onChange, 
  placeholder = '搜索...', 
  className = '',
  ...inputProps 
}) {
  return (
    <div className={`flex-1 w-full ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        icon={<FaSearch />}
        iconPosition="left"
        {...inputProps}
      />
    </div>
  );
}

export default SearchBox;
