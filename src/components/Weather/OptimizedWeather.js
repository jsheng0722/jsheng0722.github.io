/**
 * 优化后的天气组件
 * 直接使用API，不需要文件存储
 */

import React, { useState, useEffect } from 'react';
import { FaCloud, FaSun, FaCloudRain, FaSnowflake, FaBolt, FaWind, FaTint, FaMapMarkerAlt, FaSync, FaEye, FaCompress } from 'react-icons/fa';
import weatherAPI from '../../utils/WeatherAPI';

function OptimizedWeather() {
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('Omaha, US');
  const [showDetails, setShowDetails] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // 加载天气数据
  const loadWeather = async (city = location) => {
    setLoading(true);
    setError(null);
    
    try {
      const [currentWeather, forecastData] = await Promise.all([
        weatherAPI.getCurrentWeather(city),
        weatherAPI.getWeatherForecast(city, 5)
      ]);
      
      setWeatherData(currentWeather);
      setForecast(forecastData);
      setLastUpdate(new Date().toLocaleTimeString('zh-CN'));
    } catch (err) {
      setError(err.message);
      console.error('加载天气数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 初始化
  useEffect(() => {
    loadWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 获取天气图标
  const getWeatherIcon = (condition) => {
    const iconMap = {
      'Clear': <FaSun className="text-yellow-500" />,
      'Clouds': <FaCloud className="text-gray-500" />,
      'Rain': <FaCloudRain className="text-blue-500" />,
      'Snow': <FaSnowflake className="text-blue-300" />,
      'Thunderstorm': <FaBolt className="text-purple-500" />
    };
    return iconMap[condition] || <FaSun className="text-yellow-500" />;
  };

  // 获取天气颜色
  const getWeatherColor = (condition) => {
    const colorMap = {
      'Clear': 'from-yellow-400 to-orange-500',
      'Clouds': 'from-gray-400 to-gray-600',
      'Rain': 'from-blue-400 to-blue-600',
      'Snow': 'from-blue-200 to-blue-400',
      'Thunderstorm': 'from-purple-400 to-purple-600'
    };
    return colorMap[condition] || 'from-gray-400 to-gray-600';
  };

  // 刷新数据
  const handleRefresh = () => {
    weatherAPI.clearCache(); // 清除缓存，获取最新数据
    loadWeather();
  };

  // 搜索城市
  const handleSearch = (e) => {
    e.preventDefault();
    if (location.trim()) {
      loadWeather(location.trim());
    }
  };

  if (loading && !weatherData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaSync className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600">加载天气数据中...</p>
        </div>
      </div>
    );
  }

  if (error && !weatherData) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">加载天气数据失败: {error}</p>
        <button
          onClick={() => loadWeather()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          重试
        </button>
      </div>
    );
  }

  if (!weatherData) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 搜索栏 */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="输入城市名称 (如: Omaha, US 或 London, UK)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <FaMapMarkerAlt className="w-4 h-4" />
            搜索
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <FaSync className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 当前天气 */}
      <div className={`bg-gradient-to-br ${getWeatherColor(weatherData.condition)} text-white rounded-xl p-6 mb-6 shadow-lg`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">{weatherData.location}</h2>
            <p className="text-lg opacity-90">{weatherData.country}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{weatherData.temperature}°C</div>
            <div className="text-lg opacity-90">体感 {weatherData.feelsLike}°C</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-6xl">
              {getWeatherIcon(weatherData.condition)}
            </div>
            <div>
              <div className="text-xl font-semibold">{weatherData.conditionText}</div>
              <div className="text-sm opacity-90">
                湿度 {weatherData.humidity}% | 风速 {weatherData.windSpeed} m/s
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            {showDetails ? '收起详情' : '查看详情'}
          </button>
        </div>

        {/* 详细信息 */}
        {showDetails && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FaTint className="w-4 h-4" />
                <span className="text-sm">湿度</span>
              </div>
              <div className="text-lg font-semibold">{weatherData.humidity}%</div>
            </div>
            
            <div className="bg-white/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FaWind className="w-4 h-4" />
                <span className="text-sm">风速</span>
              </div>
              <div className="text-lg font-semibold">{weatherData.windSpeed} m/s</div>
            </div>
            
            <div className="bg-white/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FaCompress className="w-4 h-4" />
                <span className="text-sm">气压</span>
              </div>
              <div className="text-lg font-semibold">{weatherData.pressure} hPa</div>
            </div>
            
            <div className="bg-white/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FaEye className="w-4 h-4" />
                <span className="text-sm">能见度</span>
              </div>
              <div className="text-lg font-semibold">{weatherData.visibility} km</div>
            </div>
          </div>
        )}
      </div>

      {/* 天气预报 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          5天天气预报
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {forecast.map((day, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {index === 0 ? '今天' : new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'short' })}
              </div>
              
              <div className="text-2xl mb-2">
                {getWeatherIcon(day.condition)}
              </div>
              
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {day.high}°C
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {day.low}°C
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                湿度 {day.humidity}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 更新时间 */}
      {lastUpdate && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          最后更新: {lastUpdate}
        </div>
      )}
    </div>
  );
}

export default OptimizedWeather;
