/**
 * 文件生成器
 * 负责根据数据自动生成相应的文件
 */

import dataManager from './DataManager';

class FileGenerator {
  constructor() {
    this.templates = {
      note: this.generateNoteTemplate,
      music: this.generateMusicTemplate,
      weather: this.generateWeatherTemplate,
      diagram: this.generateDiagramTemplate
    };
  }

  /**
   * 生成笔记文件
   */
  generateNoteTemplate(data) {
    const frontmatter = `---
id: ${data.id}
title: "${data.title || 'Untitled'}"
author: "${data.author || 'User'}"
date: "${data.date || new Date().toISOString().split('T')[0]}"
category: "${data.category || 'general'}"
tags: [${(data.tags || []).map(tag => `"${tag}"`).join(', ')}]
difficulty: "${data.difficulty || ''}"
readTime: "${data.readTime || ''}"
---`;

    const content = data.content || '';
    
    return {
      markdown: `${frontmatter}\n\n${content}`,
      json: {
        id: data.id,
        title: data.title,
        author: data.author,
        date: data.date,
        category: data.category,
        tags: data.tags || [],
        difficulty: data.difficulty,
        readTime: data.readTime,
        content: content,
        excerpt: this.generateExcerpt(content),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      }
    };
  }

  /**
   * 生成音乐文件
   */
  generateMusicTemplate(data) {
    return {
      json: {
        id: data.id,
        title: data.title,
        artist: data.artist,
        album: data.album,
        genre: data.genre,
        year: data.year,
        duration: data.duration,
        filePath: data.filePath,
        coverImage: data.coverImage,
        lyrics: data.lyrics,
        playlist: data.playlist,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      }
    };
  }

  /**
   * 生成天气文件
   */
  generateWeatherTemplate(data) {
    return {
      json: {
        id: data.id,
        location: data.location,
        date: data.date,
        temperature: data.temperature,
        condition: data.condition,
        humidity: data.humidity,
        windSpeed: data.windSpeed,
        pressure: data.pressure,
        forecast: data.forecast,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      }
    };
  }

  /**
   * 生成图形文件
   */
  generateDiagramTemplate(data) {
    return {
      json: {
        id: data.id,
        title: data.title,
        type: data.type, // 'flowchart', 'mindmap', 'sequence'
        nodes: data.nodes || [],
        edges: data.edges || [],
        metadata: data.metadata || {},
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      }
    };
  }

  /**
   * 生成摘要
   */
  generateExcerpt(content, maxLength = 150) {
    if (!content) return '';
    
    // 移除Markdown标记
    const plainText = content
      .replace(/#{1,6}\s+/g, '') // 移除标题标记
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
      .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
      .replace(/`(.*?)`/g, '$1') // 移除代码标记
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接标记
      .replace(/\n+/g, ' ') // 替换换行为空格
      .trim();
    
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  }

  /**
   * 生成文件
   */
  async generateFile(type, data, options = {}) {
    try {
      const template = this.templates[type];
      if (!template) {
        throw new Error(`未知的文件类型: ${type}`);
      }

      const generated = template(data);
      const fileName = this.generateFileName(type, data, options);
      
      // 生成文件内容
      const fileContent = {
        type,
        fileName,
        data: generated.json,
        generatedAt: new Date().toISOString(),
        version: '1.0'
      };

      // 保存到服务器（模拟）
      await this.saveToServer(type, fileName, fileContent);

      return {
        success: true,
        fileName,
        filePath: `${dataManager.filePaths[type]}${fileName}`,
        content: fileContent
      };
    } catch (error) {
      console.error(`生成${type}文件失败:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 生成文件名
   */
  generateFileName(type, data, options = {}) {
    const date = new Date().toISOString().split('T')[0];
    const id = data.id || dataManager.generateId();
    const title = (data.title || data.name || 'untitled')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 20);
    
    switch (type) {
      case 'note':
        return `${date}-${title}-${id}.json`;
      case 'music':
        return `track-${id}.json`;
      case 'weather':
        return `${date}-${data.location || 'weather'}.json`;
      case 'diagram':
        return `${date}-${title}-${id}.json`;
      default:
        return `${date}-${type}-${id}.json`;
    }
  }

  /**
   * 保存到服务器（模拟）
   */
  async saveToServer(type, fileName, content) {
    // 在实际应用中，这里应该调用后端API
    // 现在我们在localStorage中模拟文件存储
    const serverFiles = JSON.parse(localStorage.getItem('serverFiles') || '{}');
    const filePath = `${dataManager.filePaths[type]}${fileName}`;
    serverFiles[filePath] = content;
    localStorage.setItem('serverFiles', JSON.stringify(serverFiles));
    
    // 更新索引
    await this.updateIndex(type, content);
  }

  /**
   * 更新索引文件
   */
  async updateIndex(type, content) {
    const indexData = await this.loadIndex(type);
    const existingIndex = indexData.findIndex(item => item.id === content.data.id);
    
    const indexEntry = {
      id: content.data.id,
      title: content.data.title || content.data.name || 'Untitled',
      fileName: content.fileName,
      createdAt: content.data.createdAt,
      updatedAt: content.data.updatedAt,
      category: content.data.category || type,
      tags: content.data.tags || []
    };
    
    if (existingIndex >= 0) {
      indexData[existingIndex] = indexEntry;
    } else {
      indexData.push(indexEntry);
    }
    
    await this.saveIndex(type, indexData);
  }

  /**
   * 加载索引文件
   */
  async loadIndex(type) {
    try {
      const serverFiles = JSON.parse(localStorage.getItem('serverFiles') || '{}');
      const indexPath = `${dataManager.filePaths[type]}index.json`;
      return serverFiles[indexPath] || [];
    } catch (error) {
      console.error(`加载${type}索引失败:`, error);
      return [];
    }
  }

  /**
   * 保存索引文件
   */
  async saveIndex(type, indexData) {
    const serverFiles = JSON.parse(localStorage.getItem('serverFiles') || '{}');
    const indexPath = `${dataManager.filePaths[type]}index.json`;
    serverFiles[indexPath] = indexData;
    localStorage.setItem('serverFiles', JSON.stringify(serverFiles));
  }

  /**
   * 批量生成文件
   */
  async batchGenerate(type, dataList, options = {}) {
    const results = [];
    
    for (const data of dataList) {
      try {
        const result = await this.generateFile(type, data, options);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          data
        });
      }
    }
    
    return results;
  }

  /**
   * 生成备份文件
   */
  async generateBackup(type, options = {}) {
    try {
      const data = dataManager.getLocalData(type);
      const backupData = {
        type,
        data,
        generatedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const fileName = `backup-${type}-${new Date().toISOString().split('T')[0]}.json`;
      await this.saveToServer('backup', fileName, backupData);
      
      return {
        success: true,
        fileName,
        dataCount: data.length
      };
    } catch (error) {
      console.error(`生成${type}备份失败:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// 创建全局实例
const fileGenerator = new FileGenerator();

export default fileGenerator;
