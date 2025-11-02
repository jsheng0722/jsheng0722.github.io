/**
 * 数据管理使用示例
 * 展示如何在各种组件中使用新的数据管理系统
 */

import React, { useState, useEffect } from 'react';
import { useNotes, useMusic, useWeather, useDiagrams } from '../hooks/useDataManager';

// 示例1：笔记管理组件
export const NotesExample = () => {
  const {
    data: notes,
    loading,
    error,
    saveStatus,
    saveData,
    deleteData,
    enableAutoSave,
    disableAutoSave,
    syncData,
    exportData,
    importData,
    generateFile
  } = useNotes();

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: '随笔',
    tags: []
  });

  const handleSaveNote = async () => {
    try {
      await saveData(newNote);
      setNewNote({ title: '', content: '', category: '随笔', tags: [] });
      alert('笔记保存成功！');
    } catch (error) {
      alert('保存失败：' + error.message);
    }
  };

  const handleDeleteNote = async (id) => {
    if (confirm('确定要删除这篇笔记吗？')) {
      try {
        await deleteData(id);
        alert('笔记删除成功！');
      } catch (error) {
        alert('删除失败：' + error.message);
      }
    }
  };

  const handleExport = () => {
    exportData();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      importData(file);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">笔记管理示例</h2>
      
      {/* 保存状态 */}
      <div className="mb-4 p-3 bg-gray-100 rounded-lg">
        <p>保存状态：{saveStatus.hasUnsavedChanges ? '有未保存更改' : '已保存'}</p>
        <p>网络状态：{saveStatus.isOnline ? '在线' : '离线'}</p>
        <p>最后保存：{saveStatus.lastSaved?.toLocaleString() || '从未保存'}</p>
      </div>

      {/* 新建笔记 */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">新建笔记</h3>
        <input
          type="text"
          placeholder="笔记标题"
          value={newNote.title}
          onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
          className="w-full p-2 border rounded mb-2"
        />
        <textarea
          placeholder="笔记内容"
          value={newNote.content}
          onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
          className="w-full p-2 border rounded mb-2 h-32"
        />
        <button
          onClick={handleSaveNote}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          保存笔记
        </button>
      </div>

      {/* 笔记列表 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">笔记列表</h3>
        {loading ? (
          <p>加载中...</p>
        ) : error ? (
          <p className="text-red-500">加载失败：{error}</p>
        ) : (
          <div className="space-y-2">
            {notes.map(note => (
              <div key={note.id} className="p-3 border rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{note.title}</h4>
                  <p className="text-sm text-gray-600">{note.category}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => generateFile(note)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                  >
                    生成文件
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4">
        <button
          onClick={syncData}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          同步数据
        </button>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          导出数据
        </button>
        <label className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 cursor-pointer">
          导入数据
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

// 示例2：音乐管理组件
export const MusicExample = () => {
  const {
    data: music,
    loading,
    error,
    saveData,
    deleteData,
    enableAutoSave,
    disableAutoSave
  } = useMusic();

  const [newMusic, setNewMusic] = useState({
    title: '',
    artist: '',
    album: '',
    genre: '',
    year: new Date().getFullYear()
  });

  const handleSaveMusic = async () => {
    try {
      await saveData(newMusic);
      setNewMusic({ title: '', artist: '', album: '', genre: '', year: new Date().getFullYear() });
      alert('音乐保存成功！');
    } catch (error) {
      alert('保存失败：' + error.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">音乐管理示例</h2>
      
      {/* 新建音乐 */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">添加音乐</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="歌曲标题"
            value={newMusic.title}
            onChange={(e) => setNewMusic(prev => ({ ...prev, title: e.target.value }))}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="艺术家"
            value={newMusic.artist}
            onChange={(e) => setNewMusic(prev => ({ ...prev, artist: e.target.value }))}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="专辑"
            value={newMusic.album}
            onChange={(e) => setNewMusic(prev => ({ ...prev, album: e.target.value }))}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="流派"
            value={newMusic.genre}
            onChange={(e) => setNewMusic(prev => ({ ...prev, genre: e.target.value }))}
            className="p-2 border rounded"
          />
        </div>
        <button
          onClick={handleSaveMusic}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          保存音乐
        </button>
      </div>

      {/* 音乐列表 */}
      <div>
        <h3 className="text-lg font-semibold mb-3">音乐列表</h3>
        {loading ? (
          <p>加载中...</p>
        ) : error ? (
          <p className="text-red-500">加载失败：{error}</p>
        ) : (
          <div className="space-y-2">
            {music.map(track => (
              <div key={track.id} className="p-3 border rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{track.title}</h4>
                  <p className="text-sm text-gray-600">{track.artist} - {track.album}</p>
                </div>
                <button
                  onClick={() => deleteData(track.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 示例3：天气管理组件
export const WeatherExample = () => {
  const {
    data: weather,
    loading,
    error,
    saveData,
    deleteData
  } = useWeather();

  const [newWeather, setNewWeather] = useState({
    location: '',
    temperature: '',
    condition: 'sunny',
    humidity: '',
    windSpeed: ''
  });

  const handleSaveWeather = async () => {
    try {
      await saveData(newWeather);
      setNewWeather({ location: '', temperature: '', condition: 'sunny', humidity: '', windSpeed: '' });
      alert('天气数据保存成功！');
    } catch (error) {
      alert('保存失败：' + error.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">天气管理示例</h2>
      
      {/* 新建天气数据 */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">添加天气数据</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="地点"
            value={newWeather.location}
            onChange={(e) => setNewWeather(prev => ({ ...prev, location: e.target.value }))}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="温度"
            value={newWeather.temperature}
            onChange={(e) => setNewWeather(prev => ({ ...prev, temperature: e.target.value }))}
            className="p-2 border rounded"
          />
          <select
            value={newWeather.condition}
            onChange={(e) => setNewWeather(prev => ({ ...prev, condition: e.target.value }))}
            className="p-2 border rounded"
          >
            <option value="sunny">晴天</option>
            <option value="cloudy">多云</option>
            <option value="rainy">雨天</option>
            <option value="snowy">雪天</option>
          </select>
          <input
            type="number"
            placeholder="湿度"
            value={newWeather.humidity}
            onChange={(e) => setNewWeather(prev => ({ ...prev, humidity: e.target.value }))}
            className="p-2 border rounded"
          />
        </div>
        <button
          onClick={handleSaveWeather}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          保存天气数据
        </button>
      </div>

      {/* 天气数据列表 */}
      <div>
        <h3 className="text-lg font-semibold mb-3">天气数据列表</h3>
        {loading ? (
          <p>加载中...</p>
        ) : error ? (
          <p className="text-red-500">加载失败：{error}</p>
        ) : (
          <div className="space-y-2">
            {weather.map(weatherData => (
              <div key={weatherData.id} className="p-3 border rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{weatherData.location}</h4>
                  <p className="text-sm text-gray-600">
                    {weatherData.temperature}°C - {weatherData.condition}
                  </p>
                </div>
                <button
                  onClick={() => deleteData(weatherData.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 示例4：图形管理组件
export const DiagramsExample = () => {
  const {
    data: diagrams,
    loading,
    error,
    saveData,
    deleteData
  } = useDiagrams();

  const [newDiagram, setNewDiagram] = useState({
    title: '',
    type: 'flowchart',
    description: ''
  });

  const handleSaveDiagram = async () => {
    try {
      await saveData(newDiagram);
      setNewDiagram({ title: '', type: 'flowchart', description: '' });
      alert('图形保存成功！');
    } catch (error) {
      alert('保存失败：' + error.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">图形管理示例</h2>
      
      {/* 新建图形 */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">创建图形</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="图形标题"
            value={newDiagram.title}
            onChange={(e) => setNewDiagram(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 border rounded"
          />
          <select
            value={newDiagram.type}
            onChange={(e) => setNewDiagram(prev => ({ ...prev, type: e.target.value }))}
            className="w-full p-2 border rounded"
          >
            <option value="flowchart">流程图</option>
            <option value="mindmap">思维导图</option>
            <option value="sequence">时序图</option>
          </select>
          <textarea
            placeholder="图形描述"
            value={newDiagram.description}
            onChange={(e) => setNewDiagram(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border rounded h-20"
          />
        </div>
        <button
          onClick={handleSaveDiagram}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          保存图形
        </button>
      </div>

      {/* 图形列表 */}
      <div>
        <h3 className="text-lg font-semibold mb-3">图形列表</h3>
        {loading ? (
          <p>加载中...</p>
        ) : error ? (
          <p className="text-red-500">加载失败：{error}</p>
        ) : (
          <div className="space-y-2">
            {diagrams.map(diagram => (
              <div key={diagram.id} className="p-3 border rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{diagram.title}</h4>
                  <p className="text-sm text-gray-600">{diagram.type}</p>
                </div>
                <button
                  onClick={() => deleteData(diagram.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 主示例组件
const DataManagementExample = () => {
  const [activeTab, setActiveTab] = useState('notes');

  const tabs = [
    { id: 'notes', label: '笔记管理', component: NotesExample },
    { id: 'music', label: '音乐管理', component: MusicExample },
    { id: 'weather', label: '天气管理', component: WeatherExample },
    { id: 'diagrams', label: '图形管理', component: DiagramsExample }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">数据管理系统示例</h1>
        
        {/* 标签页 */}
        <div className="flex space-x-1 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="bg-white rounded-lg shadow-sm">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
};

export default DataManagementExample;
