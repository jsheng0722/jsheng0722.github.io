/**
 * 统一数据管理器
 * 负责处理所有数据的存储、加载和同步
 */

class DataManager {
  constructor() {
    this.storageKeys = {
      notes: 'userNotes',
      music: 'userMusic',
      diagrams: 'userDiagrams',
      logs: 'userLogs'
    };
    
    this.filePaths = {
      notes: '/data/notes/',
      music: '/data/music/',
      diagrams: '/data/diagrams/',
      logs: '/data/logs/'
    };
  }

  /**
   * 生成唯一ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 获取当前日期字符串
   */
  getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * 保存数据到localStorage并生成文件
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
        // 更新现有数据
        updatedData = existingData.map(item => 
          item.id === data.id ? newData : item
        );
      } else {
        // 添加新数据
        updatedData = [...existingData, newData];
      }

      localStorage.setItem(this.storageKeys[type], JSON.stringify(updatedData));

      // 2. 生成文件并保存到服务器
      await this.generateFile(type, newData, options);

      // 3. 记录变更日志
      await this.logChange(type, newData, data.id ? 'update' : 'create');

      // 4. 如果启用立即转换，则转换并清理
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
   * 从localStorage加载数据
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
   * 从文件加载数据
   */
  async loadFromFiles(type) {
    try {
      const response = await fetch(`${this.filePaths[type]}index.json`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return [];
    } catch (error) {
      console.error(`从文件加载${type}数据失败:`, error);
      return [];
    }
  }

  /**
   * 合并localStorage和文件数据
   */
  async getMergedData(type) {
    const localData = this.getLocalData(type);
    const fileData = await this.loadFromFiles(type);
    
    // 合并数据，localStorage优先
    const mergedData = [...fileData];
    
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
   * 生成文件
   */
  async generateFile(type, data, options = {}) {
    const fileName = options.fileName || `${this.getCurrentDate()}-${data.id}.json`;
    const filePath = `${this.filePaths[type]}${fileName}`;
    
    try {
      // 这里应该调用后端API来保存文件
      // 由于是静态网站，我们使用一个模拟的保存方法
      await this.saveToServer(filePath, data);
      
      // 更新索引文件
      await this.updateIndex(type, data);
    } catch (error) {
      console.error(`生成${type}文件失败:`, error);
      throw error;
    }
  }

  /**
   * 保存到服务器（模拟）
   */
  async saveToServer(filePath, data) {
    // 在实际应用中，这里应该调用后端API
    // 现在我们先在localStorage中模拟
    const serverData = JSON.parse(localStorage.getItem('serverData') || '{}');
    serverData[filePath] = data;
    localStorage.setItem('serverData', JSON.stringify(serverData));
  }

  /**
   * 更新索引文件
   */
  async updateIndex(type, data) {
    const indexData = await this.loadFromFiles(type);
    const existingIndex = indexData.findIndex(item => item.id === data.id);
    
    if (existingIndex >= 0) {
      indexData[existingIndex] = {
        id: data.id,
        title: data.title || data.name || 'Untitled',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        category: data.category || type,
        tags: data.tags || []
      };
    } else {
      indexData.push({
        id: data.id,
        title: data.title || data.name || 'Untitled',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        category: data.category || type,
        tags: data.tags || []
      });
    }

    await this.saveToServer(`${this.filePaths[type]}index.json`, indexData);
  }

  /**
   * 记录变更日志
   */
  async logChange(type, data, action) {
    const logEntry = {
      id: this.generateId(),
      type,
      action,
      dataId: data.id,
      timestamp: new Date().toISOString(),
      changes: action === 'update' ? this.getChanges(type, data) : null
    };

    const logData = this.getLocalData('logs') || [];
    logData.push(logEntry);
    localStorage.setItem(this.storageKeys.logs, JSON.stringify(logData));

    // 保存到文件
    const logFileName = `${this.getCurrentDate()}-changes.json`;
    await this.saveToServer(`${this.filePaths.logs}${logFileName}`, logEntry);
  }

  /**
   * 获取变更详情
   */
  getChanges(type, newData) {
    // 这里可以实现更复杂的变更检测
    return {
      updatedFields: Object.keys(newData),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 删除数据
   */
  async deleteData(type, id) {
    try {
      // 从localStorage删除
      const localData = this.getLocalData(type);
      const updatedData = localData.filter(item => item.id !== id);
      localStorage.setItem(this.storageKeys[type], JSON.stringify(updatedData));

      // 记录删除日志
      await this.logChange(type, { id }, 'delete');

      return true;
    } catch (error) {
      console.error(`删除${type}数据失败:`, error);
      throw error;
    }
  }

  /**
   * 同步数据（从文件到localStorage）
   */
  async syncFromFiles(type) {
    try {
      const fileData = await this.loadFromFiles(type);
      localStorage.setItem(this.storageKeys[type], JSON.stringify(fileData));
      return fileData;
    } catch (error) {
      console.error(`同步${type}数据失败:`, error);
      return [];
    }
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
    a.download = `${type}-${this.getCurrentDate()}.json`;
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

  /**
   * 转换并清理数据（优化版）
   */
  async convertAndCleanup(type, data) {
    try {
      // 直接实现，避免动态导入
      const fileName = this.generateFileName(type, data);
      const fileData = {
        type,
        data,
        generatedAt: new Date().toISOString()
      };
      
      // 保存到服务器
      await this.saveToServer(fileName, fileData);
      
      // 从localStorage删除
      this.removeFromLocalStorage(type, data.id);
      
      console.log(`${type}数据已转换并清理:`, data.title || data.name);
      return { success: true, fileName };
    } catch (error) {
      console.error(`转换并清理${type}数据失败:`, error);
      throw error;
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
   * 保存到服务器（优化版）
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
   * 立即转换所有数据（优化版）
   */
  async convertAllData(type) {
    try {
      const localData = this.getLocalData(type);
      const results = [];
      
      for (const data of localData) {
        try {
          const result = await this.convertAndCleanup(type, data);
          results.push({ data, result });
        } catch (error) {
          results.push({ data, result: { success: false, error: error.message } });
        }
      }
      
      return {
        success: true,
        message: `转换完成：${results.length}条数据`,
        results
      };
    } catch (error) {
      console.error(`转换所有${type}数据失败:`, error);
      throw error;
    }
  }

  /**
   * 清理已转换的数据（优化版）
   */
  async cleanupConvertedData(type) {
    try {
      const localData = this.getLocalData(type) || [];
      const serverData = await this.getServerData(type);
      const serverIds = new Set(serverData.map(item => item.id));
      
      // 清理已转换的数据
      const toKeep = localData.filter(item => !serverIds.has(item.id));
      
      if (toKeep.length !== localData.length) {
        localStorage.setItem(this.storageKeys[type], JSON.stringify(toKeep));
        console.log(`${type}清理完成：删除了${localData.length - toKeep.length}条已转换数据`);
      }
      
      return { success: true, message: '清理完成' };
    } catch (error) {
      console.error(`清理${type}数据失败:`, error);
      throw error;
    }
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
   * 获取存储统计（优化版）
   */
  getStorageStats() {
    const stats = {};
    const serverData = JSON.parse(localStorage.getItem('serverData') || '{}');
    
    for (const type of Object.keys(this.storageKeys)) {
      const localData = this.getLocalData(type) || [];
      const fileCount = Object.values(serverData).filter(item => item.type === type).length;
      
      stats[type] = {
        localCount: localData.length,
        fileCount: fileCount,
        totalSize: JSON.stringify(localData).length,
        lastUpdated: localData.length > 0 ? 
          Math.max(...localData.map(item => new Date(item.updatedAt || item.createdAt).getTime())) : null
      };
    }
    
    return stats;
  }
}

// 创建全局实例
const dataManager = new DataManager();

export default dataManager;
