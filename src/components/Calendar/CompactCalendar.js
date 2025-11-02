import React, { useState, useEffect } from 'react';
import { FaPlus, FaBell } from 'react-icons/fa';

function CompactCalendar() {
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: ''
  });

  const days = ['日','一','二','三','四','五','六'];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();

  // 从localStorage加载事件
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  // 保存事件
  const saveEvents = (newEvents) => {
    setEvents(newEvents);
    localStorage.setItem('calendarEvents', JSON.stringify(newEvents));
  };

  // 获取指定日期的事件
  const getEventsForDate = (targetDate) => {
    return events.filter(event => event.date === targetDate);
  };

  // 添加事件
  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      alert('请填写必要信息');
      return;
    }

    const eventData = {
      ...newEvent,
      id: Date.now().toString()
    };

    saveEvents([...events, eventData]);
    setShowEventModal(false);
    setNewEvent({ title: '', date: '', time: '' });
  };

  // 生成日历网格（紧凑版）
  const generateCalendarGrid = () => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const grid = [];
    
    // 填充空白
    for (let i = 0; i < firstDay; i++) {
      grid.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    
    // 当月日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = getEventsForDate(dateStr);
      const isToday = day === date;
      
      grid.push(
        <div 
          key={day} 
          className={`h-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm ${
            isToday ? 'bg-blue-500 text-white font-bold' : 'text-gray-700 dark:text-gray-300'
          }`}
          onClick={() => {
            setNewEvent(prev => ({ ...prev, date: dateStr }));
            setShowEventModal(true);
          }}
        >
          <span>{day}</span>
          {dayEvents.length > 0 && (
            <div className={`w-1 h-1 rounded-full mt-0.5 ${isToday ? 'bg-white' : 'bg-blue-500'}`}></div>
          )}
        </div>
      );
    }
    
    return grid;
  };

  // 获取今日事件
  const todayEvents = getEventsForDate(`${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
          {year}年{month}月
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{month}/{date}</span>
          <button
            onClick={() => setShowEventModal(true)}
            className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            title="添加事件"
          >
            <FaPlus className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-1 text-center mb-3">
        {days.map(d => (
          <div key={d} className="text-gray-500 dark:text-gray-400 text-xs font-medium">{d}</div>
        ))}
        {generateCalendarGrid()}
      </div>

      {/* 今日事件 */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
          <FaBell className="w-3 h-3" />
          今日事件 ({todayEvents.length})
        </h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {todayEvents.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">暂无事件</p>
          ) : (
            todayEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{event.title}</div>
                  <div className="text-gray-500 dark:text-gray-400">{event.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 事件创建模态框 */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">添加事件</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">标题 *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="事件标题"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">日期 *</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">时间 *</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setNewEvent({ title: '', date: '', time: '' });
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleSaveEvent}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompactCalendar;
