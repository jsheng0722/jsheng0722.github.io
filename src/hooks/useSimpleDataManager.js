/**
 * 简化版数据管理Hook
 * 整合所有功能，减少复杂度
 */

import { useState, useEffect, useCallback } from 'react';
import simpleDataManager from '../utils/SimpleDataManager';

export const useSimpleDataManager = (type, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const mergedData = await simpleDataManager.getMergedData(type);
      setData(mergedData);
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
      const savedData = await simpleDataManager.saveData(type, newData, saveOptions);
      
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
      await simpleDataManager.deleteData(type, id);
      
      // 更新本地状态
      setData(prevData => prevData.filter(item => item.id !== id));
      
      return true;
    } catch (err) {
      setError(err.message);
      console.error(`删除${type}数据失败:`, err);
      throw err;
    }
  }, [type]);

  // 立即转换并清理
  const convertAndCleanup = useCallback(async (data, options = {}) => {
    try {
      setError(null);
      const result = await simpleDataManager.convertAndCleanup(type, data, options);
      
      if (result.success) {
        // 从本地状态中删除
        setData(prevData => prevData.filter(item => item.id !== data.id));
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      console.error(`转换${type}数据失败:`, err);
      throw err;
    }
  }, [type]);

  // 转换所有数据
  const convertAllData = useCallback(async (options = {}) => {
    try {
      setError(null);
      const result = await simpleDataManager.convertAllData(type, options);
      
      if (result.success) {
        // 重新加载数据
        await loadData();
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      console.error(`转换所有${type}数据失败:`, err);
      throw err;
    }
  }, [type, loadData]);

  // 自动清理
  const autoCleanup = useCallback(async () => {
    try {
      setError(null);
      await simpleDataManager.autoCleanup(type);
      await loadData(); // 重新加载数据
    } catch (err) {
      setError(err.message);
      console.error(`自动清理${type}数据失败:`, err);
      throw err;
    }
  }, [type, loadData]);

  // 同步数据
  const syncData = useCallback(async () => {
    try {
      setError(null);
      await loadData();
    } catch (err) {
      setError(err.message);
      console.error(`同步${type}数据失败:`, err);
      throw err;
    }
  }, [loadData]);

  // 导出数据
  const exportData = useCallback(() => {
    simpleDataManager.exportData(type);
  }, [type]);

  // 导入数据
  const importData = useCallback(async (file) => {
    try {
      setError(null);
      const importedData = await simpleDataManager.importData(type, file);
      setData(importedData);
      return importedData;
    } catch (err) {
      setError(err.message);
      console.error(`导入${type}数据失败:`, err);
      throw err;
    }
  }, [type]);

  // 获取存储统计
  const getStorageStats = useCallback(() => {
    return simpleDataManager.getStorageStats();
  }, []);

  // 初始化
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    loadData,
    saveData,
    deleteData,
    convertAndCleanup,
    convertAllData,
    autoCleanup,
    syncData,
    exportData,
    importData,
    getStorageStats
  };
};

// 专门的Hook用于不同类型的数据
export const useNotes = (options = {}) => useSimpleDataManager('notes', options);
export const useMusic = (options = {}) => useSimpleDataManager('music', options);
export const useWeather = (options = {}) => useSimpleDataManager('weather', options);
export const useDiagrams = (options = {}) => useSimpleDataManager('diagrams', options);

export default useSimpleDataManager;
