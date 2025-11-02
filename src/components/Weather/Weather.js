import React, { useState, useEffect } from 'react';
import { FaCloud, FaSun, FaCloudRain, FaSnowflake, FaBolt, FaWind, FaTint, FaMapMarkerAlt, FaSync, FaEye, FaCompress } from 'react-icons/fa';

function Weather() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('Omaha, US');
  const [showDetails, setShowDetails] = useState(false);

  // 模拟天气数据（静态网站使用）
  const mockWeatherData = {
    location: location,
    temperature: 22,
    feelsLike: 20,
    condition: 'sunny', // sunny, cloudy, rainy, snowy, thunderstorm
    conditionText: '晴天',
    humidity: 45,
    windSpeed: 12,
    windDirection: '东北风',
    pressure: 1013,
    visibility: 10,
    uvIndex: 5,
    aqi: 85,
    aqiLevel: '良',
    forecast: [
      { day: '今天', high: 25, low: 18, condition: 'sunny', icon: '☀️' },
      { day: '明天', high: 23, low: 17, condition: 'cloudy', icon: '⛅' },
      { day: '后天', high: 20, low: 15, condition: 'rainy', icon: '🌧️' },
      { day: '周四', high: 19, low: 14, condition: 'cloudy', icon: '☁️' },
      { day: '周五', high: 22, low: 16, condition: 'sunny', icon: '☀️' }
    ],
    hourly: [
      { time: '现在', temp: 22, condition: '☀️' },
      { time: '14:00', temp: 24, condition: '☀️' },
      { time: '15:00', temp: 25, condition: '☀️' },
      { time: '16:00', temp: 24, condition: '⛅' },
      { time: '17:00', temp: 23, condition: '⛅' },
      { time: '18:00', temp: 21, condition: '🌙' }
    ],
    sunrise: '06:15',
    sunset: '18:30',
    lastUpdate: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  };

  useEffect(() => {
    loadWeather();
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadWeather = () => {
    setLoading(true);
    // 模拟加载延迟
    setTimeout(() => {
      setWeatherData(mockWeatherData);
      setLoading(false);
    }, 500);
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      sunny: <FaSun className="w-12 h-12 text-yellow-500" />,
      cloudy: <FaCloud className="w-12 h-12 text-gray-400" />,
      rainy: <FaCloudRain className="w-12 h-12 text-blue-500" />,
      snowy: <FaSnowflake className="w-12 h-12 text-blue-200" />,
      thunderstorm: <FaBolt className="w-12 h-12 text-yellow-600" />
    };
    return icons[condition] || icons.sunny;
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return 'text-green-600 bg-green-50';
    if (aqi <= 100) return 'text-yellow-600 bg-yellow-50';
    if (aqi <= 150) return 'text-orange-600 bg-orange-50';
    if (aqi <= 200) return 'text-red-600 bg-red-50';
    return 'text-purple-600 bg-purple-50';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">加载天气数据...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="w-4 h-4" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-sm border-none outline-none cursor-pointer"
            >
              <option value="北京">北京</option>
              <option value="上海">上海</option>
              <option value="广州">广州</option>
              <option value="深圳">深圳</option>
              <option value="杭州">杭州</option>
              <option value="成都">成都</option>
            </select>
          </div>
          <button
            onClick={loadWeather}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            title="刷新"
          >
            <FaSync className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs opacity-80">
          更新时间: {weatherData.lastUpdate}
        </div>
      </div>

      {/* 主要天气信息 */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">
              {weatherData.temperature}°C
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              体感 {weatherData.feelsLike}°C
            </div>
            <div className="text-lg text-gray-700 dark:text-gray-300 mt-2">
              {weatherData.conditionText}
            </div>
          </div>
          <div>
            {getWeatherIcon(weatherData.condition)}
          </div>
        </div>

        {/* 详细信息网格 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <FaTint className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">湿度</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{weatherData.humidity}%</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <FaWind className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">风速</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{weatherData.windSpeed}km/h</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <FaEye className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">能见度</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{weatherData.visibility}km</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <FaCompress className="w-4 h-4 text-gray-500" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">气压</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{weatherData.pressure}hPa</div>
            </div>
          </div>
        </div>

        {/* 空气质量 */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">空气质量</span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getAQIColor(weatherData.aqi)}`}>
                {weatherData.aqiLevel}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                AQI {weatherData.aqi}
              </span>
            </div>
          </div>
        </div>

        {/* 日出日落 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">日出</div>
            <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
              🌅 {weatherData.sunrise}
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">日落</div>
            <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
              🌇 {weatherData.sunset}
            </div>
          </div>
        </div>

        {/* 展开详情按钮 */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          {showDetails ? '收起详情 ▲' : '查看详情 ▼'}
        </button>

        {/* 详细信息 */}
        {showDetails && (
          <div className="mt-4 space-y-4">
            {/* 小时预报 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">24小时预报</h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {weatherData.hourly.map((hour, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg min-w-[70px]"
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{hour.time}</div>
                    <div className="text-2xl mb-2">{hour.condition}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{hour.temp}°</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 未来天气 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">未来天气</h4>
              <div className="space-y-2">
                {weatherData.forecast.map((day, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{day.icon}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 min-w-[50px]">
                        {day.day}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{day.low}°</span>
                      <div className="w-16 h-1 bg-gradient-to-r from-blue-300 to-orange-300 rounded-full"></div>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{day.high}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 生活指数 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">生活指数</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400">紫外线</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">中等</div>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400">运动</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">适宜</div>
                </div>
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400">洗车</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">适宜</div>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400">穿衣</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">舒适</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="px-4 pb-4">
        <div className="text-xs text-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
          💡 提示：这是模拟天气数据，可集成真实天气API
        </div>
      </div>
    </div>
  );
}

export default Weather;
