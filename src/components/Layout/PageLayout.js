import React from 'react';
import Header from './Header/Header';
import Footer from './Footer/Footer';

/**
 * 页面布局组件
 * 统一处理所有页面的 Header + Footer + 主内容区布局
 * 
 * @param {ReactNode} children - 页面主要内容
 * @param {string} className - 主内容区的额外样式类
 * @param {boolean} showHeader - 是否显示 Header（默认 true）
 * @param {boolean} showFooter - 是否显示 Footer（默认 true）
 */
function PageLayout({ 
  children, 
  className = '', 
  showHeader = true, 
  showFooter = true 
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {showHeader && <Header />}
      
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
}

export default PageLayout;
