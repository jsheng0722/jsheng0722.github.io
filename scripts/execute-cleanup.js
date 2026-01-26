#!/usr/bin/env node

/**
 * 执行清理操作
 * 删除分析出的无用文件
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 开始清理无用文件...\n');

// 读取分析结果
const reportPath = path.join('.', 'CLEANUP_ANALYSIS.json');
if (!fs.existsSync(reportPath)) {
  console.log('❌ 未找到分析结果文件，请先运行: node scripts/analyze-and-cleanup.js');
  process.exit(1);
}

const analysis = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

let deletedCount = 0;
let errorCount = 0;

// 删除文件
function deleteFile(filePath) {
  try {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      // 删除目录
      fs.rmSync(filePath, { recursive: true, force: true });
      console.log(`   ✅ 删除目录: ${filePath}`);
    } else {
      // 删除文件
      fs.unlinkSync(filePath);
      console.log(`   ✅ 删除文件: ${filePath}`);
    }
    deletedCount++;
  } catch (error) {
    console.log(`   ❌ 删除失败: ${filePath} - ${error.message}`);
    errorCount++;
  }
}

// 删除文档文件
if (analysis.docsToDelete.length > 0) {
  console.log('📄 删除文档文件...');
  analysis.docsToDelete.forEach(deleteFile);
}

// 删除脚本文件
if (analysis.scriptsToDelete.length > 0) {
  console.log('\n📜 删除脚本文件...');
  analysis.scriptsToDelete.forEach(deleteFile);
}

// 删除测试文件
if (analysis.testFilesToDelete.length > 0) {
  console.log('\n🧪 删除测试文件...');
  analysis.testFilesToDelete.forEach(deleteFile);
}

// 删除 src 文件
if (analysis.srcFilesToDelete.length > 0) {
  console.log('\n📁 删除 src 文件...');
  analysis.srcFilesToDelete.forEach(deleteFile);
}

console.log(`\n✅ 清理完成!`);
console.log(`   已删除: ${deletedCount} 个文件/目录`);
console.log(`   失败: ${errorCount} 个`);

// 删除分析报告
try {
  fs.unlinkSync(reportPath);
  console.log(`\n🗑️  已删除分析报告文件`);
} catch (e) {
  // 忽略错误
}
