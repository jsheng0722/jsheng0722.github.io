import React, { createContext, useContext, useMemo, useState } from 'react';

const translations = {
  en: {
    Home: 'Home',
    Study: 'Study',
    Portfolio: 'Portfolio',
    Notes: 'Notes',
    Products: 'Products',
    Music: 'Music',
    ToggleDark: 'Dark',
    ToggleLight: 'Light',
    Language: 'Language',
  },
  zh: {
    Home: '首页',
    Study: '学习',
    Portfolio: '作品集',
    Notes: '笔记',
    Products: '产品',
    Music: '音乐',
    ToggleDark: '暗黑',
    ToggleLight: '明亮',
    Language: '语言',
  }
};

const I18nContext = createContext();
export const useI18n = () => useContext(I18nContext);

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => localStorage.getItem('locale') || 'zh');
  const t = useMemo(() => key => translations[locale]?.[key] || key, [locale]);

  const switchLocale = (newLocale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  return (
    <I18nContext.Provider value={{ t, locale, switchLocale }}>
      {children}
    </I18nContext.Provider>
  );
};

