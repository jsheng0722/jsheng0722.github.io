/**
 * 批量更新笔记标签脚本
 * 将 "LeetCode" 标签更新为 "算法"
 */

const fs = require('fs');
const path = require('path');

// 笔记存储路径
const NOTES_STORAGE_KEY = 'notes';
const BACKUP_KEY = 'notes_backup_' + new Date().toISOString().replace(/[:.]/g, '-');

function updateNoteTags() {
  try {
    console.log('🔄 开始更新笔记标签...');
    
    // 从localStorage读取笔记数据（这里我们需要在浏览器中运行）
    if (typeof window === 'undefined') {
      console.log('❌ 此脚本需要在浏览器环境中运行');
      console.log('💡 请在浏览器控制台中运行以下代码：');
      console.log(`
// 更新笔记标签的代码
const notes = JSON.parse(localStorage.getItem('notes') || '[]');
const backup = JSON.parse(localStorage.getItem('notes_backup') || '[]');

// 创建备份
localStorage.setItem('notes_backup_' + new Date().toISOString().replace(/[:.]/g, '-'), JSON.stringify(notes));

// 更新标签
let updatedCount = 0;
const updatedNotes = notes.map(note => {
  if (note.category === 'LeetCode') {
    updatedCount++;
    return { ...note, category: '算法' };
  }
  return note;
});

// 保存更新后的笔记
localStorage.setItem('notes', JSON.stringify(updatedNotes));

console.log(\`✅ 成功更新 \${updatedCount} 个笔记的标签\`);
console.log('📝 已创建备份，备份键名:', 'notes_backup_' + new Date().toISOString().replace(/[:.]/g, '-'));
      `);
      return;
    }

    // 浏览器环境中的代码
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    
    if (notes.length === 0) {
      console.log('ℹ️ 没有找到笔记数据');
      return;
    }

    // 创建备份
    const backupKey = BACKUP_KEY;
    localStorage.setItem(backupKey, JSON.stringify(notes));
    console.log(`📦 已创建备份，备份键名: ${backupKey}`);

    // 更新标签
    let updatedCount = 0;
    const updatedNotes = notes.map(note => {
      if (note.category === 'LeetCode') {
        updatedCount++;
        console.log(`🔄 更新笔记: "${note.title}" 标签: LeetCode → 算法`);
        return { ...note, category: '算法' };
      }
      return note;
    });

    // 保存更新后的笔记
    localStorage.setItem('notes', JSON.stringify(updatedNotes));

    console.log(`✅ 成功更新 ${updatedCount} 个笔记的标签`);
    
    if (updatedCount > 0) {
      console.log('🎉 所有LeetCode标签已更新为算法标签');
      console.log('💡 请刷新页面查看更新后的笔记');
    } else {
      console.log('ℹ️ 没有找到需要更新的LeetCode标签笔记');
    }

  } catch (error) {
    console.error('❌ 更新失败:', error);
  }
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = updateNoteTags;
} else {
  window.updateNoteTags = updateNoteTags;
}

// 如果在浏览器中直接运行
if (typeof window !== 'undefined') {
  updateNoteTags();
}
