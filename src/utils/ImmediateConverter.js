/**
 * 立即转换器
 * 负责将localStorage数据立即转换为文件
 */

import dataManager from './DataManager';
import fileGenerator from './FileGenerator';
import storageCleanupManager from './StorageCleanupManager';

class ImmediateConverter {
  constructor() {
    this.conversionQueue = [];
    this.isProcessing = false;
    this.conversionCallbacks = new Map();
  }

  /**
   * 立即转换数据
   */
  async convertImmediately(type, data, options = {}) {
    try {
      console.log(`开始立即转换${type}数据:`, data.title || data.name);
      
      // 1. 生成文件
      const fileResult = await fileGenerator.generateFile(type, data, options);
      
      if (fileResult.success) {
        // 2. 从localStorage中删除已转换的数据
        await this.removeFromLocalStorage(type, data.id);
        
        // 3. 记录转换日志
        await this.logConversion(type, data, fileResult);
        
        console.log(`${type}数据转换成功:`, fileResult.fileName);
        
        return {
          success: true,
          fileName: fileResult.fileName,
          filePath: fileResult.filePath,
          message: '数据已立即转换为文件'
        };
      } else {
        throw new Error(fileResult.error);
      }
    } catch (error) {
      console.error(`立即转换${type}数据失败:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 批量立即转换
   */
  async batchConvertImmediately(type, dataList, options = {}) {
    console.log(`开始批量转换${type}数据，共${dataList.length}条`);
    
    const results = [];
    const successful = [];
    const failed = [];
    
    for (const data of dataList) {
      try {
        const result = await this.convertImmediately(type, data, options);
        
        if (result.success) {
          successful.push({ data, result });
        } else {
          failed.push({ data, result });
        }
        
        results.push({ data, result });
      } catch (error) {
        const errorResult = { success: false, error: error.message };
        failed.push({ data, result: errorResult });
        results.push({ data, result: errorResult });
      }
    }
    
    console.log(`批量转换完成：成功${successful.length}条，失败${failed.length}条`);
    
    return {
      results,
      successful,
      failed,
      summary: {
        total: dataList.length,
        successful: successful.length,
        failed: failed.length
      }
    };
  }

  /**
   * 转换所有localStorage数据
   */
  async convertAllLocalData(type, options = {}) {
    const localData = dataManager.getLocalData(type) || [];
    
    if (localData.length === 0) {
      return {
        success: true,
        message: '没有需要转换的数据',
        converted: 0
      };
    }
    
    console.log(`开始转换所有${type}数据，共${localData.length}条`);
    
    const result = await this.batchConvertImmediately(type, localData, options);
    
    return {
      success: true,
      message: `转换完成：成功${result.summary.successful}条，失败${result.summary.failed}条`,
      converted: result.summary.successful,
      details: result
    };
  }

  /**
   * 从localStorage中删除数据
   */
  async removeFromLocalStorage(type, id) {
    try {
      const localData = dataManager.getLocalData(type) || [];
      const updatedData = localData.filter(item => item.id !== id);
      localStorage.setItem(dataManager.storageKeys[type], JSON.stringify(updatedData));
      
      console.log(`已从localStorage删除${type}数据:`, id);
    } catch (error) {
      console.error(`从localStorage删除${type}数据失败:`, error);
      throw error;
    }
  }

  /**
   * 记录转换日志
   */
  async logConversion(type, data, fileResult) {
    const logEntry = {
      id: dataManager.generateId(),
      type,
      action: 'convert',
      dataId: data.id,
      fileName: fileResult.fileName,
      filePath: fileResult.filePath,
      timestamp: new Date().toISOString(),
      dataTitle: data.title || data.name || 'Untitled'
    };
    
    const logs = dataManager.getLocalData('logs') || [];
    logs.push(logEntry);
    localStorage.setItem(dataManager.storageKeys.logs, JSON.stringify(logs));
  }

  /**
   * 智能转换（根据数据重要性决定是否立即转换）
   */
  async smartConvert(type, data, options = {}) {
    const importance = this.calculateImportance(data);
    const shouldConvert = this.shouldConvertImmediately(importance, options);
    
    if (shouldConvert) {
      return await this.convertImmediately(type, data, options);
    } else {
      // 标记为待转换
      await this.markForConversion(type, data);
      return {
        success: true,
        message: '数据已标记为待转换',
        converted: false
      };
    }
  }

  /**
   * 计算数据重要性
   */
  calculateImportance(data) {
    let score = 0;
    
    // 基于标题长度
    if (data.title && data.title.length > 10) score += 1;
    
    // 基于内容长度
    if (data.content && data.content.length > 100) score += 2;
    
    // 基于标签数量
    if (data.tags && data.tags.length > 0) score += data.tags.length;
    
    // 基于分类
    const importantCategories = ['算法', '重要', '工作'];
    if (data.category && importantCategories.includes(data.category)) score += 3;
    
    // 基于创建时间（越新越重要）
    const daysSinceCreation = (Date.now() - new Date(data.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 1) score += 2;
    else if (daysSinceCreation < 7) score += 1;
    
    return score;
  }

  /**
   * 判断是否应该立即转换
   */
  shouldConvertImmediately(importance, options = {}) {
    const threshold = options.importanceThreshold || 3;
    const forceConvert = options.forceConvert || false;
    
    return forceConvert || importance >= threshold;
  }

  /**
   * 标记为待转换
   */
  async markForConversion(type, data) {
    const pendingConversions = dataManager.getLocalData('pendingConversions') || [];
    pendingConversions.push({
      type,
      data,
      timestamp: new Date().toISOString(),
      importance: this.calculateImportance(data)
    });
    
    localStorage.setItem('pendingConversions', JSON.stringify(pendingConversions));
  }

  /**
   * 处理待转换队列
   */
  async processPendingConversions() {
    const pendingConversions = dataManager.getLocalData('pendingConversions') || [];
    
    if (pendingConversions.length === 0) {
      return { success: true, message: '没有待转换的数据' };
    }
    
    console.log(`开始处理${pendingConversions.length}条待转换数据`);
    
    const results = [];
    
    for (const pending of pendingConversions) {
      try {
        const result = await this.convertImmediately(pending.type, pending.data);
        results.push({ pending, result });
      } catch (error) {
        results.push({ pending, result: { success: false, error: error.message } });
      }
    }
    
    // 清空待转换队列
    localStorage.removeItem('pendingConversions');
    
    return {
      success: true,
      message: `处理完成，共${results.length}条数据`,
      results
    };
  }

  /**
   * 获取转换统计
   */
  getConversionStats() {
    const logs = dataManager.getLocalData('logs') || [];
    const conversions = logs.filter(log => log.action === 'convert');
    
    const stats = {
      total: conversions.length,
      byType: {},
      recent: conversions.filter(log => 
        new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length
    };
    
    conversions.forEach(conversion => {
      stats.byType[conversion.type] = (stats.byType[conversion.type] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * 设置转换规则
   */
  setConversionRules(rules) {
    localStorage.setItem('conversionRules', JSON.stringify(rules));
  }

  /**
   * 获取转换规则
   */
  getConversionRules() {
    return JSON.parse(localStorage.getItem('conversionRules') || '{}');
  }

  /**
   * 清理转换日志
   */
  async cleanupConversionLogs(daysToKeep = 30) {
    const logs = dataManager.getLocalData('logs') || [];
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const filteredLogs = logs.filter(log => 
      new Date(log.timestamp) > cutoffDate
    );
    
    localStorage.setItem(dataManager.storageKeys.logs, JSON.stringify(filteredLogs));
    
    console.log(`清理转换日志：删除了${logs.length - filteredLogs.length}条旧日志`);
  }
}

// 创建全局实例
const immediateConverter = new ImmediateConverter();

export default immediateConverter;
