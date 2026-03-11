import React from 'react';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import FileManager from '../../components/FileManager/FileManager';
import { useI18n } from '../../context/I18nContext';

function FileManagerPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {t('FileManagerTitle')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('FileManagerPageDesc')}
          </p>
        </div>

        {/* 文件管理器组件 */}
        <div className="h-[calc(100vh-200px)]">
          <FileManager />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default FileManagerPage;
