/**
 * 自动保存管理器
 * 负责处理数据的自动保存和同步
 */

import dataManager from './DataManager';

class AutoSaveManager {
  constructor() {
    this.saveIntervals = new Map();
    this.debounceTimers = new Map();
    this.isOnline = navigator.onLine;
    
    // 监听网络状态变化
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncAllData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * 启用自动保存
   */
  enableAutoSave(type, data, options = {}) {
    const interval = options.interval || 30000; // 默认30秒
    const debounce = options.debounce || 2000; // 默认2秒防抖
    
    // 清除现有的定时器
    this.disableAutoSave(type);
    
    // 设置防抖保存
    this.setupDebouncedSave(type, data, debounce);
    
    // 设置定时保存
    const timerId = setInterval(async () => {
      try {
        await this.saveData(type, data, options);
        console.log(`${type} 数据已自动保存`);
      } catch (error) {
        console.error(`${type} 自动保存失败:`, error);
      }
    }, interval);
    
    this.saveIntervals.set(type, timerId);
  }

  /**
   * 禁用自动保存
   */
  disableAutoSave(type) {
    const timerId = this.saveIntervals.get(type);
    if (timerId) {
      clearInterval(timerId);
      this.saveIntervals.delete(type);
    }
    
    const debounceTimer = this.debounceTimers.get(type);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      this.debounceTimers.delete(type);
    }
  }

  /**
   * 设置防抖保存
   */
  setupDebouncedSave(type, data, debounce) {
    return (newData) => {
      // 清除之前的定时器
      const existingTimer = this.debounceTimers.get(type);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      
      // 设置新的定时器
      const timerId = setTimeout(async () => {
        try {
          await this.saveData(type, newData || data);
          console.log(`${type} 数据已防抖保存`);
        } catch (error) {
          console.error(`${type} 防抖保存失败:`, error);
        }
      }, debounce);
      
      this.debounceTimers.set(type, timerId);
    };
  }

  /**
   * 保存数据（优化版）
   */
  async saveData(type, data, options = {}) {
    try {
      // 简化逻辑：直接使用dataManager保存
      await dataManager.saveData(type, data, options);
    } catch (error) {
      console.error(`保存${type}数据失败:`, error);
      // 保存失败时，至少保存到localStorage
      this.saveToLocalStorage(type, data);
    }
  }

  /**
   * 合并数据
   */
  mergeData(existingData, newData) {
    if (newData.id) {
      const index = existingData.findIndex(item => item.id === newData.id);
      if (index >= 0) {
        existingData[index] = { ...existingData[index], ...newData };
      } else {
        existingData.push(newData);
      }
    } else {
      existingData.push({ ...newData, id: dataManager.generateId() });
    }
    return existingData;
  }

  /**
   * 保存到localStorage
   */
  saveToLocalStorage(type, data) {
    try {
      const existingData = dataManager.getLocalData(type) || [];
      const updatedData = this.mergeData(existingData, data);
      localStorage.setItem(dataManager.storageKeys[type], JSON.stringify(updatedData));
    } catch (error) {
      console.error(`保存到localStorage失败:`, error);
    }
  }

  /**
   * 标记为待同步
   */
  markForSync(type, data) {
    const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]');
    pendingSync.push({
      type,
      data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('pendingSync', JSON.stringify(pendingSync));
  }

  /**
   * 同步所有待同步数据（优化版）
   */
  async syncAllData() {
    try {
      const pendingSync = JSON.parse(localStorage.getItem('pendingSync') || '[]');
      
      if (pendingSync.length === 0) return;
      
      // 批量同步，减少循环
      const syncPromises = pendingSync.map(item => 
        dataManager.saveData(item.type, item.data).catch(error => {
          console.error(`同步${item.type}数据失败:`, error);
          return { error: true, type: item.type };
        })
      );
      
      await Promise.all(syncPromises);
      
      // 清空待同步数据
      localStorage.removeItem('pendingSync');
      console.log(`同步完成：${pendingSync.length}条数据`);
    } catch (error) {
      console.error('同步数据失败:', error);
    }
  }

  /**
   * 获取保存状态
   */
  getSaveStatus(type) {
    const lastSaved = localStorage.getItem(`lastSaved_${type}`);
    const hasUnsavedChanges = localStorage.getItem(`unsavedChanges_${type}`);
    
    return {
      lastSaved: lastSaved ? new Date(lastSaved) : null,
      hasUnsavedChanges: hasUnsavedChanges === 'true',
      isOnline: this.isOnline
    };
  }

  /**
   * 设置保存状态
   */
  setSaveStatus(type, saved = true) {
    if (saved) {
      localStorage.setItem(`lastSaved_${type}`, new Date().toISOString());
      localStorage.removeItem(`unsavedChanges_${type}`);
    } else {
      localStorage.setItem(`unsavedChanges_${type}`, 'true');
    }
  }

  /**
   * 清理所有定时器
   */
  cleanup() {
    this.saveIntervals.forEach(timerId => clearInterval(timerId));
    this.debounceTimers.forEach(timerId => clearTimeout(timerId));
    this.saveIntervals.clear();
    this.debounceTimers.clear();
  }
}

// 创建全局实例
const autoSaveManager = new AutoSaveManager();

export default autoSaveManager;
