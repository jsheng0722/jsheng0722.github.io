# 天气 API 配置指南

## 📋 概述

静态网页**完全可以**接入天气 API！本项目已经实现了天气 API 的集成，只需要配置 API 密钥即可使用。

## ✅ 为什么静态网页可以接入 API？

1. **CORS 支持**：大部分天气 API 都支持跨域请求（CORS）
2. **浏览器 fetch**：现代浏览器支持直接调用外部 API
3. **无需后端**：不需要服务器作为中间层

## 🚀 快速开始

### 步骤 1: 选择天气 API 服务

#### 推荐选项：

**1. OpenWeatherMap**（全球通用）
- 网站: https://openweathermap.org/
- 免费额度: 1000 次/天
- 特点: 全球覆盖，数据准确
- 注册: 简单快速

**2. 和风天气**（中国地区推荐）
- 网站: https://dev.qweather.com/
- 免费额度: 1000 次/天
- 特点: 中国地区数据详细，中文优化

### 步骤 2: 获取 API Key

1. 访问上述网站并注册账号
2. 创建应用获取 API Key
3. 记录下你的 API Key（不要泄露）

### 步骤 3: 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# OpenWeatherMap 配置
REACT_APP_WEATHER_API_KEY=你的API密钥
REACT_APP_WEATHER_API_URL=https://api.openweathermap.org/data/2.5
```

**⚠️ 重要**：
- `.env` 文件不会被提交到 Git（已在 .gitignore 中）
- 不要在代码中硬编码 API Key
- 重启开发服务器使环境变量生效

### 步骤 4: 使用天气组件

项目中已经有实现好的组件：

```javascript
import OptimizedWeather from './components/Weather/OptimizedWeather';

// 在页面中使用
<OptimizedWeather />
```

## 🔧 当前实现特性

✅ **自动缓存**：10分钟缓存，减少API调用  
✅ **错误处理**：API失败时自动降级到模拟数据  
✅ **多语言支持**：支持中文天气描述  
✅ **响应式设计**：适配移动端和桌面端

## 📝 代码位置

- **API管理器**: `src/utils/WeatherAPI.js`
- **天气组件**: `src/components/Weather/OptimizedWeather.js`
- **原始组件**: `src/components/Weather/Weather.js`（使用模拟数据）

## ⚠️ 注意事项

### 1. CORS 问题
如果遇到 CORS 错误，可以选择：
- 使用支持 CORS 的 API（如 OpenWeatherMap）
- 或者通过后端代理（但这需要服务器）

### 2. API 限额
- 免费API通常有调用限制（如1000次/天）
- 项目已实现缓存机制，自动减少调用次数

### 3. API Key 安全
- ✅ 使用环境变量存储
- ✅ 不要提交到 Git
- ❌ 不要在代码中硬编码

## 🎯 测试

配置完成后，运行项目：

```bash
npm start
```

访问包含天气组件的页面，应该能看到真实的天气数据。

## 📚 相关文档

- OpenWeatherMap API 文档: https://openweathermap.org/api
- 和风天气 API 文档: https://dev.qweather.com/docs/api/

