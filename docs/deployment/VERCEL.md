# Vercel 部署指南

## 🚀 快速开始

Vercel 是一个现代化的静态网站部署平台，可以自动部署 React 应用。

### 1. 创建 Vercel 账户

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账户登录
3. 授权 Vercel 访问你的仓库

### 2. 导入项目

1. 在 Vercel 控制台点击 **"Add New Project"**
2. 选择你的 GitHub 仓库
3. Vercel 会自动检测 React 项目

### 3. 配置项目

Vercel 会自动读取 `vercel.json` 配置文件：

```json
{
  "buildCommand": "npm run generate-architecture && npm run build",
  "outputDirectory": "build",
  "devCommand": "npm start",
  "installCommand": "npm install",
  "framework": "create-react-app",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 4. 环境变量（可选）

如果需要配置环境变量：

1. 在项目设置中找到 **Environment Variables**
2. 添加变量：
   - `REACT_APP_WEATHER_API_KEY`
   - `REACT_APP_WEATHER_API_URL`
3. 重新部署

### 5. 部署

点击 **"Deploy"**，Vercel 会自动：
- 安装依赖
- 运行构建命令
- 部署到 CDN

## 📋 配置说明

### vercel.json

- **buildCommand**: 构建前生成架构数据
- **outputDirectory**: 构建输出目录（build）
- **rewrites**: SPA 路由重写规则

### 自动部署

- **推送触发**: 推送到 `main` 分支自动部署
- **预览部署**: Pull Request 自动创建预览链接
- **环境隔离**: 生产环境和预览环境分离

## 🔍 故障排除

### 构建失败

1. 检查构建日志
2. 确认 `vercel.json` 配置正确
3. 检查环境变量是否设置

### 路由问题

确保 `vercel.json` 中有正确的 rewrites 配置。

## 📚 相关文档

- [GitHub Pages 部署](./GITHUB_PAGES.md)
- [环境变量设置](./ENVIRONMENT_VARIABLES.md)

---

**最后更新**: 2025-01-25  
**状态**: ✅ Vercel 部署已配置
