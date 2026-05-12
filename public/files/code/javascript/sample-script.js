/**
 * JavaScript 示例文件
 * 存储位置: /files/code/javascript/sample-script.js
 */

class FileStorage {
  constructor() {
    this.basePath = '/files';
    this.categories = ['documents', 'media', 'code', 'data'];
  }

  /**
   * 获取文件路径
   * @param {string} category - 文件分类
   * @param {string} filename - 文件名
   * @returns {string} 完整路径
   */
  getFilePath(category, filename) {
    return `${this.basePath}/${category}/${filename}`;
  }

  /**
   * 列出所有分类
   * @returns {string[]} 分类列表
   */
  listCategories() {
    return this.categories;
  }

  /**
   * 验证文件类型
   * @param {string} filename - 文件名
   * @returns {boolean} 是否有效
   */
  isValidFile(filename) {
    const validExtensions = [
      '.md', '.pdf', '.docx', '.xlsx',
      '.jpg', '.png', '.mp3', '.mp4',
      '.js', '.py', '.json', '.csv'
    ];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return validExtensions.includes(ext);
  }
}

export default FileStorage;
