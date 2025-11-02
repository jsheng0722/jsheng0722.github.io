#!/usr/bin/env node

/**
 * 高级项目清理脚本
 * 整理分散的MD文档、清理重复组件、删除构建文件
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 开始高级项目清理...\n');

// 创建子文件夹结构
const createSubDirs = () => {
  const subDirs = [
    'docs/components',
    'docs/pages', 
    'docs/music'
  ];
  
  subDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 创建文件夹: ${dir}`);
    }
  });
};

// 整理组件文档
const organizeComponentDocs = () => {
  const componentDocs = [
    { source: 'src/components/CODE_BLOCK_FEATURE.md', target: 'docs/components/CODE_BLOCK_FEATURE.md' },
    { source: 'src/components/DiagramEditor/README.md', target: 'docs/components/DiagramEditor_README.md' },
    { source: 'src/components/DiagramEditor/SHAPE_EDITOR_GUIDE.md', target: 'docs/components/SHAPE_EDITOR_GUIDE.md' },
    { source: 'src/components/MusicPlayer/LYRICS_FEATURE.md', target: 'docs/components/LYRICS_FEATURE.md' },
    { source: 'src/components/Weather/API_INTEGRATION_GUIDE.md', target: 'docs/components/API_INTEGRATION_GUIDE.md' },
    { source: 'src/components/Weather/README.md', target: 'docs/components/Weather_README.md' }
  ];
  
  console.log('📝 整理组件文档...');
  componentDocs.forEach(doc => {
    if (fs.existsSync(doc.source)) {
      try {
        fs.copyFileSync(doc.source, doc.target);
        console.log(`✅ 已复制: ${doc.source} → ${doc.target}`);
      } catch (error) {
        console.error(`❌ 复制失败: ${doc.source} - ${error.message}`);
      }
    }
  });
};

// 整理页面文档
const organizePageDocs = () => {
  const pageDocs = [
    { source: 'src/pages/Home/LAYOUT_DESIGN.md', target: 'docs/pages/LAYOUT_DESIGN.md' },
    { source: 'src/pages/Music/AUDIO_TROUBLESHOOTING.md', target: 'docs/pages/AUDIO_TROUBLESHOOTING.md' },
    { source: 'src/pages/Music/README.md', target: 'docs/pages/Music_README.md' },
    { source: 'src/pages/Music/USAGE.md', target: 'docs/pages/Music_USAGE.md' },
    { source: 'src/pages/Note/EDIT_DELETE_GUIDE.md', target: 'docs/pages/EDIT_DELETE_GUIDE.md' },
    { source: 'src/pages/Note/FINAL_GUIDE.md', target: 'docs/pages/FINAL_GUIDE.md' },
    { source: 'src/pages/Note/MARKDOWN_RENDERING.md', target: 'docs/pages/MARKDOWN_RENDERING.md' },
    { source: 'src/pages/Note/PERMANENT_SAVE_GUIDE.md', target: 'docs/pages/PERMANENT_SAVE_GUIDE.md' }
  ];
  
  console.log('\n📝 整理页面文档...');
  pageDocs.forEach(doc => {
    if (fs.existsSync(doc.source)) {
      try {
        fs.copyFileSync(doc.source, doc.target);
        console.log(`✅ 已复制: ${doc.source} → ${doc.target}`);
      } catch (error) {
        console.error(`❌ 复制失败: ${doc.source} - ${error.message}`);
      }
    }
  });
};

// 整理音乐文档
const organizeMusicDocs = () => {
  const musicDocs = [
    { source: 'public/music/AUTO_GENERATION_GUIDE.md', target: 'docs/music/AUTO_GENERATION_GUIDE.md' },
    { source: 'public/music/FINAL_SETUP_SUMMARY.md', target: 'docs/music/FINAL_SETUP_SUMMARY.md' },
    { source: 'public/music/FOLDER_STRUCTURE.md', target: 'docs/music/FOLDER_STRUCTURE.md' },
    { source: 'public/music/QUICK_ADD_MUSIC.md', target: 'docs/music/QUICK_ADD_MUSIC.md' },
    { source: 'public/music/README.md', target: 'docs/music/Music_README.md' },
    { source: 'public/music/music list/QUICK_START.md', target: 'docs/music/QUICK_START.md' }
  ];
  
  console.log('\n📝 整理音乐文档...');
  musicDocs.forEach(doc => {
    if (fs.existsSync(doc.source)) {
      try {
        fs.copyFileSync(doc.source, doc.target);
        console.log(`✅ 已复制: ${doc.source} → ${doc.target}`);
      } catch (error) {
        console.error(`❌ 复制失败: ${doc.source} - ${error.message}`);
      }
    }
  });
};

// 删除重复组件文件夹
const cleanupDuplicateComponents = () => {
  console.log('\n🧹 清理重复组件...');
  
  const duplicatesToRemove = [
    'src/components/Comment_1',
    'src/components/CommentSend'
  ];
  
  duplicatesToRemove.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`✅ 已删除重复文件夹: ${dir}`);
      } catch (error) {
        console.error(`❌ 删除失败: ${dir} - ${error.message}`);
      }
    }
  });
};

// 清理构建文件夹
const cleanupBuildFolders = () => {
  console.log('\n🧹 清理构建文件夹...');
  
  const buildFolders = [
    'build',
    'dist'
  ];
  
  buildFolders.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`✅ 已删除构建文件夹: ${dir}`);
      } catch (error) {
        console.error(`❌ 删除失败: ${dir} - ${error.message}`);
      }
    }
  });
};

// 更新文档索引
const updateDocsIndex = () => {
  console.log('\n📚 更新文档索引...');
  
  const indexContent = `# 📚 文档索引

## 📋 主要文档

### 🎯 完整功能指南
- **[COMPLETE_FEATURES_GUIDE.md](./COMPLETE_FEATURES_GUIDE.md)** - 所有功能的完整指南

## 🎵 音乐系统文档

### 音乐管理
- **[MUSIC_AUTO_SETUP.md](./MUSIC_AUTO_SETUP.md)** - 音乐自动设置指南
- **[AUTO_LYRICS_GUIDE.md](./AUTO_LYRICS_GUIDE.md)** - 自动歌词生成指南

### 音乐详细文档
- **[docs/music/](./music/)** - 音乐系统详细文档
  - [AUTO_GENERATION_GUIDE.md](./music/AUTO_GENERATION_GUIDE.md) - 自动生成指南
  - [FINAL_SETUP_SUMMARY.md](./music/FINAL_SETUP_SUMMARY.md) - 最终设置总结
  - [FOLDER_STRUCTURE.md](./music/FOLDER_STRUCTURE.md) - 文件夹结构
  - [QUICK_ADD_MUSIC.md](./music/QUICK_ADD_MUSIC.md) - 快速添加音乐
  - [Music_README.md](./music/Music_README.md) - 音乐README
  - [QUICK_START.md](./music/QUICK_START.md) - 快速开始

### 语音识别
- **[VOICE_LYRICS_GUIDE.md](./VOICE_LYRICS_GUIDE.md)** - 语音识别歌词生成指南
- **[VOICE_LYRICS_SUMMARY.md](./VOICE_LYRICS_SUMMARY.md)** - 语音识别功能总结
- **[MUSIC_VOICE_RECOGNITION_GUIDE.md](./MUSIC_VOICE_RECOGNITION_GUIDE.md)** - 音乐语音识别使用指南

## 📝 笔记系统文档

### 基础功能
- **[NOTE_ZOOM_GUIDE.md](./NOTE_ZOOM_GUIDE.md)** - 笔记缩放功能指南
- **[NOTES_TAG_UPDATE_GUIDE.md](./NOTES_TAG_UPDATE_GUIDE.md)** - 笔记标签更新指南
- **[NOTES_BACKUP_QUICKSTART.md](./NOTES_BACKUP_QUICKSTART.md)** - 笔记备份快速开始

### 笔记详细文档
- **[docs/pages/](./pages/)** - 笔记系统详细文档
  - [LAYOUT_DESIGN.md](./pages/LAYOUT_DESIGN.md) - 布局设计
  - [EDIT_DELETE_GUIDE.md](./pages/EDIT_DELETE_GUIDE.md) - 编辑删除指南
  - [FINAL_GUIDE.md](./pages/FINAL_GUIDE.md) - 最终指南
  - [MARKDOWN_RENDERING.md](./pages/MARKDOWN_RENDERING.md) - Markdown渲染
  - [PERMANENT_SAVE_GUIDE.md](./pages/PERMANENT_SAVE_GUIDE.md) - 永久保存指南
  - [AUDIO_TROUBLESHOOTING.md](./pages/AUDIO_TROUBLESHOOTING.md) - 音频故障排除
  - [Music_README.md](./pages/Music_README.md) - 音乐README
  - [Music_USAGE.md](./pages/Music_USAGE.md) - 音乐使用说明

## 🎨 图形编辑器文档

### 功能升级
- **[DIAGRAM_EDITOR_UPGRADE.md](./DIAGRAM_EDITOR_UPGRADE.md)** - 图形编辑器升级说明
- **[DIAGRAM_EDITOR_BUGFIX.md](./DIAGRAM_EDITOR_BUGFIX.md)** - 图形编辑器Bug修复
- **[DIAGRAM_FEATURE_QUICKSTART.md](./DIAGRAM_FEATURE_QUICKSTART.md)** - 图形功能快速开始

### 组件详细文档
- **[docs/components/](./components/)** - 组件系统详细文档
  - [CODE_BLOCK_FEATURE.md](./components/CODE_BLOCK_FEATURE.md) - 代码块功能
  - [DiagramEditor_README.md](./components/DiagramEditor_README.md) - 图形编辑器README
  - [SHAPE_EDITOR_GUIDE.md](./components/SHAPE_EDITOR_GUIDE.md) - 形状编辑器指南
  - [LYRICS_FEATURE.md](./components/LYRICS_FEATURE.md) - 歌词功能
  - [API_INTEGRATION_GUIDE.md](./components/API_INTEGRATION_GUIDE.md) - API集成指南
  - [Weather_README.md](./components/Weather_README.md) - 天气README

### 使用指南
- **[DRAG_AND_DROP_GUIDE.md](./DRAG_AND_DROP_GUIDE.md)** - 拖拽功能指南
- **[FIND_DIAGRAM_BUTTON_GUIDE.md](./FIND_DIAGRAM_BUTTON_GUIDE.md)** - 查找图形按钮指南
- **[FLOATING_TOOLBAR_GUIDE.md](./FLOATING_TOOLBAR_GUIDE.md)** - 浮动工具栏指南
- **[FONT_SIZE_FEATURE.md](./FONT_SIZE_FEATURE.md)** - 字体大小功能
- **[图形编辑器使用说明.md](./图形编辑器使用说明.md)** - 中文使用说明

## 📊 项目文档

### 项目概览
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - 项目完整总结
- **[HOW_TO_FIND_FEATURES.md](./HOW_TO_FIND_FEATURES.md)** - 如何找到各个功能
- **[CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md)** - 清理总结
- **[CHANGELOG.md](./CHANGELOG.md)** - 更新日志

## 🚀 快速开始

1. **新用户**: 先阅读 [COMPLETE_FEATURES_GUIDE.md](./COMPLETE_FEATURES_GUIDE.md)
2. **音乐功能**: 查看音乐系统相关文档
3. **笔记功能**: 查看笔记系统相关文档
4. **图形编辑**: 查看图形编辑器相关文档
5. **问题解决**: 查看项目文档和故障排除

## 📞 技术支持

如有问题，请参考相关功能文档或查看故障排除部分。
`;

  try {
    fs.writeFileSync('docs/README.md', indexContent);
    console.log('✅ 已更新文档索引: docs/README.md');
  } catch (error) {
    console.error('❌ 更新索引失败:', error.message);
  }
};

// 主函数
const main = () => {
  try {
    // 1. 创建子文件夹结构
    createSubDirs();
    
    // 2. 整理各种文档
    organizeComponentDocs();
    organizePageDocs();
    organizeMusicDocs();
    
    // 3. 清理重复组件
    cleanupDuplicateComponents();
    
    // 4. 清理构建文件夹
    cleanupBuildFolders();
    
    // 5. 更新文档索引
    updateDocsIndex();
    
    console.log('\n🎉 高级项目清理完成！');
    console.log('📁 文档已按类别整理到子文件夹');
    console.log('🧹 重复组件和构建文件已清理');
    console.log('📚 文档索引已更新');
    
  } catch (error) {
    console.error('❌ 清理过程中发生错误:', error.message);
  }
};

// 运行主函数
main();
