import React, { useEffect, useState } from 'react';
import { Loading, EmptyState } from '../index';

/**
 * 通用文件查看器组件
 * 支持 HTML 和文本文件的显示
 * 
 * @param {string} filePath - 文件路径
 * @param {string} basePath - 基础路径（可选，默认为空）
 * @param {boolean} showLoading - 是否显示加载状态（默认 true）
 */
function FileViewer({ 
  filePath, 
  basePath = '', 
  showLoading = true 
}) {
  const [content, setContent] = useState('');
  const [isHtml, setIsHtml] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!filePath) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // 构建完整路径
    const fullPath = basePath ? `${basePath}/${filePath}` : `/${filePath}`;

    fetch(fullPath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load file: ${response.statusText}`);
        }
        return response.text();
      })
      .then(text => {
        // 判断是否为 HTML 文件
        const isHtmlFile = filePath.endsWith('.html') || 
                          filePath.endsWith('.htm') ||
                          text.trim().startsWith('<!DOCTYPE') ||
                          text.trim().startsWith('<html');
        
        setIsHtml(isHtmlFile);
        setContent(text);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading file:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [filePath, basePath]);

  if (!filePath) {
    return (
      <EmptyState 
        title="未选择文件" 
        description="请选择一个文件查看其内容"
        icon="file"
      />
    );
  }

  if (loading && showLoading) {
    return <Loading text="加载文件中..." />;
  }

  if (error) {
    return (
      <EmptyState 
        title="加载失败" 
        description={error}
        icon="warning"
      />
    );
  }

  if (isHtml) {
    return (
      <div className="file-viewer p-4 flex-grow">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  }

  return (
    <div className="file-viewer p-4 flex-grow">
      <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-auto">
        {content}
      </pre>
    </div>
  );
}

export default FileViewer;
