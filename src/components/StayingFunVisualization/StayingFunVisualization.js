import React, { useState } from 'react';
import { FaExternalLinkAlt, FaPlay, FaSpinner } from 'react-icons/fa';

/**
 * StayingFun 算法可视化组件
 * 支持通过链接或直接嵌入的方式显示算法可视化内容
 */
function StayingFunVisualization({ url, title = '算法可视化' }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 处理 staying.fun 的 URL
  // 如果 URL 是完整的 staying.fun 链接，转换为嵌入格式
  const getEmbedUrl = (originalUrl) => {
    if (!originalUrl) return null;
    
    // 如果已经是嵌入格式，直接返回
    if (originalUrl.includes('/embed') || originalUrl.includes('iframe')) {
      return originalUrl;
    }
    
    // 如果是 staying.fun 的普通链接，尝试转换为嵌入格式
    // staying.fun 的链接格式通常是: https://staying.fun/zh/...
    // 嵌入格式可能需要添加 /embed 或使用 iframe
    if (originalUrl.includes('staying.fun')) {
      // 尝试转换为嵌入 URL
      // 注意：staying.fun 可能不支持直接嵌入，这里提供一个通用的处理方式
      return originalUrl;
    }
    
    return originalUrl;
  };

  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="my-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
          ⚠️ 无效的可视化链接
        </p>
      </div>
    );
  }

  return (
    <div className="my-6 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-lg">
      {/* 标题栏 */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <FaPlay className="w-4 h-4" />
          <span className="font-semibold">{title}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-green-100 transition-colors"
          title="在新窗口打开"
        >
          <FaExternalLinkAlt className="w-4 h-4" />
        </a>
      </div>

      {/* 可视化内容 */}
      <div className="relative bg-white dark:bg-gray-800" style={{ minHeight: '400px' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <FaSpinner className="w-8 h-8 text-green-500 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">加载可视化内容...</p>
            </div>
          </div>
        )}
        
        {error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">
              ❌ 无法加载可视化内容
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <FaExternalLinkAlt className="w-4 h-4" />
              在新窗口打开
            </a>
          </div>
        ) : (
          <>
            {/* 尝试使用 iframe 嵌入 */}
            <iframe
              src={embedUrl}
              className="w-full border-0"
              style={{ minHeight: '400px', height: '600px' }}
              title={title}
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            
            {/* 如果 iframe 不支持，显示链接 */}
            {!embedUrl.includes('staying.fun') && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  💡 如果可视化内容未显示，请点击上方按钮在新窗口打开
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default StayingFunVisualization;

