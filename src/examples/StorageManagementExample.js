/**
 * 存储管理使用示例
 * 展示如何使用存储清理和立即转换功能
 */

import React, { useState, useEffect } from 'react';
import { FaTrash, FaDownload, FaUpload, FaCog, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useNotes, useMusic, useWeather, useDiagrams } from '../hooks/useDataManager';
import StorageCleanupScheduler from '../components/StorageCleanupScheduler';

// 示例1：智能存储管理组件
export const SmartStorageManager = () => {
  const {
    data: notes,
    convertAndCleanup,
    convertAllData,
    cleanupConvertedData,
    getStorageStats
  } = useNotes();

  const [stats, setStats] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // 加载统计信息
  useEffect(() => {
    const loadStats = () => {
      const storageStats = getStorageStats();
      setStats(storageStats);
    };
    
    loadStats();
    const interval = setInterval(loadStats, 5000); // 每5秒更新一次
    
    return () => clearInterval(interval);
  }, [getStorageStats]);

  // 立即转换单条数据
  const handleConvertSingle = async (note) => {
    setIsProcessing(true);
    try {
      const result = await convertAndCleanup(note);
      if (result.success) {
        alert(`笔记"${note.title}"已转换为文件并清理`);
      } else {
        alert(`转换失败：${result.error}`);
      }
    } catch (error) {
      alert(`转换失败：${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 转换所有数据
  const handleConvertAll = async () => {
    if (!confirm('确定要转换所有笔记数据吗？')) return;
    
    setIsProcessing(true);
    try {
      const result = await convertAllData();
      alert(`转换完成：${result.message}`);
    } catch (error) {
      alert(`转换失败：${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 清理已转换数据
  const handleCleanup = async () => {
    if (!confirm('确定要清理已转换的笔记数据吗？')) return;
    
    setIsProcessing(true);
    try {
      await cleanupConvertedData();
      alert('清理完成');
    } catch (error) {
      alert(`清理失败：${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">智能存储管理</h2>
      
      {/* 存储统计 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaInfoCircle className="text-blue-500" />
          存储统计
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats).map(([type, stat]) => (
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
            onClick={handleConvertAll}
            disabled={isProcessing || notes.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <FaUpload className="w-4 h-4" />
            转换所有笔记
          </button>
          
          <button
            onClick={handleCleanup}
            disabled={isProcessing}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            <FaTrash className="w-4 h-4" />
            清理已转换数据
          </button>
        </div>
      </div>

      {/* 笔记列表 */}
      <div>
        <h3 className="text-lg font-semibold mb-4">笔记列表</h3>
        <div className="space-y-2">
          {notes.map(note => (
            <div key={note.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {note.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {note.category} • {note.tags?.join(', ')}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleConvertSingle(note)}
                  disabled={isProcessing}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <FaUpload className="w-3 h-3" />
                  转换
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 示例2：自动清理配置组件
export const AutoCleanupConfig = () => {
  const [config, setConfig] = useState({
    notes: { keepDays: 7, maxItems: 50, autoCleanup: true },
    music: { keepDays: 30, maxItems: 100, autoCleanup: true },
    weather: { keepDays: 3, maxItems: 20, autoCleanup: true },
    diagrams: { keepDays: 14, maxItems: 30, autoCleanup: true }
  });

  const handleUpdateConfig = (type, field, value) => {
    setConfig(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleSaveConfig = () => {
    // 这里应该保存配置到localStorage或服务器
    localStorage.setItem('cleanupConfig', JSON.stringify(config));
    alert('配置已保存');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">自动清理配置</h2>
      
      <div className="space-y-6">
        {Object.entries(config).map(([type, rules]) => (
          <div key={type} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 capitalize">{type} 清理规则</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  保留天数
                </label>
                <input
                  type="number"
                  value={rules.keepDays}
                  onChange={(e) => handleUpdateConfig(type, 'keepDays', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  最大条数
                </label>
                <input
                  type="number"
                  value={rules.maxItems}
                  onChange={(e) => handleUpdateConfig(type, 'maxItems', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rules.autoCleanup}
                    onChange={(e) => handleUpdateConfig(type, 'autoCleanup', e.target.checked)}
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
      
      <div className="mt-6">
        <button
          onClick={handleSaveConfig}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaCog className="w-4 h-4" />
          保存配置
        </button>
      </div>
    </div>
  );
};

// 示例3：转换状态监控组件
export const ConversionMonitor = () => {
  const [conversionStats, setConversionStats] = useState({});
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const loadStats = () => {
      // 模拟获取转换统计
      const stats = {
        total: 15,
        byType: { notes: 8, music: 4, weather: 2, diagrams: 1 },
        recent: 3
      };
      setConversionStats(stats);
    };

    const loadLogs = () => {
      // 模拟获取转换日志
      const mockLogs = [
        { type: 'notes', action: 'convert', timestamp: new Date().toISOString(), dataTitle: '算法笔记' },
        { type: 'music', action: 'convert', timestamp: new Date(Date.now() - 3600000).toISOString(), dataTitle: 'Chill Playlist' },
        { type: 'weather', action: 'cleanup', timestamp: new Date(Date.now() - 7200000).toISOString(), dataTitle: 'Beijing Weather' }
      ];
      setLogs(mockLogs);
    };

    loadStats();
    loadLogs();
    
    const interval = setInterval(() => {
      loadStats();
      loadLogs();
    }, 10000); // 每10秒更新一次
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">转换状态监控</h2>
      
      {/* 转换统计 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">转换统计</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {conversionStats.total || 0}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              总转换数
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {conversionStats.recent || 0}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              今日转换
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Object.keys(conversionStats.byType || {}).length}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              数据类型
            </div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {logs.length}
            </div>
            <div className="text-sm text-orange-600 dark:text-orange-400">
              操作日志
            </div>
          </div>
        </div>
      </div>

      {/* 按类型统计 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">按类型统计</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(conversionStats.byType || {}).map(([type, count]) => (
            <div key={type} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {count}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {type}
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
  );
};

// 主示例组件
const StorageManagementExample = () => {
  const [activeTab, setActiveTab] = useState('smart');
  const [showScheduler, setShowScheduler] = useState(false);

  const tabs = [
    { id: 'smart', label: '智能存储管理', component: SmartStorageManager },
    { id: 'config', label: '自动清理配置', component: AutoCleanupConfig },
    { id: 'monitor', label: '转换状态监控', component: ConversionMonitor }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">存储管理示例</h1>
          <button
            onClick={() => setShowScheduler(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <FaCog className="w-4 h-4" />
            存储调度器
          </button>
        </div>
        
        {/* 标签页 */}
        <div className="flex space-x-1 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="bg-white rounded-lg shadow-sm">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>

      {/* 存储调度器 */}
      {showScheduler && (
        <StorageCleanupScheduler />
      )}
    </div>
  );
};

export default StorageManagementExample;
