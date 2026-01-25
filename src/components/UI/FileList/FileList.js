/**
 * 通用文件列表组件
 * 支持文件和文件夹的树形结构展示
 */

import React, { useState } from 'react';
import { FaFolder, FaFolderOpen, FaFileAlt, FaChevronRight, FaChevronDown } from 'react-icons/fa';

function FileList({
  items = [],
  onFileClick,
  onFolderClick,
  renderFile,
  renderFolder,
  showEmptyState = true,
  emptyStateText = 'No content selected',
  className = '',
  ...props
}) {
  const [openFolders, setOpenFolders] = useState({});

  const toggleFolder = (path) => {
    setOpenFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
    onFolderClick?.(path);
  };

  const handleFileClick = (file) => {
    onFileClick?.(file.path || file);
  };

  const renderItems = (items, level = 0) => {
    if (!items || items.length === 0) {
      if (showEmptyState && level === 0) {
        return (
          <p className="text-gray-500 dark:text-gray-400 py-4 text-center">
            {emptyStateText}
          </p>
        );
      }
      return null;
    }

    return items.map((item, index) => {
      const isFolder = item.type === 'folder' || item.children;
      const itemPath = item.path || `${item.name}-${index}`;
      const isOpen = openFolders[itemPath];

      if (isFolder) {
        const folderIcon = isOpen ? (
          <FaFolderOpen className="mr-2 text-yellow-500" />
        ) : (
          <FaFolder className="mr-2 text-yellow-500" />
        );

        const customFolder = renderFolder ? renderFolder(item, isOpen, toggleFolder) : null;
        if (customFolder) return customFolder;

        return (
          <li key={index} className={`ml-${level * 4} my-2`}>
            <div
              className="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors"
              onClick={() => toggleFolder(itemPath)}
            >
              {isOpen ? (
                <FaChevronDown className="mr-2 text-gray-500" />
              ) : (
                <FaChevronRight className="mr-2 text-gray-500" />
              )}
              {folderIcon}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {item.name}
              </span>
            </div>
            {isOpen && item.children && (
              <ul className="ml-4">
                {renderItems(item.children, level + 1)}
              </ul>
            )}
          </li>
        );
      } else {
        // 文件项
        const customFile = renderFile ? renderFile(item, handleFileClick) : null;
        if (customFile) return customFile;

        const fileExtension = item.path?.split('.').pop() || '';
        const isHtmlFile = fileExtension === 'html';

        return (
          <li
            key={index}
            className={`ml-${level * 4} my-2`}
          >
            <div
              className="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition-colors"
              onClick={() => handleFileClick(item)}
            >
              <FaFileAlt className="mr-2 text-blue-500" />
              <button className="text-blue-500 dark:text-blue-400 hover:underline">
                {isHtmlFile ? item.name.replace('.html', '') : item.name}
              </button>
            </div>
          </li>
        );
      }
    });
  };

  return (
    <div className={`w-full h-full bg-white dark:bg-gray-800 p-4 overflow-auto shadow-lg ${className}`} {...props}>
      <ul>
        {renderItems(items)}
      </ul>
    </div>
  );
}

export default FileList;
