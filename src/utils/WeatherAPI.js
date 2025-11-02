/**
 * 天气API管理器
 * 直接使用API获取天气数据，不需要文件存储
 */

class WeatherAPI {
  constructor() {
    // 优先从环境变量读取API密钥，如果没有则使用默认值
    this.apiKey = process.env.REACT_APP_WEATHER_API_KEY || 'your-api-key';
    this.baseURL = process.env.REACT_APP_WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5';
    this.cache = new Map(); // 简单的内存缓存
    this.cacheTimeout = 10 * 60 * 1000; // 10分钟缓存
  }

  /**
   * 获取当前天气
   */
  async getCurrentWeather(city) {
    // 检查 API Key
    if (!this.apiKey || this.apiKey === 'your-api-key') {
      throw new Error('请配置有效的天气 API Key。请查看 WEATHER_SETUP.md 获取配置指南。');
    }

    // 检查缓存
    const cacheKey = `current_${city}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // 调用API（使用encodeURIComponent确保城市名称正确编码）
    const encodedCity = encodeURIComponent(city);
    const response = await fetch(
      `${this.baseURL}/weather?q=${encodedCity}&appid=${this.apiKey}&units=metric&lang=en`
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      // 提供详细的错误信息
      if (response.status === 401) {
        throw new Error('API Key 无效或未激活。请检查 .env 文件中的 REACT_APP_WEATHER_API_KEY。新注册的 API Key 可能需要等待几分钟才能激活。');
      } else if (response.status === 404) {
        throw new Error(`找不到城市 "${city}"。请检查城市名称是否正确。`);
      } else {
        throw new Error(`天气API调用失败 (${response.status}): ${data.message || '未知错误'}`);
      }
    }

    const weatherData = this.formatWeatherData(data);
    
    // 缓存数据
    this.setCache(cacheKey, weatherData);
    
    return weatherData;
  }

  /**
   * 获取天气预报
   */
  async getWeatherForecast(city, days = 5) {
    // 检查 API Key
    if (!this.apiKey || this.apiKey === 'your-api-key') {
      throw new Error('请配置有效的天气 API Key。请查看 WEATHER_SETUP.md 获取配置指南。');
    }

    const cacheKey = `forecast_${city}_${days}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const encodedCity = encodeURIComponent(city);
    const response = await fetch(
      `${this.baseURL}/forecast?q=${encodedCity}&appid=${this.apiKey}&units=metric&lang=en&cnt=${days * 8}`
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      // 提供详细的错误信息
      if (response.status === 401) {
        throw new Error('API Key 无效或未激活。请检查 .env 文件中的 REACT_APP_WEATHER_API_KEY。');
      } else if (response.status === 404) {
        throw new Error(`找不到城市 "${city}"。请检查城市名称是否正确。`);
      } else {
        throw new Error(`天气预报API调用失败 (${response.status}): ${data.message || '未知错误'}`);
      }
    }

    const forecastData = this.formatForecastData(data);
    
    this.setCache(cacheKey, forecastData);
    
    return forecastData;
  }

  /**
   * 格式化天气数据
   */
  formatWeatherData(data) {
    return {
      id: `weather_${Date.now()}`,
      location: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0].main,
      conditionText: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      windDirection: this.getWindDirection(data.wind.deg),
      pressure: data.main.pressure,
      visibility: data.visibility / 1000, // 转换为公里
      uvIndex: data.uvi || 0,
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('zh-CN'),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('zh-CN'),
      lastUpdate: new Date().toLocaleTimeString('zh-CN'),
      icon: data.weather[0].icon,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 格式化预报数据
   */
  formatForecastData(data) {
    const forecast = [];
    const dailyData = {};

    // 按天分组
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          date: date,
          temps: [],
          conditions: [],
          humidity: [],
          windSpeed: []
        };
      }
      
      dailyData[date].temps.push(item.main.temp);
      dailyData[date].conditions.push(item.weather[0].main);
      dailyData[date].humidity.push(item.main.humidity);
      dailyData[date].windSpeed.push(item.wind.speed);
    });

    // 计算每日平均数据
    Object.values(dailyData).forEach(day => {
      forecast.push({
        date: day.date,
        high: Math.round(Math.max(...day.temps)),
        low: Math.round(Math.min(...day.temps)),
        condition: this.getMostCommonCondition(day.conditions),
        humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
        windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b) / day.windSpeed.length)
      });
    });

    return forecast.slice(0, 5); // 返回5天预报
  }

  /**
   * 获取风向
   */
  getWindDirection(degrees) {
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  /**
   * 获取最常见的天气条件
   */
  getMostCommonCondition(conditions) {
    const counts = {};
    conditions.forEach(condition => {
      counts[condition] = (counts[condition] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }

  /**
   * 获取缓存数据
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * 设置缓存数据
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * 获取模拟天气数据（降级方案）
   */
  getMockWeatherData(city) {
    return {
      id: `mock_weather_${Date.now()}`,
      location: city,
      country: 'CN',
      temperature: Math.floor(Math.random() * 15) + 15, // 15-30度
      feelsLike: Math.floor(Math.random() * 15) + 15,
      condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
      conditionText: ['晴天', '多云', '小雨'][Math.floor(Math.random() * 3)],
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 10) + 5, // 5-15 km/h
      windDirection: ['北', '南', '东', '西'][Math.floor(Math.random() * 4)],
      pressure: 1013,
      visibility: 10,
      uvIndex: Math.floor(Math.random() * 5) + 1,
      sunrise: '06:30',
      sunset: '18:30',
      lastUpdate: new Date().toLocaleTimeString('zh-CN'),
      icon: '01d',
      timestamp: new Date().toISOString(),
      isMock: true
    };
  }

  /**
   * 获取模拟预报数据
   */
  getMockForecastData(city, days) {
    const forecast = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date: date.toDateString(),
        high: Math.floor(Math.random() * 10) + 20,
        low: Math.floor(Math.random() * 10) + 10,
        condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
        humidity: Math.floor(Math.random() * 30) + 50,
        windSpeed: Math.floor(Math.random() * 8) + 3
      });
    }
    return forecast;
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 创建全局实例
const weatherAPI = new WeatherAPI();

export default weatherAPI;
