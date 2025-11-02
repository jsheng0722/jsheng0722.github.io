# 天气API快速配置指南

## 🚀 3步获取真实天气数据

### 步骤 1: 获取免费的 OpenWeatherMap API Key

1. **访问**: https://openweathermap.org/api
2. **注册账号**（免费）
3. **获取 API Key**:
   - 登录后，访问: https://home.openweathermap.org/api_keys
   - 点击 "Create key" 或使用默认的 key
   - **复制你的 API Key**（类似: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`）

### 步骤 2: 创建 `.env` 文件

在项目根目录（与 `package.json` 同级）创建文件名为 `.env` 的文件：

**Windows PowerShell:**
```powershell
New-Item -Path .env -ItemType File
```

**或者手动创建:**
1. 在项目根目录新建文件
2. 文件名为 `.env`（注意前面有点）
3. 内容如下：

```env
REACT_APP_WEATHER_API_KEY=你的API密钥
REACT_APP_WEATHER_API_URL=https://api.openweathermap.org/data/2.5
```

**示例**（将 `your-api-key-here` 替换为你的真实 API Key）：
```env
REACT_APP_WEATHER_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
REACT_APP_WEATHER_API_URL=https://api.openweathermap.org/data/2.5
```

### 步骤 3: 重启开发服务器

```bash
# 停止当前服务器 (Ctrl + C)
# 然后重新启动
npm start
```

## ✅ 验证配置

1. 打开浏览器访问首页
2. 查看天气组件
3. 应该显示 **真实的奥马哈天气数据**
4. 如果显示 "模拟数据" 标签，说明配置有问题

## 🔍 故障排除

### 问题1: 仍然显示模拟数据
- ✅ 检查 `.env` 文件是否在项目根目录
- ✅ 检查 API Key 是否正确（没有多余空格）
- ✅ 确认已重启开发服务器
- ✅ 检查浏览器控制台是否有错误

### 问题2: API调用失败
- ✅ API Key 可能需要几分钟才生效
- ✅ 检查网络连接
- ✅ 查看浏览器控制台的错误信息

### 问题3: 找不到城市
- ✅ 尝试使用: `Omaha, NE, US` 或 `Omaha, Nebraska, US`
- ✅ OpenWeatherMap 支持全球城市

## 📞 需要帮助？

如果遇到问题，检查：
1. `.env` 文件位置正确
2. API Key 格式正确（无空格）
3. 已重启开发服务器
4. 浏览器控制台错误信息

