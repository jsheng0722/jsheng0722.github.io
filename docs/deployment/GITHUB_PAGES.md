# GitHub Pages 部署指南

本项目使用 GitHub Actions 自动部署到 GitHub Pages。

## 🚀 快速开始

### 1. 启用 GitHub Pages

1. 进入你的 GitHub 仓库
2. 点击 **Settings** → **Pages**
3. 在 **Source** 部分，选择 **GitHub Actions**（而不是 "Deploy from a branch"）
4. 保存设置

> ⚠️ **重要**：必须选择 "GitHub Actions" 作为 Source，否则会显示 README 而不是 React 应用！

### 2. 配置部署环境（可选但推荐）

1. 在仓库 **Settings** → **Environments** 中
2. 找到或创建 `github-pages` 环境
3. 添加部署保护规则：
   - 只允许 `main` 分支部署
   - 这样可以防止意外部署

### 3. 推送代码触发部署

```bash
# 提交并推送到 main 分支
git add .
git commit -m "Update: 更新内容"
git push origin main
```

推送后，GitHub Actions 会自动：
1. ✅ 检出代码
2. ✅ 安装依赖
3. ✅ 生成架构数据
4. ✅ 构建 React 应用
5. ✅ 部署到 GitHub Pages

## 📋 工作流说明

### 触发条件

- **自动触发**：推送到 `main` 分支时
- **手动触发**：在 GitHub Actions 页面点击 "Run workflow"

### 工作流步骤

1. **Checkout** - 检出仓库代码
2. **Setup Node.js** - 设置 Node.js 18 环境
3. **Install dependencies** - 安装 npm 依赖
4. **Generate architecture** - 生成项目架构数据
5. **Build** - 构建 React 应用
6. **Setup Pages** - 设置 GitHub Pages
7. **Upload artifact** - 上传构建产物
8. **Deploy** - 部署到 GitHub Pages

### 部署时间

- **构建时间**：约 2-5 分钟
- **部署时间**：约 5-10 分钟
- **总时间**：约 7-15 分钟

## 🔍 故障排除

### 问题 1: GitHub Pages 显示 README 而不是 React 应用

**原因**：GitHub Pages Source 设置错误

**解决方案**：
1. 进入仓库 Settings → Pages
2. 将 Source 改为 **"GitHub Actions"**
3. 保存并等待几分钟

### 问题 2: 推送后网站没有更新

**检查步骤**：

1. **检查 GitHub Actions 是否触发**
   - 进入仓库的 **Actions** 标签页
   - 查看是否有新的工作流运行

2. **检查 GitHub Actions 是否成功**
   - ✅ **绿色 ✓** = 成功，等待 5-10 分钟让 GitHub Pages 更新
   - ❌ **红色 ✗** = 失败，点击查看错误日志
   - 🟡 **黄色 ⏳** = 正在运行，等待完成

3. **清除浏览器缓存**
   - 使用无痕模式访问
   - 或清除浏览器缓存后刷新

### 问题 3: 构建失败

**常见原因**：
- ESLint 错误
- 语法错误
- 依赖安装失败
- 内存不足

**解决方案**：
- 查看 GitHub Actions 日志
- 参考 [构建错误排查](./BUILD_ERROR_TROUBLESHOOTING.md)

## 📝 注意事项

### 不再需要本地构建

使用 GitHub Actions 后，**不需要**在本地运行：
- ❌ `npm run build`（GitHub Actions 会自动构建）
- ❌ `npm run deploy`（已移除，GitHub Actions 会自动部署）

### 只需要推送代码

工作流程：
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

## 📚 相关文档

- [环境变量设置](./ENVIRONMENT_VARIABLES.md)
- [构建错误排查](./BUILD_ERROR_TROUBLESHOOTING.md)
- [Vercel 部署](./VERCEL.md)

---

**最后更新**: 2025-01-25  
**状态**: ✅ 自动部署已配置
