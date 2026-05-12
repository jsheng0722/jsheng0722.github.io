/**
 * LocalStorage 数据迁移工具
 * 将 localStorage 中的数据导出为静态文件
 */

// 安全解析 JSON 的辅助函数
const safeParseJSON = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`解析${key}数据失败:`, error);
    return defaultValue;
  }
};

// 从 noteRepository 获取笔记
const getUserNotesFromLocalStorage = () => {
  try {
    const notesData = localStorage.getItem('userNotes');
    if (!notesData) return [];
    
    const notes = JSON.parse(notesData);
    return Array.isArray(notes) ? notes : [];
  } catch (error) {
    console.error('获取笔记数据失败:', error);
    return [];
  }
};

// 生成唯一文件名
const generateFilename = (name, extension) => {
  const sanitizedName = name
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_')
    .substring(0, 50);
  const timestamp = Date.now();
  return `${sanitizedName}-${timestamp}.${extension}`;
};

// 将笔记转换为 Markdown 格式
const noteToMarkdown = (note) => {
  const frontmatter = [
    '---',
    `title: "${note.title || '无标题'}"`,
    `id: "${note.id || ''}"`,
    `createdAt: "${note.createdAt || new Date().toISOString()}"`,
    `updatedAt: "${note.updatedAt || note.createdAt || new Date().toISOString()}"`,
  ];
  
  if (note.tags && note.tags.length > 0) {
    frontmatter.push(`tags: [${note.tags.map(tag => `"${tag}"`).join(', ')}]`);
  }
  
  if (note.category) {
    frontmatter.push(`category: "${note.category}"`);
  }
  
  frontmatter.push('---', '');
  
  return frontmatter.join('\n') + (note.content || '');
};

// 将动态转换为 Markdown 格式
const postToMarkdown = (post) => {
  const frontmatter = [
    '---',
    `title: "${post.title || '无标题'}"`,
    `date: "${post.date || ''}"`,
    `time: "${post.time || ''}"`,
    `createdAt: "${new Date().toISOString()}"`,
  ];
  
  if (post.tags && post.tags.length > 0) {
    frontmatter.push(`tags: [${post.tags.map(tag => `"${tag}"`).join(', ')}]`);
  }
  
  if (post.mood) {
    frontmatter.push(`mood: "${post.mood}"`);
  }
  
  frontmatter.push('---', '');
  
  return frontmatter.join('\n') + (post.content || '');
};

// 将歌词转换为 Markdown 格式
const lyricToMarkdown = (lyric) => {
  const frontmatter = [
    '---',
    `title: "${lyric.title || '无标题'}"`,
    `id: "${lyric.id || ''}"`,
    `createdAt: "${lyric.createdAt || new Date().toISOString()}"`,
    `updatedAt: "${lyric.updatedAt || lyric.createdAt || new Date().toISOString()}"`,
  ];
  
  if (lyric.artist) {
    frontmatter.push(`artist: "${lyric.artist}"`);
  }
  
  if (lyric.tags && lyric.tags.length > 0) {
    frontmatter.push(`tags: [${lyric.tags.map(tag => `"${tag}"`).join(', ')}]`);
  }
  
  frontmatter.push('---', '');
  
  return frontmatter.join('\n') + (lyric.content || lyric.lyrics || '');
};

// 迁移笔记
const migrateNotes = () => {
  const notes = getUserNotesFromLocalStorage();
  const files = [];
  
  notes.forEach(note => {
    const filename = generateFilename(note.title || 'note', 'md');
    const content = noteToMarkdown(note);
    
    files.push({
      path: `/files/notes/${filename}`,
      filename,
      content,
      type: 'markdown',
      metadata: {
        id: note.id,
        title: note.title,
        originalData: note
      }
    });
  });
  
  return files;
};

// 迁移音乐数据
const migrateMusic = () => {
  const music = safeParseJSON('userMusic');
  const files = [];
  
  music.forEach(track => {
    const filename = generateFilename(track.title || 'track', 'json');
    const content = JSON.stringify(track, null, 2);
    
    files.push({
      path: `/files/music/${filename}`,
      filename,
      content,
      type: 'json',
      metadata: {
        id: track.id,
        title: track.title,
        originalData: track
      }
    });
  });
  
  return files;
};

// 迁移图形数据
const migrateDiagrams = () => {
  const diagrams = safeParseJSON('userDiagrams');
  const files = [];
  
  diagrams.forEach(diagram => {
    const filename = generateFilename(diagram.name || 'diagram', 'json');
    const content = JSON.stringify(diagram, null, 2);
    
    files.push({
      path: `/files/diagrams/${filename}`,
      filename,
      content,
      type: 'json',
      metadata: {
        id: diagram.id,
        name: diagram.name,
        originalData: diagram
      }
    });
  });
  
  return files;
};

// 迁移视频数据
const migrateVideos = () => {
  const videos = safeParseJSON('userVideos');
  const files = [];
  
  videos.forEach(video => {
    const filename = generateFilename(video.title || 'video', 'json');
    const content = JSON.stringify(video, null, 2);
    
    files.push({
      path: `/files/videos/${filename}`,
      filename,
      content,
      type: 'json',
      metadata: {
        id: video.id,
        title: video.title,
        originalData: video
      }
    });
  });
  
  return files;
};

// 迁移商品数据
const migrateProducts = () => {
  const products = safeParseJSON('userProducts');
  const files = [];
  
  products.forEach(product => {
    const filename = generateFilename(product.title || 'product', 'json');
    const content = JSON.stringify(product, null, 2);
    
    files.push({
      path: `/files/products/${filename}`,
      filename,
      content,
      type: 'json',
      metadata: {
        id: product.id,
        title: product.title,
        originalData: product
      }
    });
  });
  
  return files;
};

// 迁移动态数据
const migratePosts = () => {
  const posts = safeParseJSON('blogPosts');
  const files = [];
  
  posts.forEach(post => {
    const filename = generateFilename(post.title || 'post', 'md');
    const content = postToMarkdown(post);
    
    files.push({
      path: `/files/posts/${filename}`,
      filename,
      content,
      type: 'markdown',
      metadata: {
        id: post.id,
        title: post.title,
        originalData: post
      }
    });
  });
  
  return files;
};

// 迁移灵感歌词数据
const migrateLyrics = () => {
  const lyrics = safeParseJSON('inspirationLyrics');
  const quickLyrics = safeParseJSON('quickLyricsInspirations');
  const files = [];
  
  lyrics.forEach(lyric => {
    const filename = generateFilename(lyric.title || 'lyric', 'md');
    const content = lyricToMarkdown(lyric);
    
    files.push({
      path: `/files/lyrics/${filename}`,
      filename,
      content,
      type: 'markdown',
      metadata: {
        id: lyric.id,
        title: lyric.title,
        originalData: lyric
      }
    });
  });
  
  quickLyrics.forEach(lyric => {
    const filename = generateFilename(`quick-${lyric.id || 'lyric'}`, 'md');
    const content = lyricToMarkdown(lyric);
    
    files.push({
      path: `/files/lyrics/${filename}`,
      filename,
      content,
      type: 'markdown',
      metadata: {
        id: lyric.id,
        title: '快速灵感',
        originalData: lyric
      }
    });
  });
  
  return files;
};

// 执行完整迁移
export const executeMigration = () => {
  const allFiles = [
    ...migrateNotes(),
    ...migrateMusic(),
    ...migrateDiagrams(),
    ...migrateVideos(),
    ...migrateProducts(),
    ...migratePosts(),
    ...migrateLyrics()
  ];
  
  return {
    success: true,
    totalFiles: allFiles.length,
    files: allFiles,
    summary: {
      notes: allFiles.filter(f => f.path.includes('/notes/')).length,
      music: allFiles.filter(f => f.path.includes('/music/')).length,
      diagrams: allFiles.filter(f => f.path.includes('/diagrams/')).length,
      videos: allFiles.filter(f => f.path.includes('/videos/')).length,
      products: allFiles.filter(f => f.path.includes('/products/')).length,
      posts: allFiles.filter(f => f.path.includes('/posts/')).length,
      lyrics: allFiles.filter(f => f.path.includes('/lyrics/')).length
    }
  };
};

// 生成下载文件
export const downloadMigratedFiles = (files) => {
  files.forEach(file => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
};

// 生成迁移报告
export const generateMigrationReport = (migrationResult) => {
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: migrationResult.totalFiles,
    summary: migrationResult.summary,
    files: migrationResult.files.map(f => ({
      path: f.path,
      type: f.type,
      title: f.metadata.title
    }))
  };
  
  return JSON.stringify(report, null, 2);
};

export default {
  executeMigration,
  downloadMigratedFiles,
  generateMigrationReport,
  migrateNotes,
  migrateMusic,
  migrateDiagrams,
  migrateVideos,
  migrateProducts,
  migratePosts,
  migrateLyrics
};
