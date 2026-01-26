# GitHub Pages 404 问题修复指南

## 问题描述

1. **GitHub Pages 显示 404**: 访问 `https://jsheng0722.github.io` 显示 "File not found"
2. **本地构建正常**: `serve -s build` 显示最新内容
3. **分支不同步**: 每次 deploy 后，main 分支显示 "5 commits ahead and 2 commits behind gh-pages"

## 问题原因

### 1. gh-pages 分支未正确更新
- `gh-pages` 分支可能没有包含最新的构建文件
- 或者构建文件没有正确推送到远程

### 2. GitHub Pages 设置问题
- GitHub Pages 可能指向了错误的分支
- 或者路径配置不正确

### 3. 分支同步问题（正常现象）
- `main` 和 `gh-pages` 分支不同步是**正常的**
- `main` 分支包含源代码
- `gh-pages` 分支包含构建后的静态文件
- 但需要确保 `gh-pages` 包含最新的构建

## 解决方案

### 步骤 1: 检查当前状态

```powershell
# 检查当前分支
git branch --show-current

# 检查 gh-pages 分支状态
git log gh-pages --oneline -5
git log origin/gh-pages --oneline -5

# 检查构建文件
Test-Path build\index.html
Test-Path build\.nojekyll
```

### 步骤 2: 切换到 main 分支并更新

```powershell
# 切换到 main 分支
git checkout main

# 拉取最新代码
git pull origin main

# 确保工作目录干净
git status
```

### 步骤 3: 清理并重新构建

```powershell
# 清理旧的构建
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue

# 生成架构数据并构建
npm run predeploy

# 或者分步执行
npm run generate-architecture
npm run build
```

### 步骤 4: 确认构建文件

```powershell
# 检查关键文件
Test-Path build\index.html
Test-Path build\.nojekyll
Test-Path build\404.html

# 查看 index.html 内容（应该包含资源引用）
Get-Content build\index.html
```

### 步骤 5: 部署到 gh-pages

```powershell
# 部署
npm run deploy

# 检查部署是否成功
git log gh-pages --oneline -1
```

### 步骤 6: 强制推送（如果需要）

如果部署后 GitHub Pages 仍然显示旧内容，可能需要强制推送：

```powershell
# ⚠️ 警告：这会覆盖远程 gh-pages 分支
git push origin gh-pages --force
```

### 步骤 7: 检查 GitHub Pages 设置

1. 访问: https://github.com/jsheng0722/jsheng0722.github.io/settings/pages
2. 确认 **Source** 分支是 `gh-pages`
3. 确认路径是 `/ (root)`
4. 如果有 "Custom domain"，确保配置正确

### 步骤 8: 等待并验证

1. **等待 5-10 分钟**让 GitHub Pages 更新
2. 访问: https://jsheng0722.github.io
3. **清除浏览器缓存**或使用无痕模式
4. 检查浏览器开发者工具的网络标签，确认资源正确加载

## 关于分支同步

### 为什么 main 和 gh-pages 不同步？

这是**正常现象**：

- **main 分支**: 包含源代码（src/, public/, package.json 等）
- **gh-pages 分支**: 包含构建后的静态文件（build/ 目录的内容）

### 分支关系

```
main 分支 (源代码)
  ├── src/
  ├── public/
  ├── package.json
  └── ...

gh-pages 分支 (构建文件)
  ├── index.html
  ├── .nojekyll
  ├── static/
  └── ...
```

### 如何保持同步？

1. **开发时**: 在 `main` 分支工作
2. **部署时**: 运行 `npm run deploy`，这会：
   - 构建项目到 `build/` 目录
   - 将 `build/` 的内容推送到 `gh-pages` 分支
3. **不需要手动同步**: `gh-pages` 分支应该只包含构建文件

## 常见问题

### Q: 为什么 GitHub Pages 显示 404？

A: 可能的原因：
1. `gh-pages` 分支没有 `index.html` 文件
2. GitHub Pages 设置指向了错误的分支
3. `.nojekyll` 文件缺失，导致 Jekyll 处理文件出错
4. 资源路径配置不正确

### Q: 如何确认 gh-pages 分支的内容？

A:
```powershell
# 切换到 gh-pages 分支
git checkout gh-pages

# 查看文件列表
ls

# 确认 index.html 存在
Test-Path index.html

# 查看最新提交
git log --oneline -5

# 切换回 main
git checkout main
```

### Q: 部署后多久能看到更新？

A: 通常需要 5-10 分钟，有时可能需要更长时间。GitHub Pages 有缓存机制。

### Q: 如何强制 GitHub Pages 重新构建？

A:
1. 在 GitHub Pages 设置中，临时切换到其他分支，然后切换回 `gh-pages`
2. 或者推送一个空提交到 `gh-pages` 分支：
   ```powershell
   git checkout gh-pages
   git commit --allow-empty -m "Trigger rebuild"
   git push origin gh-pages
   git checkout main
   ```

## 验证清单

- [ ] `build/index.html` 存在且是最新的
- [ ] `build/.nojekyll` 存在
- [ ] `build/404.html` 存在
- [ ] `npm run deploy` 执行成功
- [ ] `gh-pages` 分支有最新提交
- [ ] GitHub Pages 设置中 Source 是 `gh-pages`
- [ ] 等待 5-10 分钟后访问网站
- [ ] 清除浏览器缓存后访问

## 快速修复命令

```powershell
# 完整修复流程
git checkout main
git pull origin main
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
npm run predeploy
npm run deploy
git push origin gh-pages --force  # 如果需要强制推送
```

---

**最后更新**: 2026-01-26
