#!/usr/bin/env node

/**
 * 部署状态检查脚本
 * 检查 GitHub Pages 部署的相关配置和状态
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 检查部署状态...\n');

// 检查 package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log('📦 部署配置:');
console.log(`   homepage: ${packageJson.homepage}`);
console.log(`   部署脚本: ${packageJson.scripts.deploy}`);
console.log('');

// 检查 build 目录
const buildDir = path.join('.', 'build');
if (fs.existsSync(buildDir)) {
  console.log('✅ build 目录存在');
  const buildFiles = fs.readdirSync(buildDir);
  console.log(`   包含 ${buildFiles.length} 个文件/目录\n`);
} else {
  console.log('❌ build 目录不存在\n');
}

// 检查 .nojekyll
const nojekyllFiles = [
  path.join('public', '.nojekyll'),
  path.join('.', '.nojekyll'),
  path.join('build', '.nojekyll')
];
console.log('📄 .nojekyll 文件:');
nojekyllFiles.forEach(p => {
  const exists = fs.existsSync(p);
  console.log(`   ${exists ? '✅' : '❌'} ${p}`);
});
console.log('');

// 检查 Git 状态
try {
  console.log('🔧 Git 状态:');
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`   当前分支: ${currentBranch}`);
  
  const hasChanges = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  if (hasChanges) {
    console.log('   ⚠️  有未提交的更改');
  } else {
    console.log('   ✅ 工作目录干净');
  }
  
  // 检查 gh-pages 分支
  try {
    const ghPagesExists = execSync('git ls-remote --heads origin gh-pages', { encoding: 'utf8' }).trim();
    if (ghPagesExists) {
      console.log('   ✅ gh-pages 分支存在于远程');
      
      // 获取 gh-pages 的最新提交
      const ghPagesCommit = execSync('git ls-remote origin gh-pages', { encoding: 'utf8' }).trim().split('\t')[0];
      console.log(`   gh-pages 最新提交: ${ghPagesCommit.substring(0, 7)}`);
    } else {
      console.log('   ❌ gh-pages 分支不存在于远程');
    }
  } catch (e) {
    console.log('   ⚠️  无法检查 gh-pages 分支');
  }
  
  // 检查远程仓库
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    console.log(`   远程仓库: ${remoteUrl}`);
  } catch (e) {
    console.log('   ⚠️  无法获取远程仓库信息');
  }
  
} catch (e) {
  console.log('   ⚠️  无法检查 Git 状态');
}
console.log('');

// 检查 build/index.html 中的资源路径
const indexHtml = path.join(buildDir, 'index.html');
if (fs.existsSync(indexHtml)) {
  const content = fs.readFileSync(indexHtml, 'utf8');
  console.log('📄 build/index.html 资源路径:');
  
  const scriptMatches = content.match(/<script[^>]*src="([^"]+)"/g);
  const linkMatches = content.match(/<link[^>]*href="([^"]+)"/g);
  
  if (scriptMatches) {
    scriptMatches.forEach(match => {
      const src = match.match(/src="([^"]+)"/)[1];
      const isAbsolute = src.startsWith('http');
      const isRelative = src.startsWith('/');
      console.log(`   📜 ${src}`);
      console.log(`      ${isAbsolute ? '绝对路径' : isRelative ? '相对路径（根）' : '相对路径'}`);
    });
  }
  
  if (linkMatches) {
    linkMatches.forEach(match => {
      const href = match.match(/href="([^"]+)"/)[1];
      const isAbsolute = href.startsWith('http');
      const isRelative = href.startsWith('/');
      console.log(`   🎨 ${href}`);
      console.log(`      ${isAbsolute ? '绝对路径' : isRelative ? '相对路径（根）' : '相对路径'}`);
    });
  }
  console.log('');
}

// 诊断建议
console.log('💡 诊断建议:');
console.log('');
console.log('1. 检查 GitHub Pages 设置:');
console.log('   - 访问 https://github.com/jsheng0722/jsheng0722.github.io/settings/pages');
console.log('   - 确认 Source 设置为 "Deploy from a branch"');
console.log('   - 确认 Branch 设置为 "gh-pages"');
console.log('   - 确认 Folder 设置为 "/ (root)"');
console.log('');
console.log('2. 如果设置正确，尝试重新部署:');
console.log('   npm run build');
console.log('   npm run deploy');
console.log('');
console.log('3. 检查部署后的内容:');
console.log('   git checkout gh-pages');
console.log('   ls -la');
console.log('   cat index.html');
console.log('');
console.log('4. 清除浏览器缓存并强制刷新:');
console.log('   - Windows: Ctrl + Shift + R');
console.log('   - Mac: Cmd + Shift + R');
console.log('');
console.log('5. 等待几分钟让 GitHub Pages 更新（可能需要 1-10 分钟）');
console.log('');
