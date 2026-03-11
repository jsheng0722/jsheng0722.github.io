import React, { useMemo } from 'react';
import { FaHome, FaFolder, FaMusic, FaFileAlt, FaCode, FaImage, FaDesktop, FaEdit, FaVideo, FaShoppingCart, FaWallet } from 'react-icons/fa';
import DesktopShortcut from './DesktopShortcut';
import { useI18n } from '../../context/I18nContext';

function Desktop() {
  const { t } = useI18n();
  const shortcuts = useMemo(() => [
    { icon: FaHome, label: t('Home'), path: '/', color: 'text-blue-500' },
    { icon: FaDesktop, label: t('Desktop'), path: '/desktop', color: 'text-gray-500' },
    { icon: FaEdit, label: t('Blog'), path: '/blog', color: 'text-indigo-500' },
    { icon: FaVideo, label: t('Video'), path: '/video', color: 'text-red-500' },
    { icon: FaShoppingCart, label: t('Favorites'), path: '/shop', color: 'text-orange-500' },
    { icon: FaCode, label: t('Portfolio'), path: '/portfolio', color: 'text-purple-500' },
    { icon: FaFileAlt, label: t('Notes'), path: '/notes', color: 'text-pink-500' },
    { icon: FaImage, label: t('Products'), path: '/products', color: 'text-amber-500' },
    { icon: FaMusic, label: t('Music'), path: '/music', color: 'text-violet-500' },
    { icon: FaFolder, label: t('FileManager'), path: '/files', color: 'text-yellow-500' },
    { icon: FaWallet, label: t('Accounting'), path: '/accounting', color: 'text-emerald-500' }
  ], [t]);

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
