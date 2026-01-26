# 快速修复部署问题

## 当前情况

- 你在 `gh-pages` 分支上
- 有未提交的更改
- 本地和远程分支已分叉
- GitHub Pages 显示的是旧版本

## 快速修复步骤

### 步骤 1: 提交当前更改（如果需要）

如果你想保留当前的更改：

```powershell
git add .
git commit -m "Update before deployment"
```

或者，如果你想暂存更改（稍后恢复）：

```powershell
git stash
```

### 步骤 2: 清理并重新构建

```powershell
# 清理旧的构建
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue

# 生成架构数据
npm run generate-architecture

# 构建项目
npm run build
```

### 步骤 3: 部署并强制推送

```powershell
# 部署到 gh-pages（这会更新本地 gh-pages 分支）
npm run deploy

# 强制推送到远程（覆盖远程的旧版本）
git push origin gh-pages --force
```

## 或者使用自动化脚本

直接运行：

```powershell
.\scripts\force-deploy.ps1
```

## 验证

1. 等待 5-10 分钟
2. 访问 https://jsheng0722.github.io
3. 清除浏览器缓存（Ctrl+F5）

## 如果仍然显示旧版本

1. 检查 GitHub Pages 设置中的分支是否为 `gh-pages`
2. 检查远程分支的最新提交时间
3. 等待更长时间（有时需要 15-20 分钟）
4. 尝试使用无痕模式访问
