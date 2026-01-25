import React, { useState } from 'react';
import { FaTimes, FaCopy, FaInfoCircle } from 'react-icons/fa';
import VisualizationToolkit from './VisualizationToolkit';
import { Button, Card } from '../UI';

/**
 * 可视化工具模态窗口
 * 可以在任何页面中调用
 */
function VisualizationModal({ isOpen, onClose, initialCode = null }) {
  const [showCodeInfo, setShowCodeInfo] = useState(!!initialCode);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70">
      <div className="w-full h-full max-w-[95vw] max-h-[95vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>✨</span>
              算法可视化工具
            </h2>
            {initialCode && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <span className="text-sm text-white font-medium">代码已加载</span>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(initialCode);
                    alert('代码已复制到剪贴板');
                  }}
                  size="small"
                  variant="ghost"
                  icon={<FaCopy />}
                  className="text-white hover:bg-white/30"
                />
              </div>
            )}
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="small"
            icon={<FaTimes />}
            className="text-white hover:bg-white/20"
          />
        </div>

        {/* 代码信息提示 */}
        {showCodeInfo && initialCode && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <FaInfoCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>代码已加载</strong>：代码自动解析功能正在开发中，当前请使用工具栏手动创建可视化工具。
                  </p>
                  <button
                    onClick={() => setShowCodeInfo(false)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 mt-1"
                  >
                    隐藏提示
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 可视化工具内容 */}
        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
          <VisualizationToolkit initialCode={initialCode} />
        </div>
      </div>
    </div>
  );
}

export default VisualizationModal;
