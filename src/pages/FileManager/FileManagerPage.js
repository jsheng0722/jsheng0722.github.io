import React from 'react';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import FileManager from '../../components/FileManager/FileManager';

function FileManagerPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            文件管理器
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            浏览和管理您的个人文件系统，就像使用电脑一样
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
