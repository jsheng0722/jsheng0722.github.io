import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaSync, FaDownload, FaUpload } from 'react-icons/fa';

// 这是一个高级日历组件的示例，展示如何集成外部服务
function AdvancedCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('未同步');

  // 模拟从Google Calendar API获取数据
  const syncWithGoogleCalendar = async () => {
    setLoading(true);
    setSyncStatus('同步中...');
    
    try {
      // 这里应该是真实的Google Calendar API调用
      // const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events');
      // const data = await response.json();
      
      // 模拟数据
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockEvents = [
        {
          id: '1',
          title: '团队会议',
          start: '2024-01-15T10:00:00',
          end: '2024-01-15T11:00:00',
          description: '项目进度讨论',
          source: 'google'
        },
        {
          id: '2',
          title: '代码审查',
          start: '2024-01-16T14:00:00',
          end: '2024-01-16T15:30:00',
          description: 'React组件代码审查',
          source: 'google'
        }
      ];
      
      setEvents(prev => [...prev, ...mockEvents]);
      setSyncStatus('已同步');
    } catch (error) {
      setSyncStatus('同步失败');
      console.error('同步失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 导出事件到JSON文件
  const exportEvents = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'calendar-events.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // 从JSON文件导入事件
  const importEvents = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedEvents = JSON.parse(e.target.result);
          setEvents(prev => [...prev, ...importedEvents]);
        } catch (error) {
          alert('文件格式错误');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <FaCalendarAlt className="mr-2" />
          高级日历管理
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">状态: {syncStatus}</span>
          <button
            onClick={syncWithGoogleCalendar}
            disabled={loading}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            title="同步Google日历"
          >
            <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 事件列表 */}
        <div>
          <h3 className="text-lg font-medium mb-4">事件列表</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {events.map(event => (
              <div key={event.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-gray-500">{event.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(event.start).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    event.source === 'google' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {event.source === 'google' ? 'Google' : '本地'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 导入导出 */}
        <div>
          <h3 className="text-lg font-medium mb-4">数据管理</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">导入事件</label>
              <input
                type="file"
                accept=".json"
                onChange={importEvents}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">导出事件</label>
              <button
                onClick={exportEvents}
                className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <FaDownload className="mr-2" />
                导出为JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 集成说明 */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium mb-2">集成说明</h4>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p><strong>Google Calendar API:</strong> 需要OAuth2认证，可以读取和写入Google日历事件</p>
          <p><strong>Notion API:</strong> 可以将事件同步到Notion数据库</p>
          <p><strong>Webhook:</strong> 可以设置webhook接收外部系统的日历事件</p>
          <p><strong>iCal格式:</strong> 支持导入/导出标准的.ics文件</p>
        </div>
      </div>
    </div>
  );
}

export default AdvancedCalendar;
