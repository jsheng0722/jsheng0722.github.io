# GitHub Pages 部署同步问题修复指南

## 问题描述

`serve -s build` 显示的页面和 GitHub Pages 上部署的不一样，GitHub 上显示的一直是旧版本。

## 问题原因

- 本地 `gh-pages` 分支和远程 `origin/gh-pages` 分支已分叉
- GitHub Pages 使用远程分支的内容
- 本地构建的新内容没有正确推送到远程

## 解决方案

### 方案 1: 从 main 分支重新部署（推荐）

这是最安全和推荐的方法：

```powershell
# 1. 切换到 main 分支
git checkout main

# 2. 拉取最新代码（如果有）
git pull origin main

# 3. 清理旧的构建文件
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue

# 4. 生成架构数据并构建
npm run generate-architecture
npm run build

# 5. 部署到 gh-pages
npm run deploy
```

### 方案 2: 强制推送当前 gh-pages 分支

如果确定本地的内容是正确的，可以强制推送：

```powershell
# 1. 确保构建是最新的
npm run generate-architecture
npm run build

# 2. 部署（这会更新本地 gh-pages 分支）
npm run deploy

# 3. 强制推送到远程
git push origin gh-pages --force
```

⚠️ **警告**: 使用 `--force` 会覆盖远程分支，请确保这是你想要的。

### 方案 3: 使用自动化脚本

运行提供的 PowerShell 脚本：

```powershell
.\scripts\force-deploy.ps1
```

这个脚本会：
1. 检查当前分支状态
2. 清理旧的构建文件
3. 生成架构数据
4. 构建项目
5. 部署到 gh-pages
6. 可选：强制推送到远程

## 验证部署

部署完成后：

1. **等待 5-10 分钟**让 GitHub Pages 更新
2. **访问网站**: https://jsheng0722.github.io
3. **清除浏览器缓存**或使用无痕模式访问
4. **检查 GitHub Pages 设置**: 
   - https://github.com/jsheng0722/jsheng0722.github.io/settings/pages
   - 确认 Source 分支是 `gh-pages`
   - 确认路径是 `/ (root)`

## 常见问题

### Q: 为什么 `serve -s build` 和 GitHub Pages 显示不同？

A: 
- `serve -s build` 使用本地 `build` 目录的内容
- GitHub Pages 使用远程 `origin/gh-pages` 分支的内容
- 如果本地构建没有推送到远程，就会出现不一致

### Q: 部署后多久能看到更新？

A: 通常需要 5-10 分钟，有时可能需要更长时间。GitHub Pages 有缓存机制。

### Q: 如何确认部署成功？

A:
1. 检查 `npm run deploy` 的输出是否有错误
2. 访问 GitHub 仓库的 `gh-pages` 分支：
   - https://github.com/jsheng0722/jsheng0722.github.io/tree/gh-pages
3. 查看最新的提交时间
4. 等待后访问网站

### Q: 仍然显示旧版本怎么办？

A:
1. 清除浏览器缓存（Ctrl+F5）
2. 使用无痕模式访问
3. 检查 GitHub Pages 设置中的分支配置
4. 确认 `gh-pages` 分支的最新提交时间
5. 等待更长时间（有时需要 15-20 分钟）

## 预防措施

为了避免将来出现类似问题：

1. **始终从 main 分支部署**：不要在 `gh-pages` 分支上直接修改
2. **使用 npm run deploy**：这个命令会自动处理部署流程
3. **检查部署输出**：确保没有错误信息
4. **定期检查同步**：确保本地和远程分支同步
