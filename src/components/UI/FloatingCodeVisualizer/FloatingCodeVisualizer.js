import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaCopy, FaCheck, FaTimes } from 'react-icons/fa';
import AlgorithmVisualizer from '../../AlgorithmVisualizer/AlgorithmVisualizer';

/**
 * 悬浮代码可视化组件
 * 显示代码框（左侧50%）和可视化内容（右侧50%）的悬浮面板
 * 
 * @param {boolean} isOpen - 是否显示悬浮面板
 * @param {function} onClose - 关闭回调函数
 * @param {string} code - 代码内容
 * @param {string} language - 代码语言
 * @param {function} onCopy - 复制代码回调函数
 * @param {boolean} copied - 是否已复制
 */
function FloatingCodeVisualizer({ 
  isOpen, 
  onClose, 
  code, 
  language, 
  onCopy, 
  copied = false 
}) {
  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      {/* 遮罩层 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* 左侧：代码框 */}
      <div className="relative w-1/2 bg-gray-900 dark:bg-gray-950 overflow-auto">
        <div className="sticky top-0 p-4 bg-gray-800 dark:bg-gray-900 border-b border-gray-700 dark:border-gray-800 flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold text-white">代码</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-300 hover:text-white"
            title="关闭"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="relative group">
            {/* 复制按钮 */}
            <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
              <button
                onClick={onCopy}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all flex items-center gap-1 text-sm"
                title="复制代码"
              >
                {copied ? (
                  <>
                    <FaCheck className="w-3 h-3" />
                    <span>已复制</span>
                  </>
                ) : (
                  <>
                    <FaCopy className="w-3 h-3" />
                    <span>复制</span>
                  </>
                )}
              </button>
            </div>
            
            <SyntaxHighlighter
              style={oneDark}
              language={language}
              PreTag="div"
              className="rounded-lg !m-0"
              customStyle={{
                margin: 0,
                borderRadius: '0.5rem',
                fontSize: '0.9rem'
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>

      {/* 右侧：可视化内容 */}
      <div className="relative w-1/2 bg-white dark:bg-gray-800 overflow-auto border-l border-gray-200 dark:border-gray-700">
        <div className="sticky top-0 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">算法可视化</h3>
        </div>
        <div className="p-4">
          <AlgorithmVisualizer 
            code={code}
            language={language}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

export default FloatingCodeVisualizer;
