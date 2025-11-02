/**
 * 简化版数据管理器
 * 整合所有功能，减少复杂度
 */

class SimpleDataManager {
  constructor() {
    this.storageKeys = {
      notes: 'userNotes',
      music: 'userMusic', 
      weather: 'userWeather',
      diagrams: 'userDiagrams'
    };
    
    // 简化的清理规则
    this.cleanupRules = {
      keepDays: 7,        // 统一保留7天
      maxItems: 100,      // 统一最大100条
      autoCleanup: true   // 统一自动清理
    };
  }

  /**
   * 生成唯一ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 保存数据（核心功能）
   */
  async saveData(type, data, options = {}) {
    try {
      // 1. 保存到localStorage
      const existingData = this.getLocalData(type) || [];
      const newData = {
        id: data.id || this.generateId(),
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let updatedData;
      if (data.id && existingData.find(item => item.id === data.id)) {
        updatedData = existingData.map(item => 
          item.id === data.id ? newData : item
        );
      } else {
        updatedData = [...existingData, newData];
      }

      localStorage.setItem(this.storageKeys[type], JSON.stringify(updatedData));

      // 2. 如果启用立即转换，则转换并清理
      if (options.immediateConvert) {
        await this.convertAndCleanup(type, newData);
      }

      return newData;
    } catch (error) {
      console.error(`保存${type}数据失败:`, error);
      throw error;
    }
  }

  /**
   * 转换并清理（简化版）
   */
  async convertAndCleanup(type, data) {
    try {
      // 1. 生成文件（简化版）
      const fileName = this.generateFileName(type, data);
      const fileData = {
        type,
        data,
        generatedAt: new Date().toISOString()
      };
      
      // 模拟保存到服务器
      await this.saveToServer(fileName, fileData);
      
      // 2. 从localStorage删除
      this.removeFromLocalStorage(type, data.id);
      
      console.log(`${type}数据已转换并清理:`, data.title || data.name);
      return { success: true, fileName };
    } catch (error) {
      console.error(`转换${type}数据失败:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 生成文件名
   */
  generateFileName(type, data) {
    const date = new Date().toISOString().split('T')[0];
    const title = (data.title || data.name || 'untitled')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 20);
    return `${date}-${title}-${data.id}.json`;
  }

  /**
   * 保存到服务器（模拟）
   */
  async saveToServer(fileName, data) {
    const serverData = JSON.parse(localStorage.getItem('serverData') || '{}');
    serverData[fileName] = data;
    localStorage.setItem('serverData', JSON.stringify(serverData));
  }

  /**
   * 从localStorage删除数据
   */
  removeFromLocalStorage(type, id) {
    const localData = this.getLocalData(type) || [];
    const updatedData = localData.filter(item => item.id !== id);
    localStorage.setItem(this.storageKeys[type], JSON.stringify(updatedData));
  }

  /**
   * 获取本地数据
   */
  getLocalData(type) {
    try {
      const data = localStorage.getItem(this.storageKeys[type]);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`加载${type}数据失败:`, error);
      return [];
    }
  }

  /**
   * 获取合并数据
   */
  async getMergedData(type) {
    const localData = this.getLocalData(type);
    const serverData = await this.getServerData(type);
    
    // 合并数据，localStorage优先
    const mergedData = [...serverData];
    
    localData.forEach(localItem => {
      const existingIndex = mergedData.findIndex(item => item.id === localItem.id);
      if (existingIndex >= 0) {
        mergedData[existingIndex] = localItem;
      } else {
        mergedData.push(localItem);
      }
    });

    return mergedData;
  }

  /**
   * 获取服务器数据
   */
  async getServerData(type) {
    try {
      const serverData = JSON.parse(localStorage.getItem('serverData') || '{}');
      return Object.values(serverData)
        .filter(item => item.type === type)
        .map(item => item.data);
    } catch (error) {
      console.error(`加载${type}服务器数据失败:`, error);
      return [];
    }
  }

  /**
   * 删除数据
   */
  async deleteData(type, id) {
    try {
      this.removeFromLocalStorage(type, id);
      return true;
    } catch (error) {
      console.error(`删除${type}数据失败:`, error);
      throw error;
    }
  }

  /**
   * 自动清理（简化版）
   */
  async autoCleanup(type) {
    try {
      const localData = this.getLocalData(type) || [];
      const serverData = await this.getServerData(type);
      const serverIds = new Set(serverData.map(item => item.id));
      
      // 清理已转换的数据
      const toKeep = localData.filter(item => {
        const isConverted = serverIds.has(item.id);
        const isOld = this.isOldData(item, this.cleanupRules.keepDays);
        const isOverLimit = localData.length > this.cleanupRules.maxItems;
        
        return !isConverted && !isOld && !isOverLimit;
      });
      
      if (toKeep.length !== localData.length) {
        localStorage.setItem(this.storageKeys[type], JSON.stringify(toKeep));
        console.log(`${type}自动清理完成：删除了${localData.length - toKeep.length}条数据`);
      }
    } catch (error) {
      console.error(`${type}自动清理失败:`, error);
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
   * 批量转换所有数据
   */
  async convertAllData(type) {
    try {
      const localData = this.getLocalData(type);
      const results = [];
      
      for (const data of localData) {
        const result = await this.convertAndCleanup(type, data);
        results.push({ data, result });
      }
      
      return {
        success: true,
        message: `转换完成：${results.length}条数据`,
        results
      };
    } catch (error) {
      console.error(`批量转换${type}数据失败:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取存储统计
   */
  getStorageStats() {
    const stats = {};
    
    for (const type of Object.keys(this.storageKeys)) {
      const localData = this.getLocalData(type);
      const serverData = JSON.parse(localStorage.getItem('serverData') || '{}');
      const fileCount = Object.values(serverData).filter(item => item.type === type).length;
      
      stats[type] = {
        localCount: localData.length,
        fileCount: fileCount,
        totalSize: JSON.stringify(localData).length
      };
    }
    
    return stats;
  }

  /**
   * 导出数据
   */
  exportData(type) {
    const data = this.getLocalData(type);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 导入数据
   */
  async importData(type, file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (Array.isArray(data)) {
        const existingData = this.getLocalData(type);
        const mergedData = [...existingData, ...data];
        localStorage.setItem(this.storageKeys[type], JSON.stringify(mergedData));
        return mergedData;
      }
      
      throw new Error('Invalid data format');
    } catch (error) {
      console.error(`导入${type}数据失败:`, error);
      throw error;
    }
  }
}

// 创建全局实例
const simpleDataManager = new SimpleDataManager();

export default simpleDataManager;
