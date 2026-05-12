export const FILE_TYPE_MAP = {
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.docx': 'docx',
  '.doc': 'doc',
  '.pdf': 'pdf',
  '.txt': 'text',
  '.rtf': 'text',
  '.xlsx': 'excel',
  '.xls': 'excel',
  '.csv': 'csv',
  '.ppt': 'ppt',
  '.pptx': 'pptx',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.gif': 'image',
  '.svg': 'image',
  '.webp': 'image',
  '.bmp': 'image',
  '.ico': 'image',
  '.mp3': 'audio',
  '.wav': 'audio',
  '.flac': 'audio',
  '.ogg': 'audio',
  '.m4a': 'audio',
  '.mp4': 'video',
  '.webm': 'video',
  '.avi': 'video',
  '.mov': 'video',
  '.mkv': 'video',
  '.js': 'code',
  '.jsx': 'code',
  '.ts': 'code',
  '.tsx': 'code',
  '.py': 'code',
  '.java': 'code',
  '.cpp': 'code',
  '.c': 'code',
  '.h': 'code',
  '.cs': 'code',
  '.go': 'code',
  '.rs': 'code',
  '.rb': 'code',
  '.php': 'code',
  '.swift': 'code',
  '.kt': 'code',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'css',
  '.sass': 'css',
  '.less': 'css',
  '.json': 'json',
  '.xml': 'xml',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.zip': 'archive',
  '.rar': 'archive',
  '.7z': 'archive',
  '.tar': 'archive',
  '.gz': 'archive',
  '.log': 'text',
  '.ini': 'text',
  '.conf': 'text',
  '.cfg': 'text',
  '.sql': 'code',
  '.sh': 'code',
  '.bash': 'code',
  '.bat': 'code',
  '.ps1': 'code',
  '.env': 'text',
  '.gitignore': 'text',
  '.gitattributes': 'text',
  '.readme': 'text',
  '.license': 'text'
};

export const CATEGORY_MAP = {
  markdown: 'documents',
  docx: 'documents',
  doc: 'documents',
  pdf: 'documents',
  text: 'documents',
  excel: 'documents',
  csv: 'documents',
  ppt: 'documents',
  pptx: 'documents',
  code: 'documents',
  html: 'documents',
  css: 'documents',
  json: 'documents',
  xml: 'documents',
  yaml: 'documents',
  image: 'media',
  audio: 'media',
  video: 'media',
  archive: 'archives'
};

export const SUBCATEGORY_MAP = {
  markdown: 'markdown',
  docx: 'word',
  doc: 'word',
  pdf: 'pdf',
  text: 'text',
  excel: 'excel',
  csv: 'excel',
  ppt: 'powerpoint',
  pptx: 'powerpoint',
  code: 'code',
  html: 'html',
  css: 'css',
  json: 'json',
  image: 'images',
  audio: 'audio',
  video: 'video',
  archive: 'archives'
};

export const TYPE_INFO = {
  markdown: {
    name: 'Markdown',
    icon: 'file-alt',
    color: 'blue',
    renderable: true,
    description: 'Markdown 文档'
  },
  docx: {
    name: 'Word',
    icon: 'file-word',
    color: 'indigo',
    renderable: true,
    description: 'Word 文档'
  },
  doc: {
    name: 'Word',
    icon: 'file-word',
    color: 'indigo',
    renderable: true,
    description: 'Word 文档'
  },
  pdf: {
    name: 'PDF',
    icon: 'file-pdf',
    color: 'red',
    renderable: true,
    description: 'PDF 文档'
  },
  text: {
    name: '文本',
    icon: 'file-alt',
    color: 'gray',
    renderable: true,
    description: '纯文本文件'
  },
  excel: {
    name: 'Excel',
    icon: 'file-excel',
    color: 'green',
    renderable: true,
    description: 'Excel 表格'
  },
  csv: {
    name: 'CSV',
    icon: 'file-csv',
    color: 'green',
    renderable: true,
    description: 'CSV 数据文件'
  },
  ppt: {
    name: 'PowerPoint',
    icon: 'file-powerpoint',
    color: 'orange',
    renderable: false,
    description: 'PowerPoint 演示文稿'
  },
  pptx: {
    name: 'PowerPoint',
    icon: 'file-powerpoint',
    color: 'orange',
    renderable: false,
    description: 'PowerPoint 演示文稿'
  },
  image: {
    name: '图片',
    icon: 'image',
    color: 'pink',
    renderable: true,
    description: '图片文件'
  },
  audio: {
    name: '音频',
    icon: 'music',
    color: 'purple',
    renderable: true,
    description: '音频文件'
  },
  video: {
    name: '视频',
    icon: 'video',
    color: 'red',
    renderable: true,
    description: '视频文件'
  },
  code: {
    name: '代码',
    icon: 'code',
    color: 'green',
    renderable: true,
    description: '代码文件'
  },
  html: {
    name: 'HTML',
    icon: 'html5',
    color: 'orange',
    renderable: true,
    description: 'HTML 文件'
  },
  css: {
    name: 'CSS',
    icon: 'css3',
    color: 'blue',
    renderable: true,
    description: 'CSS 样式文件'
  },
  json: {
    name: 'JSON',
    icon: 'braces',
    color: 'yellow',
    renderable: true,
    description: 'JSON 数据文件'
  },
  xml: {
    name: 'XML',
    icon: 'code',
    color: 'teal',
    renderable: true,
    description: 'XML 文件'
  },
  yaml: {
    name: 'YAML',
    icon: 'file-code',
    color: 'purple',
    renderable: true,
    description: 'YAML 配置文件'
  },
  archive: {
    name: '压缩包',
    icon: 'archive',
    color: 'orange',
    renderable: false,
    description: '压缩包文件'
  }
};

export function getFileExtension(filename) {
  if (!filename) return '';
  const parts = filename.split('.');
  if (parts.length === 1) return '';
  return '.' + parts.pop().toLowerCase();
}

export function getFileType(filename) {
  const ext = getFileExtension(filename);
  return FILE_TYPE_MAP[ext] || 'unknown';
}

export function getFileCategory(filename) {
  const type = getFileType(filename);
  return CATEGORY_MAP[type] || 'other';
}

export function getFileSubcategory(filename) {
  const type = getFileType(filename);
  return SUBCATEGORY_MAP[type] || 'other';
}

export function getTypeInfo(filename) {
  const type = getFileType(filename);
  return TYPE_INFO[type] || {
    name: '未知',
    icon: 'file',
    color: 'gray',
    renderable: false,
    description: '未知类型的文件'
  };
}

export function isRenderable(filename) {
  const type = getFileType(filename);
  const info = TYPE_INFO[type];
  return info ? info.renderable : false;
}

export function getMimeType(filename) {
  const ext = getFileExtension(filename);
  const mimeTypes = {
    '.md': 'text/markdown',
    '.markdown': 'text/markdown',
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
    '.csv': 'text/csv',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.avi': 'video/x-msvideo',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.7z': 'application/x-7z-compressed',
    '.log': 'text/plain',
    '.ini': 'text/plain',
    '.conf': 'text/plain',
    '.cfg': 'text/plain',
    '.sql': 'text/plain',
    '.sh': 'text/plain',
    '.bash': 'text/plain',
    '.bat': 'text/plain',
    '.ps1': 'text/plain',
    '.env': 'text/plain'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getLanguageFromExtension(filename) {
  const ext = getFileExtension(filename);
  const languageMap = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.cpp': 'cpp',
    '.c': 'c',
    '.cs': 'csharp',
    '.go': 'go',
    '.rs': 'rust',
    '.rb': 'ruby',
    '.php': 'php',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.html': 'html',
    '.htm': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.sass': 'sass',
    '.less': 'less',
    '.json': 'json',
    '.xml': 'xml',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.md': 'markdown',
    '.sql': 'sql',
    '.sh': 'bash',
    '.bash': 'bash'
  };
  return languageMap[ext] || 'plaintext';
}
