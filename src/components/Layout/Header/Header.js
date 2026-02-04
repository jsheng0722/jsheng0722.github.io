import Navbar from '../Navbar/Navbar';
import UserProfile from "../../UserRelated/Profile/UserProfile";
// import SearchBar from '../Searchbar/Searchbar';
import LeftSideMenu from "../../UserRelated/SideMenu/LeftSideMenu";
import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useI18n } from '../../../context/I18nContext';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t, locale, switchLocale } = useI18n();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-gray-800 dark:bg-gray-900 flex flex-row w-full">
    <div className="flex w-[20%]">
      {/* Top bar for mobile */}
      <div className="flex bg-green-900 w-full md:hidden text-white items-center justify-center">
          <LeftSideMenu avatar='/images/avatar.png' isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      </div>
    </div>
    <div className="flex w-full items-center justify-center">
      <div className="w-[60%]">
        <Navbar navItems={[
          // 主要入口
          { label: t('Home'), path: '/' },
          { label: '桌面', path: '/desktop' },
          // 内容管理分组
          {
            label: '内容',
            children: [
              { label: '动态', path: '/blog' },
              { label: '视频', path: '/video' },
              { label: '收藏', path: '/shop' },
              { label: t('Notes'), path: '/notes' },
              { label: t('Music'), path: '/music' },
              { label: '文件管理', path: '/files' }
            ]
          },
          // 作品集
          { label: t('Portfolio'), path: '/portfolio' },
          // 产品
          { label: t('Products'), path: '/products' },
          // 工具
          {
            label: '工具',
            children: [
              { label: '项目架构', path: '/architecture' },
              { label: 'PDF', path: '/pdf' }
            ]
          }
        ]} />
      </div>
      <div className="hidden md:flex w-[40%] ml-5 items-center justify-end space-x-2">
        {/* <SearchBar /> */}
        <button
          onClick={toggleTheme}
          className="px-3 py-1 text-sm rounded bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
          title={theme === 'dark' ? t('ToggleLight') : t('ToggleDark')}
        >
          {theme === 'dark' ? t('ToggleLight') : t('ToggleDark')}
        </button>
        <select
          value={locale}
          onChange={(e) => switchLocale(e.target.value)}
          className="px-2 py-1 text-sm rounded bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
          title={t('Language')}
        >
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
    <div className="hidden md:block w-[10%]">
      <div className="flex items-center justify-center">
        <UserProfile />
      </div>
    </div>
    </header>

    )
}

export default Header;
