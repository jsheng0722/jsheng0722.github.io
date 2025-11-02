#!/usr/bin/env node

/**
 * 文档清理脚本
 * 删除根目录下已经整理到docs文件夹的MD文档
 */

const fs = require('fs');
const path = require('path');

// 要删除的文档列表（已复制到docs文件夹的）
const docsToDelete = [
  // 功能文档
  'AUTO_LYRICS_GUIDE.md',
  'MUSIC_AUTO_SETUP.md',
  'MUSIC_VOICE_RECOGNITION_GUIDE.md',
  'VOICE_LYRICS_GUIDE.md',
  'VOICE_LYRICS_SUMMARY.md',
  
  // 笔记相关
  'NOTE_ZOOM_GUIDE.md',
  'NOTES_TAG_UPDATE_GUIDE.md',
  'NOTES_BACKUP_QUICKSTART.md',
  
  // 图形编辑相关
  'DIAGRAM_EDITOR_UPGRADE.md',
  'DIAGRAM_EDITOR_BUGFIX.md',
  'DIAGRAM_FEATURE_QUICKSTART.md',
  'DRAG_AND_DROP_GUIDE.md',
  'FIND_DIAGRAM_BUTTON_GUIDE.md',
  'FLOATING_TOOLBAR_GUIDE.md',
  'FONT_SIZE_FEATURE.md',
  
  // 项目文档
  'PROJECT_SUMMARY.md',
  'HOW_TO_FIND_FEATURES.md',
  'CLEANUP_SUMMARY.md',
  'CHANGELOG.md',
  
  // 中文文档
  '图形编辑器使用说明.md'
];

// 保留的文档（不删除）
const keepDocs = [
  'README.md',                    // 主README
  'COMPLETE_FEATURES_GUIDE.md',   // 新的综合指南
  'organize-docs.js',             // 整理脚本
  'cleanup-docs.js',              // 清理脚本
  'UPDATE_NOTES_TAGS.html',       // 标签更新工具
  'VOICE_LYRICS_DEMO.html',       // 语音识别演示
  'TEST_BUTTON_VISIBILITY.html',  // 测试工具
  'add-music.js'                  // 音乐添加脚本
];

console.log('🧹 开始清理文档...\n');

let deletedCount = 0;
let skippedCount = 0;

// 删除文档
docsToDelete.forEach(doc => {
  const docPath = doc;
  
  if (fs.existsSync(docPath)) {
    try {
      // 确认文档已复制到docs文件夹
      const docsPath = path.join('docs', doc);
      if (fs.existsSync(docsPath)) {
        fs.unlinkSync(docPath);
        console.log(`✅ 已删除: ${doc}`);
        deletedCount++;
      } else {
        console.log(`⚠️  跳过: ${doc} (未在docs文件夹中找到副本)`);
        skippedCount++;
      }
    } catch (error) {
      console.error(`❌ 删除失败: ${doc} - ${error.message}`);
    }
  } else {
    console.log(`ℹ️  文件不存在: ${doc}`);
  }
});

// 显示清理结果
console.log('\n📊 清理结果:');
console.log(`✅ 已删除: ${deletedCount} 个文档`);
console.log(`⚠️  跳过: ${skippedCount} 个文档`);

// 显示保留的文档
console.log('\n📋 保留的文档:');
keepDocs.forEach(doc => {
  if (fs.existsSync(doc)) {
    console.log(`📄 ${doc}`);
  }
});

console.log('\n🎉 文档清理完成！');
console.log('📁 所有功能文档已整理到: docs/ 文件夹');
console.log('📖 查看完整指南: COMPLETE_FEATURES_GUIDE.md');
console.log('📚 查看文档索引: docs/README.md');
