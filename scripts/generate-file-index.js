/**
 * 文件索引生成器
 * 用于扫描 public/files 目录并生成 metadata/file-index.json
 * 
 * 注意：这个脚本需要在 Node.js 环境中运行（如构建脚本）
 * 由于浏览器无法访问文件系统，这部分功能需要在构建时执行
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// 文件类型映射
const FILE_TYPE_MAP = {
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.json': 'json',
  '.txt': 'text',
  '.pdf': 'pdf',
  '.docx': 'docx',
  '.doc': 'doc',
  '.xlsx': 'excel',
  '.xls': 'excel',
  '.csv': 'csv',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.gif': 'image',
  '.svg': 'image',
  '.webp': 'image',
  '.mp3': 'audio',
  '.wav': 'audio',
  '.ogg': 'audio',
  '.mp4': 'video',
  '.avi': 'video',
  '.mov': 'video',
  '.webm': 'video',
  '.js': 'code',
  '.ts': 'code',
  '.jsx': 'code',
  '.tsx': 'code',
  '.py': 'code',
  '.java': 'code',
  '.cpp': 'code',
  '.c': 'code',
  '.h': 'code',
  '.css': 'code',
  '.scss': 'code',
  '.sass': 'code',
  '.less': 'code',
  '.html': 'html',
  '.xml': 'xml',
  '.yaml': 'yaml',
  '.yml': 'yaml'
};

// 获取文件扩展名
const getExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

// 获取文件类型
const getFileType = (filename) => {
  const ext = getExtension(filename);
  return FILE_TYPE_MAP[ext] || 'unknown';
};

// 获取文件分类（基于目录）
const getFileCategoryFromPath = (relativePath) => {
  // 从路径中提取顶级目录
  const parts = relativePath.split(/[\\/]/);
  const topDir = parts[0] || '';
  
  const dirCategoryMap = {
    notes: 'documents',
    posts: 'documents',
    lyrics: 'documents',
    music: 'media',
    diagrams: 'data',
    videos: 'media',
    products: 'data',
    documents: 'documents',
    media: 'media',
    data: 'data',
    code: 'code'
  };
  
  return dirCategoryMap[topDir] || 'other';
};

// 扫描目录
const scanDirectory = (dirPath, basePath = '') => {
  const files = [];
  
  if (!fs.existsSync(dirPath)) {
    return files;
  }
  
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const itemPath = path.join(dirPath, item);
    const relativePath = basePath ? `${basePath}/${item}` : item;
    const stat = fs.statSync(itemPath);
    const parts = relativePath.split(/[\\/]/);
    
    if (stat.isDirectory()) {
      // 递归扫描子目录
      const subFiles = scanDirectory(itemPath, relativePath);
      files.push(...subFiles);
    } else {
      // 处理文件
      const fileType = getFileType(item);
      const category = getFileCategoryFromPath(relativePath);
      const ext = getExtension(item);
      
      let metadata = {};
      let content = '';
      
      // 读取 Markdown 文件的 frontmatter
      if (fileType === 'markdown') {
        try {
          content = fs.readFileSync(itemPath, 'utf-8');
          const parsed = matter(content);
          metadata = parsed.data || {};
          content = parsed.content;
        } catch (error) {
          console.error(`读取 Markdown 文件失败 ${itemPath}:`, error);
        }
      }
      
      // 读取 JSON 文件
      if (fileType === 'json') {
        try {
          const jsonContent = fs.readFileSync(itemPath, 'utf-8');
          const parsed = JSON.parse(jsonContent);
          metadata = {
            title: parsed.title || parsed.name || item,
            originalData: parsed
          };
          content = jsonContent;
        } catch (error) {
          console.error(`读取 JSON 文件失败 ${itemPath}:`, error);
        }
      }
      
      // 计算文件大小
      const size = stat.size;
      
      // 生成文件 ID
      const id = `${category}-${path.basename(item, ext)}-${Date.now()}`;
      
      files.push({
        id,
        name: metadata.title || path.basename(item, ext),
        filename: item,
        path: `/files/${relativePath}`,
        type: fileType,
        category,
        subcategory: parts[0] || 'other',
        tags: metadata.tags || [],
        createdAt: metadata.createdAt || stat.birthtime.toISOString(),
        updatedAt: metadata.updatedAt || stat.mtime.toISOString(),
        size,
        metadata: {
          ...metadata,
          author: metadata.author || 'Unknown',
          wordCount: fileType === 'markdown' ? content.split(/\s+/).length : 0,
          readingTime: fileType === 'markdown' ? `${Math.ceil(content.split(/\s+/).length / 200)} min` : null
        }
      });
    }
  });
  
  return files;
};

// 生成文件索引
const generateFileIndex = (filesDir, outputDir) => {
  console.log('开始扫描文件目录...');
  
  const categories = {
    documents: {
      name: 'Documents',
      path: '/files/documents',
      icon: 'file-alt',
      color: 'blue',
      subcategories: ['markdown', 'word', 'pdf', 'excel', 'text']
    },
    media: {
      name: 'Media',
      path: '/files/media',
      icon: 'media',
      color: 'purple',
      subcategories: ['image', 'audio', 'video']
    },
    data: {
      name: 'Data',
      path: '/files/data',
      icon: 'database',
      color: 'green',
      subcategories: ['json', 'csv', 'xml']
    },
    code: {
      name: 'Code',
      path: '/files/code',
      icon: 'code',
      color: 'gray',
      subcategories: ['javascript', 'typescript', 'python', 'css', 'html']
    },
    other: {
      name: 'Other',
      path: '/files/other',
      icon: 'folder',
      color: 'yellow',
      subcategories: ['unknown']
    }
  };
  
  const files = scanDirectory(filesDir);
  
  const index = {
    lastUpdated: new Date().toISOString(),
    totalFiles: files.length,
    categories,
    files
  };
  
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // 写入索引文件
  const outputPath = path.join(outputDir, 'file-index.json');
  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2), 'utf-8');
  
  console.log(`✓ 文件索引生成完成：${outputPath}`);
  console.log(`  - 总文件数：${files.length}`);
  console.log(`  - 文档：${files.filter(f => f.category === 'documents').length}`);
  console.log(`  - 媒体：${files.filter(f => f.category === 'media').length}`);
  console.log(`  - 数据：${files.filter(f => f.category === 'data').length}`);
  console.log(`  - 代码：${files.filter(f => f.category === 'code').length}`);
  console.log(`  - 其他：${files.filter(f => f.category === 'other').length}`);
  
  return index;
};

// 如果直接运行此脚本
if (require.main === module) {
  const args = process.argv.slice(2);
  // 使用绝对路径
  const filesDir = args[0] || path.resolve(__dirname, '../public/files');
  const outputDir = args[1] || path.resolve(__dirname, '../public/metadata');
  
  console.log('扫描目录:', filesDir);
  console.log('输出目录:', outputDir);
  
  try {
    generateFileIndex(filesDir, outputDir);
  } catch (error) {
    console.error('生成文件索引失败:', error);
    process.exit(1);
  }
}

module.exports = {
  generateFileIndex,
  scanDirectory,
  getFileType,
  getFileCategoryFromPath
};
