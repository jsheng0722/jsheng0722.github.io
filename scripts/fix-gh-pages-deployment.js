const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 诊断 GitHub Pages 部署问题\n');
console.log('='.repeat(60));
console.log('');

// 1. 检查 build 目录
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
  
  // 检查 gh-pages 分支
  try {
    execSync('git show-ref --verify --quiet refs/heads/gh-pages', { stdio: 'ignore' });
    console.log('✅ 本地 gh-pages 分支存在');
    
    // 检查远程
    try {
      execSync('git show-ref --verify --quiet refs/remotes/origin/gh-pages', { stdio: 'ignore' });
      console.log('✅ 远程 origin/gh-pages 分支存在');
      
      // 检查分支差异
      const localCommit = execSync('git rev-parse gh-pages', { encoding: 'utf8' }).trim();
      const remoteCommit = execSync('git rev-parse origin/gh-pages', { encoding: 'utf8' }).trim();
      
      if (localCommit === remoteCommit) {
        console.log('✅ 本地和远程 gh-pages 分支同步');
      } else {
        console.log('⚠️  本地和远程 gh-pages 分支不同步');
        console.log(`   本地: ${localCommit.substring(0, 7)}`);
        console.log(`   远程: ${remoteCommit.substring(0, 7)}`);
      }
    } catch (e) {
      console.log('⚠️  远程 origin/gh-pages 分支不存在');
    }
  } catch (e) {
    console.log('⚠️  本地 gh-pages 分支不存在');
  }
  
  // 检查 main 和 gh-pages 的差异
  try {
    const mainCommit = execSync('git rev-parse main', { encoding: 'utf8' }).trim();
    const ghPagesCommit = execSync('git rev-parse gh-pages', { encoding: 'utf8' }).trim();
    
    if (mainCommit !== ghPagesCommit) {
      console.log('⚠️  main 和 gh-pages 分支不同');
      console.log('   这是正常的，gh-pages 应该包含构建文件');
    }
  } catch (e) {
    // 忽略
  }
} catch (e) {
  console.log('⚠️  无法检查 Git 状态');
  console.log(e.message);
}
console.log('');

// 3. 检查 package.json 配置
console.log('3️⃣  检查部署配置');
console.log('─'.repeat(60));
const packageJson = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJson)) {
  const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
  
  console.log(`homepage: ${pkg.homepage || '(未设置)'}`);
  console.log(`deploy 脚本: ${pkg.scripts?.deploy || '(未设置)'}`);
  console.log(`predeploy 脚本: ${pkg.scripts?.predeploy || '(未设置)'}`);
  
  if (pkg.homepage === 'https://jsheng0722.github.io') {
    console.log('✅ homepage 配置正确');
  } else {
    console.log('⚠️  homepage 配置可能不正确');
  }
}
console.log('');

// 4. 提供解决方案
console.log('4️⃣  解决方案');
console.log('─'.repeat(60));
console.log('');
console.log('问题分析:');
console.log('  1. GitHub Pages 显示 404 可能是因为:');
console.log('     - gh-pages 分支没有正确更新');
console.log('     - GitHub Pages 设置指向了错误的分支');
console.log('     - gh-pages 分支缺少 index.html');
console.log('');
console.log('  2. main 和 gh-pages 分支不同步是正常的:');
console.log('     - main 分支包含源代码');
console.log('     - gh-pages 分支包含构建后的静态文件');
console.log('     - 但应该确保 gh-pages 是最新的构建');
console.log('');
console.log('修复步骤:');
console.log('');
console.log('  步骤 1: 确保在 main 分支');
console.log('    git checkout main');
console.log('    git pull origin main');
console.log('');
console.log('  步骤 2: 清理并重新构建');
console.log('    Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue');
console.log('    npm run build');
console.log('');
console.log('  步骤 3: 确认构建文件');
console.log('    Test-Path build\\index.html');
console.log('    Test-Path build\\.nojekyll');
console.log('');
console.log('  步骤 4: 部署到 gh-pages');
console.log('    npm run deploy');
console.log('');
console.log('  步骤 5: 强制推送（如果需要）');
console.log('    git push origin gh-pages --force');
console.log('');
console.log('  步骤 6: 检查 GitHub Pages 设置');
console.log('    访问: https://github.com/jsheng0722/jsheng0722.github.io/settings/pages');
console.log('    确认 Source 分支是 gh-pages');
console.log('    确认路径是 / (root)');
console.log('');
console.log('  步骤 7: 等待并验证');
console.log('    等待 5-10 分钟');
console.log('    访问: https://jsheng0722.github.io');
console.log('    清除浏览器缓存');
console.log('');

console.log('='.repeat(60));
