/**
 * 优化后的使用示例
 * 展示如何在保持所有现有功能的情况下使用优化后的系统
 */

import React, { useState, useEffect } from 'react';
import { FaSave, FaTrash, FaUpload, FaDownload, FaInfoCircle, FaCog, FaCheckCircle } from 'react-icons/fa';
import { useNotes, useMusic, useWeather, useDiagrams } from '../hooks/useDataManager';

// 示例1：优化后的笔记编辑器（保持所有现有功能）
export const OptimizedNoteEditor = () => {
  const {
    data: notes,
    loading,
    error,
    saveStatus,
    saveData,
    deleteData,
    convertAndCleanup,
    convertAllData,
    cleanupConvertedData,
    getStorageStats
  } = useNotes();

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: '随笔',
    tags: []
  });
  const [stats, setStats] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // 加载统计信息
  useEffect(() => {
    const loadStats = () => {
      setStats(getStorageStats());
    };
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, [getStorageStats]);

  // 保存笔记（保持原有功能）
  const handleSave = async () => {
    if (!newNote.title.trim()) {
      alert('请输入笔记标题');
      return;
    }

    setIsProcessing(true);
    try {
      // 使用优化后的保存方法，保持原有接口
      await saveData(newNote, { immediateConvert: true });
      setNewNote({ title: '', content: '', category: '随笔', tags: [] });
      alert('笔记已保存并转换为文件');
    } catch (error) {
      alert('保存失败：' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 立即转换单条数据（保持原有功能）
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

  // 转换所有数据（保持原有功能）
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

  // 清理已转换数据（保持原有功能）
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

  // 删除笔记（保持原有功能）
  const handleDelete = async (id) => {
    if (confirm('确定要删除这篇笔记吗？')) {
      try {
        await deleteData(id);
        alert('笔记删除成功');
      } catch (error) {
        alert('删除失败：' + error.message);
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">优化后的笔记编辑器</h2>
      
      {/* 保存状态指示器（保持原有功能） */}
      <div className="mb-4 p-3 bg-gray-100 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {saveStatus.hasUnsavedChanges ? (
              <FaInfoCircle className="text-yellow-500" />
            ) : (
              <FaCheckCircle className="text-green-500" />
            )}
            <span className="text-sm text-gray-600">
              {saveStatus.hasUnsavedChanges ? '有未保存的更改' : '已保存'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            网络状态：{saveStatus.isOnline ? '在线' : '离线'}
          </div>
        </div>
      </div>

      {/* 存储统计（保持原有功能） */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <FaInfoCircle className="text-blue-500" />
          存储统计
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>本地数据: {stats.notes?.localCount || 0} 条</div>
          <div>文件数据: {stats.notes?.fileCount || 0} 个</div>
          <div>大小: {((stats.notes?.totalSize || 0) / 1024).toFixed(2)} KB</div>
        </div>
      </div>

      {/* 新建笔记（保持原有功能） */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">新建笔记</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="笔记标题"
            value={newNote.title}
            onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 border rounded"
          />
          <select
            value={newNote.category}
            onChange={(e) => setNewNote(prev => ({ ...prev, category: e.target.value }))}
            className="w-full p-2 border rounded"
          >
            <option value="随笔">随笔</option>
            <option value="算法">算法</option>
            <option value="生活">生活</option>
          </select>
          <textarea
            placeholder="笔记内容"
            value={newNote.content}
            onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
            className="w-full p-2 border rounded h-24"
          />
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <FaSave className="w-4 h-4" />
            {isProcessing ? '保存中...' : '保存并转换'}
          </button>
        </div>
      </div>

      {/* 批量操作（保持原有功能） */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={handleConvertAll}
          disabled={isProcessing || notes.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          <FaUpload className="w-4 h-4" />
          转换所有笔记
        </button>
        
        <button
          onClick={handleCleanup}
          disabled={isProcessing}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
        >
          <FaTrash className="w-4 h-4" />
          清理已转换数据
        </button>
      </div>

      {/* 笔记列表（保持原有功能） */}
      <div>
        <h3 className="text-lg font-semibold mb-3">笔记列表</h3>
        {loading ? (
          <p>加载中...</p>
        ) : error ? (
          <p className="text-red-500">加载失败：{error}</p>
        ) : (
          <div className="space-y-2">
            {notes.map(note => (
              <div key={note.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{note.title}</h4>
                  <p className="text-sm text-gray-600">{note.category}</p>
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
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center gap-1"
                  >
                    <FaTrash className="w-3 h-3" />
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 示例2：优化后的存储管理面板（保持所有现有功能）
export const OptimizedStoragePanel = () => {
  const { getStorageStats, convertAllData, cleanupConvertedData } = useNotes();
  const [stats, setStats] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadStats = () => {
      setStats(getStorageStats());
    };
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, [getStorageStats]);

  const handleConvertAll = async () => {
    if (!confirm('确定要转换所有数据吗？')) return;
    
    setIsProcessing(true);
    try {
      const result = await convertAllData();
      alert(`转换完成：${result.message}`);
      setStats(getStorageStats());
    } catch (error) {
      alert(`转换失败：${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCleanupAll = async () => {
    if (!confirm('确定要清理所有已转换数据吗？')) return;
    
    setIsProcessing(true);
    try {
      await cleanupConvertedData();
      alert('清理完成');
      setStats(getStorageStats());
    } catch (error) {
      alert(`清理失败：${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">优化后的存储管理面板</h2>
      
      {/* 存储统计（保持原有功能） */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">存储统计</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats).map(([type, stat]) => (
            <div key={type} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 capitalize mb-2">{type}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>本地: {stat.localCount} 条</p>
                <p>文件: {stat.fileCount} 个</p>
                <p>大小: {(stat.totalSize / 1024).toFixed(2)} KB</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 操作按钮（保持原有功能） */}
      <div className="flex gap-4">
        <button
          onClick={handleConvertAll}
          disabled={isProcessing}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          <FaUpload className="w-4 h-4" />
          {isProcessing ? '转换中...' : '转换所有数据'}
        </button>
        
        <button
          onClick={handleCleanupAll}
          disabled={isProcessing}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
        >
          <FaTrash className="w-4 h-4" />
          {isProcessing ? '清理中...' : '清理已转换数据'}
        </button>
      </div>
    </div>
  );
};

// 主示例组件
const OptimizedUsageExample = () => {
  const [activeTab, setActiveTab] = useState('editor');

  const tabs = [
    { id: 'editor', label: '笔记编辑器', component: OptimizedNoteEditor },
    { id: 'panel', label: '存储面板', component: OptimizedStoragePanel }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">优化后的存储管理示例</h1>
        <p className="text-gray-600 mb-6">
          ✅ 保持所有现有功能不变<br/>
          ✅ 内部实现已优化，性能更好<br/>
          ✅ 代码更简洁，维护更容易
        </p>
        
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
    </div>
  );
};

export default OptimizedUsageExample;
