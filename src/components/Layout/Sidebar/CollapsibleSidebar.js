/**
 * 可折叠侧边栏组件
 * 包含天气、日历、展示窗等功能的按钮菜单
 */

import React, { useState } from 'react';
import { FaBars, FaTimes, FaCloud, FaCalendarAlt, FaWindowRestore } from 'react-icons/fa';
import OptimizedWeather from '../../Weather/OptimizedWeather';
import CompactCalendar from '../../Calendar/CompactCalendar';
import Showcase from '../../Showcase/Showcase';

function CollapsibleSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null); // 'weather', 'calendar', 'showcase', null

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // 如果正在关闭侧边栏，清除活动面板
      setActivePanel(null);
    }
  };

  const handlePanelClick = (panel) => {
    if (activePanel === panel) {
      // 如果点击的是当前活动面板，关闭它
      setActivePanel(null);
    } else {
      // 打开新面板
      setActivePanel(panel);
      setIsOpen(true);
    }
  };

  const menuItems = [
    {
      id: 'weather',
      label: '天气',
      icon: FaCloud,
      component: <OptimizedWeather />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
    },
    {
      id: 'calendar',
      label: '日历',
      icon: FaCalendarAlt,
      component: <CompactCalendar />,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900/30'
    },
    {
      id: 'showcase',
      label: '展示窗',
      icon: FaWindowRestore,
      component: <Showcase />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
    }
  ];

  return (
    <>
      {/* 侧边栏按钮 - 固定在左侧 */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
        <button
          onClick={toggleSidebar}
          className={`
            w-12 h-12 rounded-full 
            bg-gray-800 dark:bg-gray-700 
            text-white 
            shadow-lg 
            flex items-center justify-center
            hover:bg-gray-700 dark:hover:bg-gray-600
            transition-all duration-300
            ${isOpen ? 'rotate-90' : ''}
          `}
          aria-label="切换侧边栏"
        >
          {isOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
        </button>
      </div>

      {/* 侧边栏菜单 */}
      <div
        className={`
          fixed left-0 top-0 h-full
          bg-white dark:bg-gray-800
          shadow-2xl
          transition-all duration-300 ease-in-out
          z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isOpen ? 'w-[90vw] sm:w-96 md:w-[500px]' : 'w-0'}
          overflow-hidden
        `}
      >
        <div className="h-full flex flex-col">
          {/* 菜单按钮区域 */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              快捷工具
            </h2>
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePanel === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePanelClick(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-all duration-200
                      ${isActive 
                        ? `${item.bgColor} ${item.color} border-2 border-current` 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                      ${item.hoverColor}
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? item.color : ''}`} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto text-xs bg-current text-white px-2 py-1 rounded">
                        已展开
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 内容展示区域 */}
          {activePanel && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                  {menuItems.find(item => item.id === activePanel)?.label}
                </h3>
                <button
                  onClick={() => setActivePanel(null)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label="关闭面板"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 sm:p-4 overflow-auto max-h-[calc(100vh-180px)]">
                {menuItems.find(item => item.id === activePanel)?.component}
              </div>
            </div>
          )}

          {/* 提示信息（当没有选中面板时） */}
          {!activePanel && (
            <div className="flex-1 flex items-center justify-center p-4">
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                点击上方按钮展开相应工具
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 背景遮罩（当侧边栏打开时） */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
          aria-label="关闭侧边栏"
        />
      )}
    </>
  );
}

export default CollapsibleSidebar;

