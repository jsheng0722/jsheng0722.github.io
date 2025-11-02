const fs = require('fs');
const path = require('path');

/**
 * 从浏览器localStorage导出笔记到文件
 * 
 * 使用方法：
 * 1. 在浏览器Console中运行: console.log(JSON.stringify(localStorage.getItem('userNotes')))
 * 2. 复制输出的JSON字符串
 * 3. 粘贴到下面的 USER_NOTES_JSON 变量中
 * 4. 运行: node src/exportNotesFromLocalStorage.js
 */

// ====== 配置区域 ======
// 将从浏览器Console复制的JSON字符串粘贴到这里
const USER_NOTES_JSON = `[]`; // 替换为实际数据

const OUTPUT_DIR = path.join(__dirname, '../public/content');
const NOTE_LIST_FILE = path.join(OUTPUT_DIR, 'noteList_s.json');
// =====================

function exportNotes() {
  console.log('\n=================================');
  console.log('  笔记导出工具');
  console.log('=================================\n');

  try {
    // 解析用户笔记
    const userNotes = JSON.parse(USER_NOTES_JSON);
    
    if (!Array.isArray(userNotes) || userNotes.length === 0) {
      console.log('❌ 没有找到笔记数据');
      console.log('\n请按照以下步骤操作：');
      console.log('1. 打开浏览器，访问您的网站');
      console.log('2. 按F12打开开发者工具');
      console.log('3. 在Console标签页中输入：');
      console.log('   localStorage.getItem("userNotes")');
      console.log('4. 复制输出的JSON字符串');
      console.log('5. 粘贴到 src/exportNotesFromLocalStorage.js 的 USER_NOTES_JSON 变量中');
      console.log('6. 重新运行此脚本\n');
      return;
    }

    console.log(`找到 ${userNotes.length} 篇笔记\n`);

    // 读取现有的noteList
    let noteList = [];
    if (fs.existsSync(NOTE_LIST_FILE)) {
      noteList = JSON.parse(fs.readFileSync(NOTE_LIST_FILE, 'utf8'));
      console.log(`已加载现有笔记列表 (${noteList.length} 篇)\n`);
    }

    // 合并笔记（避免重复）
    userNotes.forEach(userNote => {
      const exists = noteList.find(n => n.id === userNote.id);
      if (!exists) {
        noteList.push(userNote);
        console.log(`✅ 添加笔记: ${userNote.title}`);
      } else {
        console.log(`⚠️  跳过重复: ${userNote.title} (ID: ${userNote.id})`);
      }
    });

    // 保存更新后的noteList
    fs.writeFileSync(NOTE_LIST_FILE, JSON.stringify(noteList, null, 2), 'utf8');
    
    console.log('\n=================================');
    console.log(`✅ 成功！共 ${noteList.length} 篇笔记`);
    console.log('=================================\n');
    console.log(`输出文件: ${NOTE_LIST_FILE}\n`);
    console.log('下一步：');
    console.log('1. 笔记已永久保存到 noteList_s.json');
    console.log('2. 刷新浏览器页面');
    console.log('3. 即使清除localStorage，笔记也不会丢失\n');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.log('\n请检查：');
    console.log('1. USER_NOTES_JSON 是否是有效的JSON格式');
    console.log('2. 是否正确复制了完整的数据');
    console.log('3. JSON字符串是否需要去掉外层引号\n');
  }
}

// 运行导出
exportNotes();
