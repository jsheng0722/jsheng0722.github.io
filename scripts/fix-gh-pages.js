const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 诊断 GitHub Pages 404 问题\n');
console.log('='.repeat(60));
console.log('');

// 1. 检查构建文件
console.log('1️⃣  检查构建文件');
console.log('─'.repeat(60));

const buildDir = path.join(__dirname, '..', 'build');
const buildIndex = path.join(buildDir, 'index.html');
const buildNojekyll = path.join(buildDir, '.nojekyll');
const build404 = path.join(buildDir, '404.html');

if (fs.existsSync(buildIndex)) {
  const stats = fs.statSync(buildIndex);
  console.log('✅ build/index.html 存在');
  console.log(`   修改时间: ${stats.mtime.toLocaleString('zh-CN')}`);
  
  // 检查内容
  const content = fs.readFileSync(buildIndex, 'utf8');
  if (content.includes('<div id="root"></div>')) {
    console.log('   ✅ 包含 React 根元素');
  }
  if (content.includes('/static/js/')) {
    console.log('   ✅ 包含 JS 资源引用');
  }
} else {
  console.log('❌ build/index.html 不存在');
  console.log('   请先运行: npm run build');
  process.exit(1);
}

if (fs.existsSync(buildNojekyll)) {
  console.log('✅ build/.nojekyll 存在');
} else {
  console.log('⚠️  build/.nojekyll 不存在');
  console.log('   正在创建...');
  fs.writeFileSync(buildNojekyll, '');
  console.log('   ✅ 已创建');
}

if (fs.existsSync(build404)) {
  console.log('✅ build/404.html 存在');
} else {
  console.log('⚠️  build/404.html 不存在');
  const public404 = path.join(__dirname, '..', 'public', '404.html');
  if (fs.existsSync(public404)) {
    fs.copyFileSync(public404, build404);
    console.log('   ✅ 已从 public/404.html 复制');
  }
}
console.log('');

// 2. 检查 Git 状态
console.log('2️⃣  检查 Git 分支状态');
console.log('─'.repeat(60));

try {
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`当前分支: ${currentBranch}`);
  
  if (currentBranch !== 'main') {
    console.log('⚠️  建议在 main 分支上执行部署');
  }
  
  // 检查 gh-pages 分支
  try {
    const ghPagesCommits = execSync('git log gh-pages --oneline -3', { encoding: 'utf8' });
    console.log('\n本地 gh-pages 最新提交:');
    console.log(ghPagesCommits.split('\n').slice(0, 3).join('\n'));
  } catch (e) {
    console.log('⚠️  无法读取本地 gh-pages 分支');
  }
  
  try {
    const remoteGhPagesCommits = execSync('git log origin/gh-pages --oneline -3', { encoding: 'utf8' });
    console.log('\n远程 origin/gh-pages 最新提交:');
    console.log(remoteGhPagesCommits.split('\n').slice(0, 3).join('\n'));
  } catch (e) {
    console.log('⚠️  无法读取远程 gh-pages 分支');
  }
} catch (e) {
  console.log('⚠️  无法检查 Git 状态:', e.message);
}
console.log('');

// 3. 提供解决方案
console.log('3️⃣  解决方案');
console.log('─'.repeat(60));
console.log('');
console.log('问题分析:');
console.log('  • GitHub Pages 显示 404 说明 gh-pages 分支可能没有 index.html');
console.log('  • 或者 GitHub Pages 设置指向了错误的分支');
console.log('  • main 和 gh-pages 不同步是正常的（它们包含不同的内容）');
console.log('');
console.log('修复步骤:');
console.log('');
console.log('1. 确保在 main 分支:');
console.log('   git checkout main');
console.log('');
console.log('2. 清理并重新构建:');
console.log('   Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue');
console.log('   npm run predeploy');
console.log('');
console.log('3. 确认构建文件:');
console.log('   Test-Path build\\index.html');
console.log('   Test-Path build\\.nojekyll');
console.log('');
console.log('4. 部署到 gh-pages:');
console.log('   npm run deploy');
console.log('');
console.log('5. 检查 gh-pages 分支内容:');
console.log('   git checkout gh-pages');
console.log('   ls  # 应该看到 index.html, .nojekyll, static/ 等');
console.log('   git checkout main');
console.log('');
console.log('6. 如果仍然 404，强制推送:');
console.log('   git push origin gh-pages --force');
console.log('');
console.log('7. 检查 GitHub Pages 设置:');
console.log('   https://github.com/jsheng0722/jsheng0722.github.io/settings/pages');
console.log('   • Source 分支应该是 gh-pages');
console.log('   • 路径应该是 / (root)');
console.log('');
console.log('8. 等待 5-10 分钟，然后访问:');
console.log('   https://jsheng0722.github.io');
console.log('');

console.log('='.repeat(60));
