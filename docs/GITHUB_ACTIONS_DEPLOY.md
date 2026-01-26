# GitHub Actions 自动部署指南

本项目已配置 GitHub Actions 工作流，实现自动部署到 GitHub Pages。

## 🚀 快速开始

### 1. 启用 GitHub Pages

1. 进入你的 GitHub 仓库
2. 点击 **Settings** → **Pages**
3. 在 **Source** 部分，选择 **GitHub Actions**（而不是 "Deploy from a branch"）
4. 保存设置

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
5. **Build** - 构建 React 应用（设置 `CI=false` 避免构建错误）
6. **Upload artifact** - 上传构建产物
7. **Deploy** - 部署到 GitHub Pages

## 🔍 查看部署状态

1. 进入仓库的 **Actions** 标签页
2. 查看最新的工作流运行状态
3. 点击运行记录查看详细日志

## ⚠️ 注意事项

### 首次部署

- 首次部署可能需要几分钟时间
- 部署完成后，访问 `https://[你的用户名].github.io` 查看网站

### 分支同步问题

使用 GitHub Actions 后，不再需要手动管理 `gh-pages` 分支。GitHub Actions 会自动处理部署，避免了之前 `main` 和 `gh-pages` 分支不同步的问题。

### 旧部署方式

如果你之前使用 `npm run deploy`（gh-pages 包），现在可以：
- **保留**：作为备用部署方式
- **移除**：如果不再需要，可以从 `package.json` 中删除 `gh-pages` 依赖

## 🛠️ 故障排除

### 部署失败

1. 检查 **Actions** 标签页中的错误日志
2. 常见问题：
   - 构建错误：检查代码是否有语法错误
   - 权限问题：确保仓库设置中启用了 GitHub Pages
   - 环境变量：检查是否需要配置环境变量

### 网站未更新

1. 等待几分钟（GitHub Pages 需要时间更新）
2. 清除浏览器缓存
3. 检查部署是否成功（Actions 标签页）

### 404 错误

1. 确保 `public/404.html` 文件存在
2. 确保 `public/.nojekyll` 文件存在（禁用 Jekyll）
3. 检查 `package.json` 中的 `homepage` 字段是否正确

## 📝 工作流文件位置

工作流配置文件位于：
```
.github/workflows/deploy.yml
```

如需修改部署流程，可以编辑此文件。

## 🔄 与旧部署方式的对比

| 特性 | GitHub Actions | gh-pages 包 |
|------|---------------|-------------|
| 自动化 | ✅ 完全自动 | ⚠️ 需要手动运行 |
| 分支管理 | ✅ 自动处理 | ❌ 需要手动同步 |
| 构建环境 | ✅ 统一环境 | ⚠️ 依赖本地环境 |
| 部署历史 | ✅ 完整记录 | ⚠️ 仅 Git 历史 |
| 错误处理 | ✅ 详细日志 | ⚠️ 本地错误 |

## ✨ 优势

1. **自动化**：推送代码即自动部署
2. **一致性**：统一的构建环境，避免本地环境差异
3. **可追溯**：完整的部署历史和日志
4. **分支同步**：不再需要手动管理 `gh-pages` 分支
5. **安全性**：可以设置部署保护规则

---

**最后更新**: 2025-01-25  
**状态**: ✅ GitHub Actions 工作流已配置
