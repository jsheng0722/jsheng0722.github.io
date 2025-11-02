/**
 * 存储清理管理器
 * 负责清理已转换为文件的localStorage数据
 */

import dataManager from './DataManager';
import fileGenerator from './FileGenerator';

class StorageCleanupManager {
  constructor() {
    this.cleanupRules = {
      notes: {
        keepDays: 7,        // 保留7天
        maxItems: 50,       // 最多保留50条
        autoCleanup: true    // 自动清理
      },
      music: {
        keepDays: 30,       // 保留30天
        maxItems: 100,      // 最多保留100条
        autoCleanup: true
      },
      weather: {
        keepDays: 3,        // 保留3天
        maxItems: 20,       // 最多保留20条
        autoCleanup: true
      },
      diagrams: {
        keepDays: 14,       // 保留14天
        maxItems: 30,       // 最多保留30条
        autoCleanup: true
      }
    };
    
    this.cleanupInterval = 24 * 60 * 60 * 1000; // 24小时检查一次
    this.cleanupTimer = null;
  }

  /**
   * 启动自动清理
   */
  startAutoCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.cleanupInterval);
    
    console.log('存储清理器已启动');
  }

  /**
   * 停止自动清理
   */
  stopAutoCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    console.log('存储清理器已停止');
  }

  /**
   * 执行清理
   */
  async performCleanup() {
    console.log('开始执行存储清理...');
    
    for (const [type, rules] of Object.entries(this.cleanupRules)) {
      if (rules.autoCleanup) {
        await this.cleanupType(type, rules);
      }
    }
    
    console.log('存储清理完成');
  }

  /**
   * 清理特定类型的数据
   */
  async cleanupType(type, rules) {
    try {
      const localData = dataManager.getLocalData(type) || [];
      const fileData = await dataManager.loadFromFiles(type);
      
      // 获取已转换为文件的数据ID
      const fileIds = new Set(fileData.map(item => item.id));
      
      // 过滤出需要清理的数据
      const toCleanup = localData.filter(item => {
        const isInFile = fileIds.has(item.id);
        const isOld = this.isOldData(item, rules.keepDays);
        const isOverLimit = localData.length > rules.maxItems;
        
        return isInFile || isOld || isOverLimit;
      });
      
      if (toCleanup.length > 0) {
        // 保留未转换且较新的数据
        const toKeep = localData.filter(item => {
          const isInFile = fileIds.has(item.id);
          const isOld = this.isOldData(item, rules.keepDays);
          const isOverLimit = localData.length > rules.maxItems;
          
          return !isInFile && !isOld && !isOverLimit;
        });
        
        // 更新localStorage
        localStorage.setItem(dataManager.storageKeys[type], JSON.stringify(toKeep));
        
        console.log(`清理${type}数据：删除了${toCleanup.length}条，保留了${toKeep.length}条`);
        
        // 记录清理日志
        await this.logCleanup(type, toCleanup.length, toKeep.length);
      }
    } catch (error) {
      console.error(`清理${type}数据失败:`, error);
    }
  }

  /**
   * 检查数据是否过期
   */
  isOldData(item, keepDays) {
    const itemDate = new Date(item.updatedAt || item.createdAt);
    const cutoffDate = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000);
    return itemDate < cutoffDate;
  }

  /**
   * 记录清理日志
   */
  async logCleanup(type, deletedCount, keptCount) {
    const logEntry = {
      type,
      deletedCount,
      keptCount,
      timestamp: new Date().toISOString(),
      action: 'cleanup'
    };
    
    const logs = dataManager.getLocalData('logs') || [];
    logs.push(logEntry);
    localStorage.setItem(dataManager.storageKeys.logs, JSON.stringify(logs));
  }

  /**
   * 立即转换并清理
   */
  async convertAndCleanup(type, data) {
    try {
      // 1. 生成文件
      const result = await fileGenerator.generateFile(type, data);
      
      if (result.success) {
        // 2. 从localStorage中删除已转换的数据
        const localData = dataManager.getLocalData(type) || [];
        const updatedData = localData.filter(item => item.id !== data.id);
        localStorage.setItem(dataManager.storageKeys[type], JSON.stringify(updatedData));
        
        console.log(`${type}数据已转换并清理：${data.title || data.name}`);
        return { success: true, message: '数据已转换并清理' };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`转换并清理${type}数据失败:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 批量转换并清理
   */
  async batchConvertAndCleanup(type, dataList) {
    const results = [];
    
    for (const data of dataList) {
      try {
        const result = await this.convertAndCleanup(type, data);
        results.push({ data, result });
      } catch (error) {
        results.push({ data, result: { success: false, error: error.message } });
      }
    }
    
    return results;
  }

  /**
   * 获取存储统计信息
   */
  getStorageStats() {
    const stats = {};
    
    for (const type of Object.keys(this.cleanupRules)) {
      const localData = dataManager.getLocalData(type) || [];
      const fileData = dataManager.getLocalData('serverFiles') || {};
      
      stats[type] = {
        localCount: localData.length,
        fileCount: Object.keys(fileData).filter(key => key.includes(`/${type}/`)).length,
        totalSize: this.calculateSize(localData),
        oldestItem: this.getOldestItem(localData),
        newestItem: this.getNewestItem(localData)
      };
    }
    
    return stats;
  }

  /**
   * 计算数据大小
   */
  calculateSize(data) {
    return JSON.stringify(data).length;
  }

  /**
   * 获取最旧的数据
   */
  getOldestItem(data) {
    if (data.length === 0) return null;
    
    return data.reduce((oldest, current) => {
      const oldestDate = new Date(oldest.updatedAt || oldest.createdAt);
      const currentDate = new Date(current.updatedAt || current.createdAt);
      return currentDate < oldestDate ? current : oldest;
    });
  }

  /**
   * 获取最新的数据
   */
  getNewestItem(data) {
    if (data.length === 0) return null;
    
    return data.reduce((newest, current) => {
      const newestDate = new Date(newest.updatedAt || newest.createdAt);
      const currentDate = new Date(current.updatedAt || current.createdAt);
      return currentDate > newestDate ? current : newest;
    });
  }

  /**
   * 手动清理所有数据
   */
  async manualCleanupAll() {
    console.log('开始手动清理所有数据...');
    
    for (const type of Object.keys(this.cleanupRules)) {
      await this.cleanupType(type, this.cleanupRules[type]);
    }
    
    console.log('手动清理完成');
  }

  /**
   * 清理特定类型的所有数据
   */
  async manualCleanupType(type) {
    console.log(`开始清理${type}数据...`);
    
    const rules = this.cleanupRules[type];
    if (rules) {
      await this.cleanupType(type, rules);
    }
    
    console.log(`${type}数据清理完成`);
  }

  /**
   * 设置清理规则
   */
  setCleanupRules(type, rules) {
    if (this.cleanupRules[type]) {
      this.cleanupRules[type] = { ...this.cleanupRules[type], ...rules };
      console.log(`${type}清理规则已更新:`, this.cleanupRules[type]);
    }
  }

  /**
   * 获取清理规则
   */
  getCleanupRules(type) {
    return this.cleanupRules[type] || null;
  }

  /**
   * 销毁清理器
   */
  destroy() {
    this.stopAutoCleanup();
  }
}

// 创建全局实例
const storageCleanupManager = new StorageCleanupManager();

export default storageCleanupManager;
