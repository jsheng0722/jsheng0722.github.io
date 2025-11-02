/**
 * 数据管理Hook
 * 为React组件提供统一的数据管理接口
 */

import { useState, useEffect, useCallback } from 'react';
import dataManager from '../utils/DataManager';
import autoSaveManager from '../utils/AutoSaveManager';
import fileGenerator from '../utils/FileGenerator';

export const useDataManager = (type, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState({
    lastSaved: null,
    hasUnsavedChanges: false,
    isOnline: navigator.onLine
  });

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const mergedData = await dataManager.getMergedData(type);
      setData(mergedData);
      setSaveStatus(autoSaveManager.getSaveStatus(type));
    } catch (err) {
      setError(err.message);
      console.error(`加载${type}数据失败:`, err);
    } finally {
      setLoading(false);
    }
  }, [type]);

  // 保存数据
  const saveData = useCallback(async (newData, saveOptions = {}) => {
    try {
      setError(null);
      const savedData = await dataManager.saveData(type, newData, saveOptions);
      
      // 更新本地状态
      setData(prevData => {
        const existingIndex = prevData.findIndex(item => item.id === savedData.id);
        if (existingIndex >= 0) {
          const updated = [...prevData];
          updated[existingIndex] = savedData;
          return updated;
        } else {
          return [...prevData, savedData];
        }
      });
      
      // 更新保存状态
      autoSaveManager.setSaveStatus(type, true);
      setSaveStatus(autoSaveManager.getSaveStatus(type));
      
      return savedData;
    } catch (err) {
      setError(err.message);
      console.error(`保存${type}数据失败:`, err);
      throw err;
    }
  }, [type]);

  // 删除数据
  const deleteData = useCallback(async (id) => {
    try {
      setError(null);
      await dataManager.deleteData(type, id);
      
      // 更新本地状态
      setData(prevData => prevData.filter(item => item.id !== id));
      
      // 更新保存状态
      autoSaveManager.setSaveStatus(type, true);
      setSaveStatus(autoSaveManager.getSaveStatus(type));
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error(`删除${type}数据失败:`, err);
      throw err;
    }
  }, [type]);

  // 启用自动保存
  const enableAutoSave = useCallback((data, options = {}) => {
    autoSaveManager.enableAutoSave(type, data, options);
  }, [type]);

  // 禁用自动保存
  const disableAutoSave = useCallback(() => {
    autoSaveManager.disableAutoSave(type);
  }, [type]);

  // 同步数据
  const syncData = useCallback(async () => {
    try {
      setError(null);
      const syncedData = await dataManager.syncFromFiles(type);
      setData(syncedData);
      setSaveStatus(autoSaveManager.getSaveStatus(type));
      return syncedData;
    } catch (err) {
      setError(err.message);
      console.error(`同步${type}数据失败:`, err);
      throw err;
    }
  }, [type]);

  // 导出数据
  const exportData = useCallback(() => {
    dataManager.exportData(type);
  }, [type]);

  // 导入数据
  const importData = useCallback(async (file) => {
    try {
      setError(null);
      const importedData = await dataManager.importData(type, file);
      setData(importedData);
      setSaveStatus(autoSaveManager.getSaveStatus(type));
      return importedData;
    } catch (err) {
      setError(err.message);
      console.error(`导入${type}数据失败:`, err);
      throw err;
    }
  }, [type]);

  // 生成文件
  const generateFile = useCallback(async (data, options = {}) => {
    try {
      setError(null);
      const result = await fileGenerator.generateFile(type, data, options);
      return result;
    } catch (err) {
      setError(err.message);
      console.error(`生成${type}文件失败:`, err);
      throw err;
    }
  }, [type]);

  // 立即转换并清理
  const convertAndCleanup = useCallback(async (data, options = {}) => {
    try {
      setError(null);
      const result = await dataManager.convertAndCleanup(type, data, options);
      return result;
    } catch (err) {
      setError(err.message);
      console.error(`转换并清理${type}数据失败:`, err);
      throw err;
    }
  }, [type]);

  // 转换所有数据
  const convertAllData = useCallback(async (options = {}) => {
    try {
      setError(null);
      const result = await dataManager.convertAllData(type, options);
      return result;
    } catch (err) {
      setError(err.message);
      console.error(`转换所有${type}数据失败:`, err);
      throw err;
    }
  }, [type]);

  // 清理已转换数据
  const cleanupConvertedData = useCallback(async () => {
    try {
      setError(null);
      const result = await dataManager.cleanupConvertedData(type);
      return result;
    } catch (err) {
      setError(err.message);
      console.error(`清理${type}数据失败:`, err);
      throw err;
    }
  }, [type]);

  // 获取存储统计
  const getStorageStats = useCallback(() => {
    return dataManager.getStorageStats();
  }, []);

  // 初始化
  useEffect(() => {
    loadData();
    
    // 监听网络状态变化
    const handleOnline = () => {
      setSaveStatus(prev => ({ ...prev, isOnline: true }));
      syncData();
    };
    
    const handleOffline = () => {
      setSaveStatus(prev => ({ ...prev, isOnline: false }));
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      disableAutoSave();
    };
  }, [loadData, syncData, disableAutoSave]);

  return {
    data,
    loading,
    error,
    saveStatus,
    loadData,
    saveData,
    deleteData,
    enableAutoSave,
    disableAutoSave,
    syncData,
    exportData,
    importData,
    generateFile,
    convertAndCleanup,
    convertAllData,
    cleanupConvertedData,
    getStorageStats
  };
};

// 专门的Hook用于不同类型的数据
export const useNotes = (options = {}) => useDataManager('notes', options);
export const useMusic = (options = {}) => useDataManager('music', options);
export const useWeather = (options = {}) => useDataManager('weather', options);
export const useDiagrams = (options = {}) => useDataManager('diagrams', options);

export default useDataManager;
