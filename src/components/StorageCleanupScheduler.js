/**
 * 存储清理调度器组件
 * 提供存储清理的UI界面和控制
 */

import React, { useState, useEffect } from 'react';
import { FaTrash, FaDownload, FaUpload, FaCog, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import storageCleanupManager from '../utils/StorageCleanupManager';
import immediateConverter from '../utils/ImmediateConverter';
import dataManager from '../utils/DataManager';

const StorageCleanupScheduler = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [cleanupRules, setCleanupRules] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState([]);

  // 加载统计信息
  const loadStats = () => {
    const storageStats = dataManager.getStorageStats();
    const conversionStats = immediateConverter.getConversionStats();
    setStats({ storage: storageStats, conversion: conversionStats });
  };

  // 加载清理规则
  const loadCleanupRules = () => {
    const rules = {};
    Object.keys(dataManager.storageKeys).forEach(type => {
      rules[type] = storageCleanupManager.getCleanupRules(type);
    });
    setCleanupRules(rules);
  };

  // 加载日志
  const loadLogs = () => {
    const allLogs = dataManager.getLocalData('logs') || [];
    const recentLogs = allLogs
      .filter(log => log.action === 'cleanup' || log.action === 'convert')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);
    setLogs(recentLogs);
  };

  useEffect(() => {
    if (isOpen) {
      loadStats();
      loadCleanupRules();
      loadLogs();
    }
  }, [isOpen]);

  // 立即转换所有数据
  const handleConvertAll = async (type) => {
    setIsProcessing(true);
    try {
      const result = await immediateConverter.convertAllLocalData(type);
      alert(`转换完成：${result.message}`);
      loadStats();
      loadLogs();
    } catch (error) {
      alert(`转换失败：${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 清理已转换数据
  const handleCleanup = async (type) => {
    if (!confirm(`确定要清理${type}的已转换数据吗？这将删除localStorage中的已转换数据。`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await storageCleanupManager.manualCleanupType(type);
      alert(`${type}数据清理完成`);
      loadStats();
      loadLogs();
    } catch (error) {
      alert(`清理失败：${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 清理所有数据
  const handleCleanupAll = async () => {
    if (!confirm('确定要清理所有已转换数据吗？这将删除localStorage中的所有已转换数据。')) {
      return;
    }

    setIsProcessing(true);
    try {
      await storageCleanupManager.manualCleanupAll();
      alert('所有数据清理完成');
      loadStats();
      loadLogs();
    } catch (error) {
      alert(`清理失败：${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 更新清理规则
  const handleUpdateRules = (type, newRules) => {
    storageCleanupManager.setCleanupRules(type, newRules);
    setCleanupRules(prev => ({
      ...prev,
      [type]: { ...prev[type], ...newRules }
    }));
    alert(`${type}清理规则已更新`);
  };

  // 启动/停止自动清理
  const handleToggleAutoCleanup = () => {
    if (storageCleanupManager.cleanupTimer) {
      storageCleanupManager.stopAutoCleanup();
      alert('自动清理已停止');
    } else {
      storageCleanupManager.startAutoCleanup();
      alert('自动清理已启动');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="存储管理"
      >
        <FaCog className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full h-full max-w-6xl max-h-[90vh] m-4 overflow-hidden">
        {/* 头部 */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            存储清理调度器
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 overflow-y-auto h-full">
          {/* 统计信息 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaInfoCircle className="text-blue-500" />
              存储统计
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stats.storage || {}).map(([type, stat]) => (
                <div key={type} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {type}
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <p>本地数据: {stat.localCount} 条</p>
                    <p>文件数据: {stat.fileCount} 个</p>
                    <p>大小: {(stat.totalSize / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">批量操作</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleCleanupAll}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FaTrash className="w-4 h-4" />
                清理所有已转换数据
              </button>
              
              <button
                onClick={handleToggleAutoCleanup}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <FaCog className="w-4 h-4" />
                {storageCleanupManager.cleanupTimer ? '停止自动清理' : '启动自动清理'}
              </button>
            </div>
          </div>

          {/* 按类型操作 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">按类型操作</h3>
            <div className="space-y-4">
              {Object.entries(stats.storage || {}).map(([type, stat]) => (
                <div key={type} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {type}
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConvertAll(type)}
                        disabled={isProcessing || stat.localCount === 0}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        <FaUpload className="w-3 h-3" />
                        转换所有
                      </button>
                      <button
                        onClick={() => handleCleanup(type)}
                        disabled={isProcessing}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        <FaTrash className="w-3 h-3" />
                        清理
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>本地: {stat.localCount} 条 | 文件: {stat.fileCount} 个</p>
                    {cleanupRules[type] && (
                      <p className="mt-1">
                        保留: {cleanupRules[type].keepDays} 天 | 
                        最大: {cleanupRules[type].maxItems} 条 |
                        自动清理: {cleanupRules[type].autoCleanup ? '开启' : '关闭'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 清理规则设置 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">清理规则设置</h3>
            <div className="space-y-4">
              {Object.entries(cleanupRules).map(([type, rules]) => (
                <div key={type} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 capitalize mb-3">
                    {type} 清理规则
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        保留天数
                      </label>
                      <input
                        type="number"
                        value={rules.keepDays || 7}
                        onChange={(e) => handleUpdateRules(type, { keepDays: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        最大条数
                      </label>
                      <input
                        type="number"
                        value={rules.maxItems || 50}
                        onChange={(e) => handleUpdateRules(type, { maxItems: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={rules.autoCleanup || false}
                          onChange={(e) => handleUpdateRules(type, { autoCleanup: e.target.checked })}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          自动清理
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 操作日志 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">操作日志</h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-60 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  暂无操作日志
                </p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="flex-shrink-0">
                        {log.action === 'convert' ? (
                          <FaCheckCircle className="text-green-500" />
                        ) : (
                          <FaExclamationTriangle className="text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-900 dark:text-gray-100">
                          {log.action === 'convert' ? '转换' : '清理'} {log.type} 数据
                        </span>
                        {log.dataTitle && (
                          <span className="text-gray-600 dark:text-gray-400 ml-2">
                            - {log.dataTitle}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageCleanupScheduler;
