import React from 'react';
import { FaSearch } from 'react-icons/fa';
import Input from '../Input/Input';
import { useI18n } from '../../../context/I18nContext';

/**
 * 通用搜索框组件；placeholder 未传时使用 i18n 默认
 */
function SearchBox({ 
  value, 
  onChange, 
  placeholder, 
  className = '',
  ...inputProps 
}) {
  const { t } = useI18n();
  const displayPlaceholder = placeholder ?? t('SearchPlaceholder');
  return (
    <div className={`flex-1 w-full ${className}`}>
      <Input
        type="text"
        placeholder={displayPlaceholder}
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
