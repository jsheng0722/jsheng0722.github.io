# GitHub Actions 工作流程说明

## ❌ 不再需要本地构建和部署

使用 GitHub Actions 后，**不需要**在本地运行：
- ❌ `npm run build`（GitHub Actions 会自动构建）
- ❌ `npm run deploy`（已移除，GitHub Actions 会自动部署）

## ✅ 只需要推送代码

### 工作流程

```
1. 在本地修改代码
   ↓
2. git add .
   ↓
3. git commit -m "更新内容"
   ↓
4. git push origin main
   ↓
5. GitHub Actions 自动触发
   ↓
6. 自动构建和部署
   ↓
7. 网站自动更新（5-10分钟后）
```

## 🔍 如果推送后网站没有更新

### 检查 1: GitHub Actions 是否触发

1. 进入 GitHub 仓库
2. 点击 **Actions** 标签页
3. 查看是否有新的工作流运行

**如果没有工作流运行**：
- 检查是否推送到 `main` 分支
- 检查 `.github/workflows/deploy.yml` 是否存在

### 检查 2: GitHub Actions 是否成功

在 Actions 页面，查看最新工作流：

- ✅ **绿色 ✓** = 成功，等待 5-10 分钟让 GitHub Pages 更新
- ❌ **红色 ✗** = 失败，点击查看错误日志
- 🟡 **黄色 ⏳** = 正在运行，等待完成

### 检查 3: GitHub Pages Source 设置

1. 进入 **Settings** → **Pages**
2. 确认 Source 是 **"GitHub Actions"**（不是 "Deploy from a branch"）

### 检查 4: 手动触发部署

如果自动触发失败，可以手动触发：

1. 进入 **Actions** 标签页
2. 选择 "Deploy to GitHub Pages" 工作流
3. 点击 **"Run workflow"**
4. 选择 `main` 分支
5. 点击 **"Run workflow"**
6. 等待完成

## 📋 完整检查清单

推送代码后，确认：

- [ ] 代码已推送到 `main` 分支
- [ ] GitHub Actions 工作流已触发（Actions 标签页有新的运行）
- [ ] 工作流运行成功（绿色 ✓）
- [ ] GitHub Pages Source 设置为 "GitHub Actions"
- [ ] 等待了 5-10 分钟
- [ ] 清除了浏览器缓存
- [ ] 访问网站看到更新

## 🛠️ 故障排除

### 问题 1: 工作流没有触发

**可能原因**：
- 推送到错误的分支（应该是 `main`）
- `.github/workflows/deploy.yml` 文件不存在或格式错误

**解决**：
- 确认推送到 `main` 分支
- 检查 workflow 文件是否存在

### 问题 2: 工作流失败

**可能原因**：
- 构建错误（代码问题）
- 依赖安装失败
- 权限问题

**解决**：
- 查看 Actions 日志中的错误信息
- 根据错误修复代码
- 重新推送

### 问题 3: 工作流成功但网站没更新

**可能原因**：
- GitHub Pages 需要时间更新（5-10分钟）
- 浏览器缓存
- GitHub Pages Source 设置错误

**解决**：
- 等待 5-10 分钟
- 清除浏览器缓存
- 确认 Source 设置为 "GitHub Actions"

## 💡 最佳实践

1. **每次推送后**：
   - 检查 Actions 标签页
   - 确认工作流成功运行
   - 等待几分钟后访问网站

2. **如果工作流失败**：
   - 不要继续推送
   - 先修复错误
   - 确保工作流成功后再推送新代码

3. **验证部署**：
   - 使用无痕模式访问网站
   - 检查所有功能是否正常

---

**最后更新**: 2025-01-25  
**状态**: ✅ GitHub Actions 工作流程说明完成
