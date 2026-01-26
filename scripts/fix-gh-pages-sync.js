const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 诊断 GitHub Pages 部署问题\n');
console.log('='.repeat(60));
console.log('');

// 1. 检查当前分支
console.log('1️⃣  检查当前 Git 状态');
console.log('─'.repeat(60));
try {
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`当前分支: ${currentBranch}`);
  
  const status = execSync('git status --short', { encoding: 'utf8' });
  if (status.trim()) {
    console.log('⚠️  有未提交的更改:');
    console.log(status);
  } else {
    console.log('✅ 工作目录干净');
  }
  
  // 检查分支是否分叉
  try {
    const branchInfo = execSync('git status -sb', { encoding: 'utf8' });
    if (branchInfo.includes('diverged')) {
      console.log('⚠️  本地和远程分支已分叉！');
      console.log('   这是导致 GitHub Pages 显示旧版本的主要原因');
    }
  } catch (e) {
    // 忽略错误
  }
} catch (e) {
  console.log('❌ 无法检查 Git 状态');
  console.log(e.message);
}
console.log('');

// 2. 检查 build 目录
console.log('2️⃣  检查构建文件');
console.log('─'.repeat(60));
const buildDir = path.join(__dirname, '..', 'build');
const buildIndex = path.join(buildDir, 'index.html');

if (fs.existsSync(buildIndex)) {
  const stats = fs.statSync(buildIndex);
  console.log('✅ build/index.html 存在');
  console.log(`📅 修改时间: ${stats.mtime.toLocaleString('zh-CN')}`);
  console.log(`📏 文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
  
  const content = fs.readFileSync(buildIndex, 'utf8');
  const jsMatch = content.match(/src="([^"]+)"/);
  if (jsMatch) {
    const jsPath = path.join(buildDir, jsMatch[1]);
    if (fs.existsSync(jsPath)) {
      const jsStats = fs.statSync(jsPath);
      console.log(`✅ JS 文件存在: ${jsMatch[1]} (${(jsStats.size / 1024).toFixed(2)} KB)`);
    }
  }
} else {
  console.log('❌ build/index.html 不存在');
  console.log('   请先运行: npm run build');
}
console.log('');

// 3. 检查本地和远程 gh-pages 分支的差异
console.log('3️⃣  检查分支差异');
console.log('─'.repeat(60));
try {
  const localCommits = execSync('git log gh-pages --oneline -3', { encoding: 'utf8' });
  console.log('本地 gh-pages 最新提交:');
  console.log(localCommits.split('\n').slice(0, 3).join('\n'));
  
  console.log('');
  const remoteCommits = execSync('git log origin/gh-pages --oneline -3', { encoding: 'utf8' });
  console.log('远程 origin/gh-pages 最新提交:');
  console.log(remoteCommits.split('\n').slice(0, 3).join('\n'));
  
  // 检查是否不同
  const localLatest = localCommits.split('\n')[0];
  const remoteLatest = remoteCommits.split('\n')[0];
  if (localLatest !== remoteLatest) {
    console.log('');
    console.log('⚠️  本地和远程分支不同步！');
    console.log('   GitHub Pages 使用的是远程分支的内容');
  }
} catch (e) {
  console.log('⚠️  无法检查分支差异');
  console.log(e.message);
}
console.log('');

// 4. 提供解决方案
console.log('4️⃣  解决方案');
console.log('─'.repeat(60));
console.log('');
console.log('问题原因:');
console.log('  • 本地 gh-pages 分支和远程 origin/gh-pages 分支已分叉');
console.log('  • GitHub Pages 使用远程分支的内容');
console.log('  • 本地构建的新内容没有推送到远程');
console.log('');
console.log('推荐解决方案（从 main 分支重新部署）:');
console.log('');
console.log('  1. 切换到 main 分支:');
console.log('     git checkout main');
console.log('');
console.log('  2. 确保代码是最新的:');
console.log('     git pull origin main');
console.log('');
console.log('  3. 清理并重新构建:');
console.log('     Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue');
console.log('     npm run generate-architecture');
console.log('     npm run build');
console.log('');
console.log('  4. 部署到 gh-pages:');
console.log('     npm run deploy');
console.log('');
console.log('  5. 强制推送（如果需要）:');
console.log('     git push origin gh-pages --force');
console.log('');
console.log('⚠️  注意: 使用 --force 会覆盖远程分支，请确保这是你想要的');
console.log('');

console.log('='.repeat(60));
