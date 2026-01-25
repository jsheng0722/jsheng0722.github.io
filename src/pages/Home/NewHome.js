import React, { useState } from 'react';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import FixedMusicPlayer from '../../components/MusicPlayer/FixedMusicPlayer';
import OptimizedWeather from '../../components/Weather/OptimizedWeather';
import CompactCalendar from '../../components/Calendar/CompactCalendar';
import Showcase from '../../components/Showcase/Showcase';
import WelcomeBanner from '../../components/WelcomeBanner/WelcomeBanner';
import { FaCloud, FaCalendarAlt, FaWindowRestore, FaChevronRight } from 'react-icons/fa';

function NewHome() {
  // 使用对象来管理每个面板的展开状态
  const [expandedPanels, setExpandedPanels] = useState({
    weather: false,
    calendar: false,
    showcase: false
  });

  const togglePanel = (panelId) => {
    setExpandedPanels(prev => ({
      ...prev,
      [panelId]: !prev[panelId]
    }));
  };

  const panels = [
    {
      id: 'weather',
      label: '天气',
      icon: FaCloud,
      component: <OptimizedWeather />,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'calendar',
      label: '日历',
      icon: FaCalendarAlt,
      component: <CompactCalendar />,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'showcase',
      label: '展示窗',
      icon: FaWindowRestore,
      component: <Showcase />,
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
        {/* 左侧按钮菜单栏 - 固定在页面左侧 */}
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-30 hidden lg:block">
          <div className="space-y-3">
            {panels.map((panel) => {
              const Icon = panel.icon;
              const isExpanded = expandedPanels[panel.id];
              
              return (
                <button
                  key={panel.id}
                  onClick={() => togglePanel(panel.id)}
                  className={`
                    w-auto min-w-[120px]
                    px-4 py-3 rounded-lg
                    ${panel.color}
                    text-white font-semibold
                    shadow-lg hover:shadow-xl
                    transition-all duration-200
                    flex items-center justify-between gap-2
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <span>{panel.label}</span>
                  </div>
                  <FaChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* 移动端按钮 - 在页面顶部 */}
        <div className="lg:hidden mb-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-3 justify-center">
              {panels.map((panel) => {
                const Icon = panel.icon;
                const isExpanded = expandedPanels[panel.id];
                
                return (
                  <button
                    key={panel.id}
                    onClick={() => togglePanel(panel.id)}
                    className={`
                      px-4 py-2 rounded-lg
                      ${panel.color}
                      text-white font-semibold text-sm
                      shadow-lg hover:shadow-xl
                      transition-all duration-200
                      flex items-center gap-2
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{panel.label}</span>
                    <FaChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">欢迎来到首页</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">聚合日程、音乐与内容展示的个性化控制台</p>
          </div>

          {/* 居中内容区域 */}
          <div className="flex justify-center">
            <div className="w-full max-w-4xl space-y-6">
              {panels.map((panel) => {
                if (!expandedPanels[panel.id]) return null;
                
                // 根据面板类型设置左侧边框颜色
                const borderColor = panel.id === 'weather' 
                  ? 'border-l-blue-500' 
                  : panel.id === 'calendar'
                  ? 'border-l-green-500'
                  : 'border-l-purple-500';
                
                return (
                  <div
                    key={panel.id}
                    className={`bg-white dark:bg-gray-800 rounded-r-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out border-l-4 ${borderColor}`}
                  >
                    <div className="p-6">
                      {panel.component}
                    </div>
                  </div>
                );
              })}

              {/* 当没有展开任何面板时显示欢迎广告 */}
              {!Object.values(expandedPanels).some(v => v) && (
                <div className="bg-white dark:bg-gray-800 rounded-r-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out border-l-4 border-l-pink-500">
                  <div className="p-6">
                    <WelcomeBanner />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* 固定侧边栏音乐播放器 */}
      <FixedMusicPlayer />
    </>
  );
}

export default NewHome;