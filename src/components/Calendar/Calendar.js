import React, { useState, useEffect } from 'react';
import { FaPlus, FaBell, FaEdit, FaTrash } from 'react-icons/fa';

function Calendar() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDateEvents, setShowDateEvents] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    reminder: false,
    reminderMinutes: 15
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

  // 保存事件到localStorage
  const saveEvents = (newEvents) => {
    setEvents(newEvents);
    localStorage.setItem('calendarEvents', JSON.stringify(newEvents));
  };

  // 请求通知权限
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 检查即将到来的事件
  useEffect(() => {
    const checkUpcomingEvents = () => {
      const now = new Date();
      events.forEach(event => {
        if (event.reminder) {
          const eventDateTime = new Date(`${event.date} ${event.time}`);
          const reminderTime = new Date(eventDateTime.getTime() - event.reminderMinutes * 60000);
          
          if (now >= reminderTime && now <= eventDateTime) {
            // 检查是否已经提醒过
            const reminderKey = `reminder_${event.id}_${event.date}_${event.time}`;
            if (!localStorage.getItem(reminderKey)) {
              showNotification(event);
              localStorage.setItem(reminderKey, 'true');
            }
          }
        }
      });
    };

    const interval = setInterval(checkUpcomingEvents, 60000); // 每分钟检查
    return () => clearInterval(interval);
  }, [events]);

  // 显示通知
  const showNotification = (event) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`事件提醒: ${event.title}`, {
        body: event.description || '您有一个即将开始的事件',
        icon: '/favicon.ico'
      });
    }
  };

  // 获取指定日期的事件
  const getEventsForDate = (targetDate) => {
    return events.filter(event => event.date === targetDate);
  };

  // 获取所有事件（按日期排序）
  const getAllEvents = () => {
    return events.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA - dateB;
    });
  };

  // 格式化日期显示
  const formatDateDisplay = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return '今天';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return '昨天';
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return '明天';
    } else {
      return date.toLocaleDateString('zh-CN', { 
        month: 'long', 
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  // 添加/编辑事件
  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      alert('请填写必要信息');
      return;
    }

    const eventData = {
      ...newEvent,
      id: editingEvent ? editingEvent.id : Date.now().toString()
    };

    let updatedEvents;
    if (editingEvent) {
      updatedEvents = events.map(e => e.id === editingEvent.id ? eventData : e);
    } else {
      updatedEvents = [...events, eventData];
    }

    saveEvents(updatedEvents);
    setShowEventModal(false);
    setNewEvent({ title: '', description: '', date: '', time: '', reminder: false, reminderMinutes: 15 });
    setEditingEvent(null);
  };

  // 删除事件
  const handleDeleteEvent = (eventId) => {
    if (window.confirm('确定要删除这个事件吗？')) {
      const updatedEvents = events.filter(e => e.id !== eventId);
      saveEvents(updatedEvents);
    }
  };

  // 生成日历网格
  const generateCalendarGrid = () => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
    
    const grid = [];
    
    // 上个月的日期
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dateStr = `${year}-${String(month - 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = getEventsForDate(dateStr);
      grid.push(
        <div key={`prev-${day}`} className="h-16 rounded border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400">
          <span className="text-sm">{day}</span>
          {dayEvents.length > 0 && (
            <div className="w-2 h-2 bg-gray-400 rounded-full mt-1"></div>
          )}
        </div>
      );
    }
    
    // 当月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = getEventsForDate(dateStr);
      const isToday = day === date;
      
      grid.push(
        <div 
          key={day} 
          className={`h-16 rounded border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
            isToday ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300' : ''
          }`}
          onClick={() => {
            setSelectedDate(new Date(year, month - 1, day));
            const dayEvents = getEventsForDate(dateStr);
            if (dayEvents.length > 0) {
              // 如果有事件，显示该日期的事件列表
              setShowDateEvents(true);
            } else {
              // 如果没有事件，直接创建新事件
              setNewEvent(prev => ({ ...prev, date: dateStr }));
              setShowEventModal(true);
            }
          }}
        >
          <span className="text-sm">{day}</span>
          {dayEvents.length > 0 && (
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
          )}
        </div>
      );
    }
    
    // 下个月的日期
    const remainingCells = 42 - grid.length;
    for (let day = 1; day <= remainingCells; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = getEventsForDate(dateStr);
      grid.push(
        <div key={`next-${day}`} className="h-16 rounded border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400">
          <span className="text-sm">{day}</span>
          {dayEvents.length > 0 && (
            <div className="w-2 h-2 bg-gray-400 rounded-full mt-1"></div>
          )}
        </div>
      );
    }
    
    return grid;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">日历</h3>
      
      <div className="flex items-baseline justify-between mb-4">
        <div className="text-2xl font-bold">{year}年{month}月</div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">今天：{month}/{date}</div>
          <button
            onClick={() => setShowAllEvents(!showAllEvents)}
            className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            title="查看所有事件"
          >
            <FaBell className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowEventModal(true)}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            title="添加事件"
          >
            <FaPlus className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 text-center mb-4">
        {days.map(d => (
          <div key={d} className="text-gray-500 text-sm font-medium">{d}</div>
        ))}
        {generateCalendarGrid()}
      </div>

      {/* 所有事件列表 */}
      {showAllEvents && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">所有事件</h4>
            <button
              onClick={() => setShowAllEvents(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {getAllEvents().length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无事件</div>
            ) : (
              getAllEvents().map(event => {
                const eventDate = new Date(`${event.date} ${event.time}`);
                const isPast = eventDate < new Date();
                const isToday = event.date === `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                
                return (
                  <div 
                    key={event.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isPast 
                        ? 'bg-gray-100 dark:bg-gray-600 border-gray-200 dark:border-gray-500' 
                        : isToday
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className={`text-sm font-medium ${isPast ? 'text-gray-500 line-through' : ''}`}>
                          {event.title}
                        </div>
                        {event.reminder && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded">
                            提醒
                          </span>
                        )}
                        {isToday && (
                          <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                            今日
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {event.description}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDateDisplay(event.date)} {event.time}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          setEditingEvent(event);
                          setNewEvent(event);
                          setShowEventModal(true);
                        }}
                        className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                        title="编辑事件"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        title="删除事件"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 指定日期事件查看器 */}
      {showDateEvents && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">
              {formatDateDisplay(selectedDate.toISOString().split('T')[0])} 的事件
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setNewEvent(prev => ({ ...prev, date: selectedDate.toISOString().split('T')[0] }));
                  setShowEventModal(true);
                }}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                添加事件
              </button>
              <button
                onClick={() => setShowDateEvents(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {getEventsForDate(selectedDate.toISOString().split('T')[0]).map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                <div className="flex-1">
                  <div className="text-sm font-medium">{event.title}</div>
                  {event.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {event.description}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">{event.time}</div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setEditingEvent(event);
                      setNewEvent(event);
                      setShowEventModal(true);
                    }}
                    className="p-2 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                    title="编辑事件"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    title="删除事件"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 今日事件（简化版） */}
      {!showAllEvents && !showDateEvents && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">今日事件</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {getEventsForDate(`${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`).map(event => (
              <div key={event.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex-1">
                  <div className="text-sm font-medium">{event.title}</div>
                  {event.time && <div className="text-xs text-gray-500">{event.time}</div>}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setEditingEvent(event);
                      setNewEvent(event);
                      setShowEventModal(true);
                    }}
                    className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                  >
                    <FaEdit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-1 text-red-500 hover:bg-red-100 rounded"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 事件创建/编辑模态框 */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingEvent ? '编辑事件' : '添加事件'}
            </h3>
            
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
              
              <div>
                <label className="block text-sm font-medium mb-1">描述</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  rows="3"
                  placeholder="事件描述"
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
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="reminder"
                  checked={newEvent.reminder}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, reminder: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="reminder" className="text-sm">启用提醒</label>
              </div>
              
              {newEvent.reminder && (
                <div>
                  <label className="block text-sm font-medium mb-1">提前提醒（分钟）</label>
                  <select
                    value={newEvent.reminderMinutes}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, reminderMinutes: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value={5}>5分钟</option>
                    <option value={15}>15分钟</option>
                    <option value={30}>30分钟</option>
                    <option value={60}>1小时</option>
                    <option value={1440}>1天</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setNewEvent({ title: '', description: '', date: '', time: '', reminder: false, reminderMinutes: 15 });
                  setEditingEvent(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleSaveEvent}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {editingEvent ? '更新' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
