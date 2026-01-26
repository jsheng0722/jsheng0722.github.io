#!/usr/bin/env node

/**
 * 项目结构扫描脚本
 * 扫描所有文件，分析项目结构
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 扫描项目结构...\n');

const projectRoot = process.cwd();
const results = {
  pages: [],
  components: [],
  utils: [],
  contexts: [],
  publicFiles: [],
  configFiles: []
};

// 扫描目录
function scanDirectory(dir, basePath = '') {
  const fullPath = path.join(projectRoot, dir);
  if (!fs.existsSync(fullPath)) return;

  const items = fs.readdirSync(fullPath);
  
  items.forEach(item => {
    const itemPath = path.join(fullPath, item);
    const relativePath = path.join(basePath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      // 跳过 node_modules 和 build
      if (item !== 'node_modules' && item !== 'build' && !item.startsWith('.')) {
        scanDirectory(itemPath, relativePath);
      }
    } else if (stats.isFile()) {
      const ext = path.extname(item);
      if (ext === '.js' || ext === '.jsx') {
        if (dir.includes('pages')) {
          results.pages.push(relativePath);
        } else if (dir.includes('components')) {
          results.components.push(relativePath);
        } else if (dir.includes('utils')) {
          results.utils.push(relativePath);
        } else if (dir.includes('context')) {
          results.contexts.push(relativePath);
        }
      } else if (dir.includes('public')) {
        results.publicFiles.push(relativePath);
      } else if (['package.json', 'tailwind.config.js', '.gitignore', '.nojekyll'].includes(item)) {
        results.configFiles.push(relativePath);
      }
    }
  });
}

// 扫描主要目录
console.log('📁 扫描 src 目录...');
scanDirectory('src', 'src');

console.log('📁 扫描 public 目录...');
scanDirectory('public', 'public');

console.log('📁 扫描根目录...');
scanDirectory('.', '.');

// 输出结果
console.log('\n📊 扫描结果:\n');
console.log(`页面文件: ${results.pages.length} 个`);
console.log(`组件文件: ${results.components.length} 个`);
console.log(`工具函数: ${results.utils.length} 个`);
console.log(`上下文: ${results.contexts.length} 个`);
console.log(`公共文件: ${results.publicFiles.length} 个`);
console.log(`配置文件: ${results.configFiles.length} 个`);

// 保存结果
const reportPath = path.join(projectRoot, 'PROJECT_STRUCTURE.json');
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`\n✅ 结果已保存到: ${reportPath}`);
