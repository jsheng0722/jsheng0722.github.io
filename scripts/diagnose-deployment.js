#!/usr/bin/env node

/**
 * 部署诊断脚本
 * 检查为什么部署内容没有更新
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 诊断部署问题...\n');

// 1. 检查构建目录
console.log('1️⃣ 检查构建目录:');
const buildDir = path.join('.', 'build');
if (fs.existsSync(buildDir)) {
  const buildFiles = fs.readdirSync(buildDir);
  console.log(`   ✅ build 目录存在，包含 ${buildFiles.length} 个文件/目录`);
  
  // 检查 index.html 的修改时间
  const indexHtml = path.join(buildDir, 'index.html');
  if (fs.existsSync(indexHtml)) {
    const stats = fs.statSync(indexHtml);
    console.log(`   📄 index.html 最后修改时间: ${stats.mtime.toLocaleString()}`);
    
    // 读取 index.html 内容，检查是否有架构相关的引用
    const content = fs.readFileSync(indexHtml, 'utf8');
    if (content.includes('architecture')) {
      console.log('   ✅ index.html 包含架构相关内容');
    } else {
      console.log('   ⚠️  index.html 不包含架构相关内容');
    }
  } else {
    console.log('   ❌ build/index.html 不存在');
  }
} else {
  console.log('   ❌ build 目录不存在');
  console.log('   💡 运行: npm run build');
}
console.log('');

// 2. 检查架构数据文件
console.log('2️⃣ 检查架构数据文件:');
const archDataPath = path.join('public', 'data', 'architecture.json');
if (fs.existsSync(archDataPath)) {
  const stats = fs.statSync(archDataPath);
  console.log(`   ✅ architecture.json 存在`);
  console.log(`   📅 最后修改时间: ${stats.mtime.toLocaleString()}`);
  
  try {
    const data = JSON.parse(fs.readFileSync(archDataPath, 'utf8'));
    console.log(`   📊 包含 ${data.routes?.length || 0} 个路由`);
    console.log(`   📊 生成时间: ${data.generatedAt || '未知'}`);
  } catch (e) {
    console.log(`   ⚠️  无法解析 JSON: ${e.message}`);
  }
} else {
  console.log('   ❌ architecture.json 不存在');
  console.log('   💡 运行: npm run generate-architecture');
}
console.log('');

// 3. 检查 Git 状态
console.log('3️⃣ 检查 Git 状态:');
try {
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`   当前分支: ${currentBranch}`);
  
  const hasChanges = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  if (hasChanges) {
    console.log('   ⚠️  有未提交的更改:');
    hasChanges.split('\n').slice(0, 5).forEach(line => {
      console.log(`      ${line}`);
    });
    if (hasChanges.split('\n').length > 5) {
      console.log(`      ... 还有 ${hasChanges.split('\n').length - 5} 个更改`);
    }
  } else {
    console.log('   ✅ 工作目录干净');
  }
  
  // 检查 gh-pages 分支
  try {
    const ghPagesInfo = execSync('git ls-remote origin gh-pages', { encoding: 'utf8' }).trim();
    if (ghPagesInfo) {
      const commitHash = ghPagesInfo.split('\t')[0];
      console.log(`   ✅ gh-pages 分支存在于远程`);
      console.log(`   📝 最新提交: ${commitHash.substring(0, 7)}`);
      
      // 检查本地是否有 gh-pages 分支
      try {
        const localGhPages = execSync('git branch -a | grep gh-pages', { encoding: 'utf8' }).trim();
        if (localGhPages) {
          console.log(`   📍 本地分支: ${localGhPages}`);
        }
      } catch (e) {
        // 忽略错误
      }
    } else {
      console.log('   ❌ gh-pages 分支不存在于远程');
    }
  } catch (e) {
    console.log('   ⚠️  无法检查 gh-pages 分支');
  }
  
  // 检查最近的提交
  try {
    const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
    console.log(`   📝 当前分支最新提交: ${lastCommit}`);
  } catch (e) {
    // 忽略错误
  }
  
} catch (e) {
  console.log('   ⚠️  无法检查 Git 状态');
}
console.log('');

// 4. 检查 package.json 配置
console.log('4️⃣ 检查部署配置:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(`   homepage: ${packageJson.homepage}`);
console.log(`   predeploy: ${packageJson.scripts.predeploy}`);
console.log(`   deploy: ${packageJson.scripts.deploy}`);
console.log('');

// 5. 检查 .nojekyll 文件
console.log('5️⃣ 检查 .nojekyll 文件:');
const nojekyllPaths = [
  { path: path.join('public', '.nojekyll'), name: 'public/.nojekyll' },
  { path: path.join('.', '.nojekyll'), name: '.nojekyll (根目录)' },
  { path: path.join('build', '.nojekyll'), name: 'build/.nojekyll' }
];

nojekyllPaths.forEach(({ path: p, name }) => {
  const exists = fs.existsSync(p);
  console.log(`   ${exists ? '✅' : '❌'} ${name}`);
});
console.log('');

// 6. 诊断建议
console.log('💡 诊断建议:\n');
console.log('如果部署内容没有更新，可能的原因：\n');
console.log('1. GitHub Pages 设置问题:');
console.log('   - 访问: https://github.com/jsheng0722/jsheng0722.github.io/settings/pages');
console.log('   - 确认 Source 设置为 "Deploy from a branch"');
console.log('   - 确认 Branch 设置为 "gh-pages" (不是 main)');
console.log('   - 确认 Folder 设置为 "/ (root)"');
console.log('');
console.log('2. 构建没有包含最新更改:');
console.log('   - 删除 build 目录: Remove-Item -Recurse -Force build');
console.log('   - 重新生成架构数据: npm run generate-architecture');
console.log('   - 重新构建: npm run build');
console.log('   - 检查 build/index.html 的修改时间');
console.log('');
console.log('3. 部署没有推送到远程:');
console.log('   - 运行: npm run deploy');
console.log('   - 检查输出是否有错误');
console.log('   - 确认 gh-pages 分支已更新');
console.log('');
console.log('4. GitHub Pages 缓存:');
console.log('   - 等待 5-10 分钟让 GitHub Pages 更新');
console.log('   - 清除浏览器缓存 (Ctrl+Shift+R)');
console.log('   - 尝试无痕模式访问');
console.log('');
console.log('5. 检查 gh-pages 分支内容:');
console.log('   - git fetch origin gh-pages');
console.log('   - git checkout gh-pages');
console.log('   - ls -la (检查文件)');
console.log('   - cat index.html (检查内容)');
console.log('   - git checkout main (切换回主分支)');
console.log('');
