#!/usr/bin/env node

/**
 * 构建检查脚本
 * 用于诊断开发环境和生产环境的差异
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 检查构建配置...\n');

// 检查 package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log('📦 package.json 配置:');
console.log(`   homepage: ${packageJson.homepage}`);
console.log(`   部署脚本: ${packageJson.scripts.deploy}\n`);

// 检查 .nojekyll 文件
const nojekyllPaths = [
  path.join('public', '.nojekyll'),
  path.join('.', '.nojekyll'),
  path.join('build', '.nojekyll')
];

console.log('📄 .nojekyll 文件检查:');
nojekyllPaths.forEach(p => {
  const exists = fs.existsSync(p);
  console.log(`   ${exists ? '✅' : '❌'} ${p}`);
});
console.log('');

// 检查 build 目录
const buildDir = path.join('.', 'build');
if (fs.existsSync(buildDir)) {
  console.log('📁 build 目录内容:');
  const buildFiles = fs.readdirSync(buildDir);
  buildFiles.forEach(file => {
    const filePath = path.join(buildDir, file);
    const stats = fs.statSync(filePath);
    const type = stats.isDirectory() ? '📁' : '📄';
    console.log(`   ${type} ${file}`);
  });
  console.log('');
  
  // 检查 index.html
  const indexHtml = path.join(buildDir, 'index.html');
  if (fs.existsSync(indexHtml)) {
    const content = fs.readFileSync(indexHtml, 'utf8');
    console.log('📄 build/index.html 检查:');
    console.log(`   ✅ 文件存在`);
    
    // 检查资源路径
    const scriptMatches = content.match(/<script[^>]*src="([^"]+)"/g);
    const linkMatches = content.match(/<link[^>]*href="([^"]+)"/g);
    
    if (scriptMatches) {
      console.log('   📜 Script 标签:');
      scriptMatches.forEach(match => {
        const src = match.match(/src="([^"]+)"/)[1];
        console.log(`      ${src}`);
      });
    }
    
    if (linkMatches) {
      console.log('   🎨 Link 标签:');
      linkMatches.forEach(match => {
        const href = match.match(/href="([^"]+)"/)[1];
        console.log(`      ${href}`);
      });
    }
    console.log('');
  }
} else {
  console.log('⚠️  build 目录不存在，请先运行: npm run build\n');
}

// 检查环境变量使用
console.log('🔧 环境变量使用检查:');
const srcDir = path.join('.', 'src');
function findEnvUsage(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory() && !filePath.includes('node_modules')) {
      findEnvUsage(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('process.env.PUBLIC_URL')) {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('process.env.PUBLIC_URL')) {
            console.log(`   📄 ${filePath}:${index + 1}`);
            console.log(`      ${line.trim()}`);
          }
        });
      }
    }
  });
}

findEnvUsage(srcDir);
console.log('');

// 建议
console.log('💡 建议:');
console.log('   1. 清除 build 目录: rm -rf build');
console.log('   2. 重新构建: npm run build');
console.log('   3. 检查构建输出: ls -la build/');
console.log('   4. 部署: npm run deploy');
console.log('   5. 等待几分钟后访问: https://jsheng0722.github.io');
console.log('   6. 清除浏览器缓存并强制刷新\n');
