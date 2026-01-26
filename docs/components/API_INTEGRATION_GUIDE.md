# 天气API集成指南

## 🌐 推荐的免费天气API

### 1. OpenWeatherMap (推荐)
- **网站**: https://openweathermap.org/
- **免费额度**: 1000次/天
- **特点**: 全球覆盖，数据准确
- **语言**: 支持中文

### 2. 和风天气
- **网站**: https://dev.qweather.com/
- **免费额度**: 1000次/天
- **特点**: 中国地区数据详细
- **语言**: 中文优化

### 3. 心知天气
- **网站**: https://www.seniverse.com/
- **免费额度**: 400次/天
- **特点**: 简单易用
- **语言**: 中文

## 🔧 集成步骤

### 步骤1: 注册并获取API密钥

以OpenWeatherMap为例：
1. 访问 https://openweathermap.org/
2. 注册账号
3. 获取API Key
4. 记录API Key（不要泄露）

### 步骤2: 创建环境变量文件

在项目根目录创建 `.env` 文件：
```env
REACT_APP_WEATHER_API_KEY=your_api_key_here
REACT_APP_WEATHER_API_URL=https://api.openweathermap.org/data/2.5
```

⚠️ 注意：将 `.env` 添加到 `.gitignore` 中

### 步骤3: 修改Weather组件

替换模拟数据为真实API调用：

```javascript
import React, { useState, useEffect } from 'react';

function Weather() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('Beijing');

  useEffect(() => {
    fetchWeatherData();
  }, [location]);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);

    try {
      const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
      const API_URL = process.env.REACT_APP_WEATHER_API_URL;

      // 当前天气
      {% raw %}
      const currentResponse = await fetch(
        `${API_URL}/weather?q=${location}&appid=${API_KEY}&lang=zh_cn&units=metric`
      );
      {% endraw %}
      const currentData = await currentResponse.json();

      // 天气预报
      {% raw %}
      const forecastResponse = await fetch(
        `${API_URL}/forecast?q=${location}&appid=${API_KEY}&lang=zh_cn&units=metric`
      );
      {% endraw %}
      const forecastData = await forecastResponse.json();

      // 转换数据格式
      const weatherInfo = {
        location: currentData.name,
        temperature: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),
        condition: mapWeatherCondition(currentData.weather[0].main),
        conditionText: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6),
        pressure: currentData.main.pressure,
        visibility: Math.round(currentData.visibility / 1000),
        forecast: processForecast(forecastData.list),
        hourly: processHourly(forecastData.list),
        sunrise: formatTime(currentData.sys.sunrise),
        sunset: formatTime(currentData.sys.sunset),
        lastUpdate: new Date().toLocaleTimeString('zh-CN')
      };

      setWeatherData(weatherInfo);
      setLoading(false);
    } catch (err) {
      console.error('获取天气数据失败:', err);
      setError('无法获取天气数据');
      setLoading(false);
    }
  };

  // 工具函数
  const mapWeatherCondition = (condition) => {
    const mapping = {
      'Clear': 'sunny',
      'Clouds': 'cloudy',
      'Rain': 'rainy',
      'Snow': 'snowy',
      'Thunderstorm': 'thunderstorm'
    };
    return mapping[condition] || 'sunny';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const processForecast = (list) => {
    // 处理预报数据
    const daily = [];
    const days = ['今天', '明天', '后天', '周四', '周五'];
    
    for (let i = 0; i < 5; i++) {
      const dayData = list[i * 8]; // 每8个数据点代表一天
      if (dayData) {
        daily.push({
          day: days[i],
          high: Math.round(dayData.main.temp_max),
          low: Math.round(dayData.main.temp_min),
          condition: mapWeatherCondition(dayData.weather[0].main),
          icon: getWeatherEmoji(dayData.weather[0].main)
        });
      }
    }
    return daily;
  };

  const processHourly = (list) => {
    // 处理逐小时数据
    return list.slice(0, 6).map(item => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      temp: Math.round(item.main.temp),
      condition: getWeatherEmoji(item.weather[0].main)
    }));
  };

  const getWeatherEmoji = (condition) => {
    const emojis = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Snow': '❄️',
      'Thunderstorm': '⛈️'
    };
    return emojis[condition] || '☀️';
  };

  // 渲染组件...
}
```

## 📋 环境配置

### .env 文件示例
```env
# OpenWeatherMap API
REACT_APP_WEATHER_API_KEY=your_openweathermap_key
REACT_APP_WEATHER_API_URL=https://api.openweathermap.org/data/2.5

# 或使用和风天气
REACT_APP_QWEATHER_API_KEY=your_qweather_key
REACT_APP_QWEATHER_API_URL=https://devapi.qweather.com/v7
```

### .gitignore 配置
确保 `.env` 在 `.gitignore` 中：
```
# 环境变量
.env
.env.local
.env.development
.env.production
```

## 🔐 安全注意事项

1. **不要提交API密钥**: 使用环境变量
2. **限制API调用**: 实现缓存机制
3. **错误处理**: 优雅地处理API失败
4. **备用方案**: API失败时使用模拟数据

## 📊 缓存策略

### 本地存储缓存
```javascript
const CACHE_KEY = 'weather_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30分钟

const getCachedWeather = (location) => {
  {% raw %}const cached = localStorage.getItem(`${CACHE_KEY}_${location}`);{% endraw %}
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  return null;
};

const setCachedWeather = (location, data) => {
  {% raw %}localStorage.setItem(`${CACHE_KEY}_${location}`, JSON.stringify({{% endraw %}
    data,
    timestamp: Date.now()
  }));
};
```

### 使用缓存
```javascript
const fetchWeatherData = async () => {
  // 先检查缓存
  const cached = getCachedWeather(location);
  if (cached) {
    setWeatherData(cached);
    setLoading(false);
    return;
  }

  // 缓存未命中，调用API
  try {
    const data = await callWeatherAPI(location);
    setCachedWeather(location, data);
    setWeatherData(data);
  } catch (error) {
    // 错误处理
  }
};
```

## 🎯 优化建议

### 性能优化
1. 实现数据缓存
2. 减少API调用频率
3. 使用防抖延迟请求
4. 预加载常用城市数据

### 用户体验
1. 显示加载动画
2. 友好的错误提示
3. 离线模式支持
4. 平滑的过渡动画

### 功能扩展
1. 添加更多城市
2. 支持GPS定位
3. 天气预警通知
4. 历史天气查询

## 🌟 当前状态

### 静态模拟数据
- ✅ 完整的UI设计
- ✅ 所有功能实现
- ✅ 响应式布局
- ✅ 暗黑模式支持
- ⏳ 使用模拟数据（可升级为真实API）

### 升级为真实API
- 只需替换数据获取函数
- 所有UI和功能保持不变
- 添加错误处理和缓存
- 配置API密钥即可

## 📝 快速开始

### 使用模拟数据（当前）
无需任何配置，直接使用！

### 升级为真实API
1. 注册API账号
2. 获取API密钥
3. 创建 `.env` 文件
4. 修改数据获取函数
5. 测试API调用

## 🎊 总结

天气组件已完全设计好，包括：
- ✅ 美观的界面设计
- ✅ 完整的功能实现
- ✅ 响应式布局
- ✅ 可扩展架构
- ✅ 易于集成真实API

现在可以立即使用模拟数据，将来需要时轻松升级为真实天气API！🌤️✨
