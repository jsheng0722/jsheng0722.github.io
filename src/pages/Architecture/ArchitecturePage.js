import React from 'react';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import ArchitectureMindMapWrapper from './ArchitectureMindMap';
import { 
  FaLayerGroup
} from 'react-icons/fa';

/**
 * 项目架构展示页面
 * 以文件系统树状结构展示项目整体架构
 */
function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-3">
            <FaLayerGroup className="text-blue-500" />
            项目架构展示
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            以文件系统树状结构展示项目整体架构和关联关系
          </p>
        </div>

        {/* 思维导图视图 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
          <ArchitectureMindMapWrapper />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ArchitecturePage;
