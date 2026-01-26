#!/usr/bin/env node

/**
 * 项目清理分析脚本
 * 分析项目文件，识别未使用的代码和文档
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 开始分析项目文件...\n');

// 需要保留的核心文件
const coreFiles = [
  'package.json',
  'package-lock.json',
  'README.md',
  '.gitignore',
  '.nojekyll',
  'tailwind.config.js',
  'webpack.config.js'
];

// 需要保留的目录
const coreDirs = [
  'src',
  'public',
  'scripts'
];

// 需要删除的文档文件（根目录）
const docsToDelete = [
  'ALGORITHM_VISUALIZER_FILES.md',
  'COMPLETE_FEATURES_GUIDE.md',
  'COMPONENT_REFERENCE_UPDATE_SUMMARY.md',
  'COMPONENT_REPLACEMENT_REPORT.md',
  'COMPONENT_UNIFICATION_SUMMARY.md',
  'DEPLOYMENT_CHECKLIST.md',
  'DEPLOYMENT_FIX.md',
  'DOCUMENTATION_CLEANUP_SUMMARY.md',
  'FINAL_CLEANUP_SUMMARY.md',
  'GITHUB_PAGES_TROUBLESHOOTING.md',
  'PROJECT_CLEANUP_PLAN.md',
  'QUICK_DEPLOY_GUIDE.md',
  'UNUSED_FILES_REPORT.md',
  'WEATHER_SETUP.md'
];

// 需要删除的脚本文件（根目录）
const scriptsToDelete = [
  'add-music.js',
  'advanced-cleanup.js',
  'cleanup-docs.js',
  'organize-docs.js'
];

// 需要删除的测试/示例文件
const testFilesToDelete = [
  'TEST_BUTTON_VISIBILITY.html',
  'UPDATE_NOTES_TAGS.html',
  'VOICE_LYRICS_DEMO.html'
];

// 需要删除的 src 目录下的未使用文件
const srcFilesToDelete = [
  'src/server.js', // 静态网站不需要服务器
  'src/conf.txt',
  'src/examples/', // 示例目录
  'src/docs/', // 文档应该在 docs/ 或 README 中
  'src/content/', // 内容应该在 public/content/ 中
  'src/audioLyricsGenerator.js', // 如果未使用
  'src/smartMusicManager.js', // 如果未使用
  'src/exportNotesFromLocalStorage.js', // 如果未使用
  'src/generateFileStructure.js', // 如果未使用
  'src/generateHomeContent.js', // 如果未使用
  'src/generateLanguageContent.js', // 如果未使用
  'src/generateMusicMetadata.js', // 如果未使用
  'src/utils/StorageCleanupManager.js', // 如果未使用
  'src/utils/SimpleDataManager.js', // 如果未使用
  'src/utils/MusicManager.js', // 如果未使用
  'src/utils/ImmediateConverter.js', // 如果未使用
  'src/utils/FileGenerator.js', // 如果未使用
  'src/utils/DataManager.js', // 如果未使用
  'src/utils/AutoSaveManager.js', // 如果未使用
  'src/hooks/useSimpleDataManager.js', // 如果未使用
  'src/hooks/useDataManager.js', // 如果未使用
  'src/hooks/useMusicManager.js', // 如果未使用
  'src/components/StorageCleanupScheduler.js', // 如果未使用
];

// 检查文件是否被导入
function checkFileUsage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // 检查是否有其他文件导入这个文件
    const grepPattern = `import.*${fileName}|require.*${fileName}|from.*${fileName}`;
    try {
      const result = execSync(`grep -r "${grepPattern}" src/ --include="*.js" --include="*.jsx" 2>/dev/null || true`, { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      return result.trim().length > 0;
    } catch (e) {
      return false;
    }
  } catch (e) {
    return false;
  }
}

// 分析结果
const analysis = {
  docsToDelete: [],
  scriptsToDelete: [],
  testFilesToDelete: [],
  srcFilesToDelete: [],
  unusedComponents: []
};

// 检查文档文件
console.log('📄 检查文档文件...');
docsToDelete.forEach(file => {
  const filePath = path.join('.', file);
  if (fs.existsSync(filePath)) {
    analysis.docsToDelete.push(filePath);
    console.log(`   ❌ ${file}`);
  }
});

// 检查脚本文件
console.log('\n📜 检查脚本文件...');
scriptsToDelete.forEach(file => {
  const filePath = path.join('.', file);
  if (fs.existsSync(filePath)) {
    // 检查是否在 package.json 中被引用
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const scripts = packageJson.scripts || {};
    const isUsed = Object.values(scripts).some(cmd => cmd.includes(file));
    
    if (!isUsed) {
      analysis.scriptsToDelete.push(filePath);
      console.log(`   ❌ ${file} (未在 package.json 中使用)`);
    } else {
      console.log(`   ✅ ${file} (在 package.json 中使用)`);
    }
  }
});

// 检查测试文件
console.log('\n🧪 检查测试文件...');
testFilesToDelete.forEach(file => {
  const filePath = path.join('.', file);
  if (fs.existsSync(filePath)) {
    analysis.testFilesToDelete.push(filePath);
    console.log(`   ❌ ${file}`);
  }
});

// 检查 src 文件
console.log('\n📁 检查 src 目录文件...');
srcFilesToDelete.forEach(file => {
  const filePath = path.join('.', file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      analysis.srcFilesToDelete.push(filePath);
      console.log(`   ❌ ${file} (目录)`);
    } else {
      // 检查文件是否被使用
      const isUsed = checkFileUsage(filePath);
      if (!isUsed) {
        analysis.srcFilesToDelete.push(filePath);
        console.log(`   ❌ ${file} (未使用)`);
      } else {
        console.log(`   ✅ ${file} (被使用)`);
      }
    }
  }
});

// 生成报告
console.log('\n📊 分析结果:');
console.log(`   文档文件: ${analysis.docsToDelete.length} 个`);
console.log(`   脚本文件: ${analysis.scriptsToDelete.length} 个`);
console.log(`   测试文件: ${analysis.testFilesToDelete.length} 个`);
console.log(`   src 文件: ${analysis.srcFilesToDelete.length} 个`);

// 保存分析结果
const reportPath = path.join('.', 'CLEANUP_ANALYSIS.json');
fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
console.log(`\n✅ 分析结果已保存到: ${reportPath}`);

console.log('\n💡 下一步:');
console.log('   运行清理脚本删除这些文件: node scripts/execute-cleanup.js');
