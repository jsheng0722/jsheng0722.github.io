# GitHub Pages 部署问题修复指南

## 问题诊断

根据诊断脚本的结果，可能的原因包括：

### 1. GitHub Pages 分支设置问题 ⚠️ **最可能的原因**

如果您的默认分支改为了 `main`，但 GitHub Pages 仍然从 `gh-pages` 分支读取，这是正常的。但需要确认设置：

**检查步骤：**
1. 访问：https://github.com/jsheng0722/jsheng0722.github.io/settings/pages
2. 确认 **Source** 设置为 "Deploy from a branch"
3. 确认 **Branch** 设置为 `gh-pages`（不是 `main`）
4. 确认 **Folder** 设置为 `/ (root)`

### 2. 构建没有包含最新代码

**解决步骤：**
```bash
# 1. 删除旧的构建
Remove-Item -Recurse -Force build

# 2. 重新生成架构数据
npm run generate-architecture

# 3. 重新构建
npm run build

# 4. 检查构建输出
Get-ChildItem build | Select-Object Name, LastWriteTime
```

### 3. 部署没有成功推送到远程

**解决步骤：**
```bash
# 1. 确保所有更改已提交
git status

# 2. 如果有未提交的更改，先提交
git add .
git commit -m "Update architecture and fix deployment"

# 3. 推送到main分支
git push origin main

# 4. 重新部署到gh-pages
npm run deploy

# 5. 检查部署输出，确认没有错误
```

### 4. GitHub Pages 缓存

GitHub Pages 可能需要 5-10 分钟来更新。

**解决步骤：**
1. 等待 5-10 分钟
2. 清除浏览器缓存：
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
3. 尝试无痕模式访问
4. 检查 URL：https://jsheng0722.github.io（不是 /home）

### 5. 检查 gh-pages 分支内容

**验证步骤：**
```bash
# 1. 获取远程gh-pages分支
git fetch origin gh-pages

# 2. 切换到gh-pages分支查看内容
git checkout gh-pages

# 3. 检查文件
ls -la
cat index.html | Select-String "architecture"

# 4. 检查文件修改时间
Get-ChildItem | Select-Object Name, LastWriteTime

# 5. 切换回main分支
git checkout main
```

## 快速修复命令

运行以下命令序列：

```bash
# 1. 清理并重新构建
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
npm run generate-architecture
npm run build

# 2. 检查构建是否成功
if (Test-Path build/index.html) {
    Write-Host "✅ 构建成功"
    $stats = Get-Item build/index.html
    Write-Host "修改时间: $($stats.LastWriteTime)"
} else {
    Write-Host "❌ 构建失败"
}

# 3. 部署
npm run deploy

# 4. 等待并检查
Write-Host "等待 5-10 分钟后访问: https://jsheng0722.github.io"
```

## 常见问题

### Q: 为什么首页显示 /home 而不是 /？

A: 检查 `src/App.js` 中的路由配置。根路径 `/` 应该指向 `HomePage`（NewHome组件）。

### Q: npm start 和部署的内容不一致？

A: 
- `npm start` 使用开发模式，可能有热重载
- 部署使用生产构建，需要运行 `npm run build`
- 确保构建成功后再部署

### Q: 如何确认部署成功？

A:
1. 运行 `npm run deploy` 后，检查输出是否有错误
2. 访问 https://github.com/jsheng0722/jsheng0722.github.io/tree/gh-pages 查看gh-pages分支
3. 等待几分钟后访问 https://jsheng0722.github.io

## 验证清单

- [ ] `build` 目录存在且包含最新文件
- [ ] `build/index.html` 修改时间是最近的
- [ ] `public/data/architecture.json` 存在且是最新的
- [ ] `.nojekyll` 文件存在于 `build` 目录
- [ ] `npm run deploy` 执行成功，无错误
- [ ] GitHub Pages 设置中 Branch 为 `gh-pages`
- [ ] 等待 5-10 分钟后访问网站
- [ ] 清除浏览器缓存后访问
