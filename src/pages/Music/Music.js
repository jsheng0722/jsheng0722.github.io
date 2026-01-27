import React from 'react';
import { FaMusic, FaFileAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Card } from '../../components/UI';
import PageLayout from '../../components/Layout/PageLayout';

function Music() {
  return (
    <PageLayout className="max-w-4xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
            <FaMusic className="text-blue-500" />
            音乐创作
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            记录您的创作灵感，生成txt文件供AI创作使用
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 简单文本记录 */}
          <Link
            to="/music/simple-recorder"
            className="group"
          >
            <Card hover className="hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <FaFileAlt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    简单文本记录
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    纯文本灵感记录
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                记录您的创作灵感，自动生成txt文件。无需复杂分类，专注于内容本身。
              </p>
              
              <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                开始记录
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>
          </Link>

          {/* 占位卡片 - 未来功能 */}
          <Card className="opacity-60">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <FaMusic className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                  音乐播放器
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  即将推出
                </p>
              </div>
            </div>
            
            <p className="text-gray-400 dark:text-gray-500 mb-4">
              音乐播放功能正在开发中，敬请期待。
            </p>
            
            <div className="flex items-center text-gray-400 text-sm font-medium">
              敬请期待
            </div>
          </Card>
        </div>

        {/* 使用说明 */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            使用说明
          </h3>
          <div className="space-y-2 text-blue-800 dark:text-blue-200">
            <p>• 点击"简单文本记录"开始记录您的创作灵感</p>
            <p>• 所有灵感会按时间顺序排列</p>
            <p>• 可以随时下载txt文件，供AI创作使用</p>
            <p>• 支持编辑和删除已记录的灵感</p>
            <p>• 无需复杂的分类和标签，专注于内容本身</p>
          </div>
        </div>
    </PageLayout>
  );
}

export default Music;