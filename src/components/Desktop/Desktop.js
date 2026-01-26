import React from 'react';
import { FaHome, FaFolder, FaMusic, FaFileAlt, FaCode, FaImage, FaDesktop, FaEdit, FaVideo, FaShoppingCart } from 'react-icons/fa';
import DesktopShortcut from './DesktopShortcut';

function Desktop() {
  const shortcuts = [
    { icon: FaHome, label: '首页', path: '/', color: 'text-blue-500' },
    { icon: FaDesktop, label: '桌面', path: '/desktop', color: 'text-gray-500' },
    { icon: FaEdit, label: '动态', path: '/blog', color: 'text-indigo-500' },
    { icon: FaVideo, label: '视频', path: '/video', color: 'text-red-500' },
    { icon: FaShoppingCart, label: '收藏', path: '/shop', color: 'text-orange-500' },
    { icon: FaCode, label: '作品集', path: '/portfolio', color: 'text-purple-500' },
    { icon: FaFileAlt, label: '笔记', path: '/notes', color: 'text-pink-500' },
    { icon: FaImage, label: '产品', path: '/products', color: 'text-amber-500' },
    { icon: FaMusic, label: '音乐', path: '/music', color: 'text-violet-500' },
    { icon: FaFolder, label: '文件管理', path: '/files', color: 'text-yellow-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
          {shortcuts.map((shortcut, index) => (
            <DesktopShortcut
              key={index}
              icon={shortcut.icon}
              label={shortcut.label}
              path={shortcut.path}
              color={shortcut.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Desktop;
