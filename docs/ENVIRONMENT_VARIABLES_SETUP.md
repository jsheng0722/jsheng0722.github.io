# 环境变量配置指南

## 📋 概述

本项目使用环境变量来配置天气 API 等功能。在部署到 GitHub Pages 和 Vercel 时，需要配置这些环境变量。

## 🔑 需要的环境变量

### 天气 API 配置

```env
REACT_APP_WEATHER_API_KEY=your_api_key_here
REACT_APP_WEATHER_API_URL=https://api.openweathermap.org/data/2.5
```

## 🚀 配置步骤

### 1. GitHub Actions 配置

#### 方法 1: 使用 GitHub Secrets（推荐）

1. 进入你的 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下 secrets：
   - **Name**: `REACT_APP_WEATHER_API_KEY`
   - **Value**: 你的 API 密钥
   - **Name**: `REACT_APP_WEATHER_API_URL`
   - **Value**: `https://api.openweathermap.org/data/2.5`

5. 保存后，GitHub Actions 会自动使用这些 secrets

#### 方法 2: 在 workflow 文件中直接设置（不推荐）

如果不想使用 secrets，可以在 `.github/workflows/deploy.yml` 中直接设置：

```yaml
env:
  CI: false
  REACT_APP_WEATHER_API_KEY: 'your_api_key_here'
  REACT_APP_WEATHER_API_URL: 'https://api.openweathermap.org/data/2.5'
```

⚠️ **注意**: 这种方法会将 API 密钥暴露在代码中，不推荐用于生产环境。

### 2. Vercel 配置

1. 访问：https://vercel.com/dashboard
2. 选择你的项目
3. 点击 **Settings** → **Environment Variables**
4. 添加以下环境变量：
   - **Key**: `REACT_APP_WEATHER_API_KEY`
   - **Value**: 你的 API 密钥
   - **Environment**: Production, Preview, Development（全选）
   - **Key**: `REACT_APP_WEATHER_API_URL`
   - **Value**: `https://api.openweathermap.org/data/2.5`
   - **Environment**: Production, Preview, Development（全选）

5. 保存后，Vercel 会在下次部署时使用这些变量

## 🔍 验证配置

### 检查 GitHub Actions

1. 推送到 GitHub 后，查看 Actions 日志
2. 在 "Build React app" 步骤中，确认环境变量已设置
3. 如果看到 API 调用成功，说明配置正确

### 检查 Vercel

1. 在 Vercel Dashboard 中查看部署日志
2. 确认构建过程中没有环境变量相关的错误
3. 访问部署的网站，测试天气功能是否正常

## ⚠️ 注意事项

### 安全性

- ✅ **使用 GitHub Secrets**：不要在代码中硬编码 API 密钥
- ✅ **不要提交 `.env` 文件**：确保 `.env` 在 `.gitignore` 中
- ✅ **定期轮换密钥**：定期更新 API 密钥以提高安全性

### 环境变量命名

- React 应用的环境变量必须以 `REACT_APP_` 开头
- 其他前缀的环境变量在构建时会被忽略

### 本地开发

在本地开发时，创建 `.env` 文件：

```env
REACT_APP_WEATHER_API_KEY=your_api_key_here
REACT_APP_WEATHER_API_URL=https://api.openweathermap.org/data/2.5
```

⚠️ **注意**: `.env` 文件已经在 `.gitignore` 中，不会被提交到 Git。

## 🛠️ 故障排除

### 问题 1: 环境变量未生效

**原因**: 环境变量可能未正确配置
**解决**:
1. 检查环境变量名称是否正确（必须以 `REACT_APP_` 开头）
2. 确认在 CI/CD 平台中已正确配置
3. 重新部署应用

### 问题 2: API 调用失败

**原因**: API 密钥可能无效或已过期
**解决**:
1. 检查 API 密钥是否正确
2. 确认 API 服务是否正常
3. 查看浏览器控制台的错误信息

### 问题 3: 本地正常但部署后失败

**原因**: 环境变量未在 CI/CD 中配置
**解决**:
1. 按照上述步骤配置 GitHub Secrets 或 Vercel 环境变量
2. 重新触发部署

---

**最后更新**: 2025-01-25  
**状态**: ✅ 环境变量配置指南完成
