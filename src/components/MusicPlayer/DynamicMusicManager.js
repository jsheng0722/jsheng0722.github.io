import React, { useState, useEffect } from 'react';
import { FaSync, FaFolderOpen, FaMusic, FaInfoCircle } from 'react-icons/fa';

function DynamicMusicManager({ onMusicListUpdate }) {
  const [musicList, setMusicList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // 加载音乐列表
  const loadMusicList = async () => {
    setLoading(true);
    try {
      // 尝试从 musicList.json 加载
      const response = await fetch('/music/musicList.json');
      if (response.ok) {
        const data = await response.json();
        setMusicList(data);
        onMusicListUpdate(data);
      } else {
        // 如果文件不存在，使用默认列表
        const defaultList = [
          {
            id: 1,
            title: "示例音乐 1",
            artist: "示例艺术家",
            album: "示例专辑",
            duration: "3:30",
            genre: "示例类型",
            file: "/music/music list/song1.mp3",
            cover: "https://via.placeholder.com/300x300/6366f1/ffffff?text=🎵",
            year: "2024",
            liked: false
          }
        ];
        setMusicList(defaultList);
        onMusicListUpdate(defaultList);
      }
    } catch (error) {
      console.error('加载音乐列表失败:', error);
      setMusicList([]);
      onMusicListUpdate([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMusicList();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <FaFolderOpen className="w-5 h-5" />
          音乐文件夹管理
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="显示说明"
          >
            <FaInfoCircle className="w-4 h-4" />
          </button>
          <button
            onClick={loadMusicList}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? '加载中...' : '刷新列表'}
          </button>
        </div>
      </div>

      {showInstructions && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">使用说明：</h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <p><strong>1. 放置音乐文件：</strong></p>
            <p className="ml-4">• 将MP3文件复制到 <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">public/music/music list/</code> 文件夹</p>
            
            <p><strong>2. 更新音乐信息：</strong></p>
            <p className="ml-4">• 编辑 <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">public/music/musicList.json</code> 文件</p>
            <p className="ml-4">• 添加新音乐的详细信息（标题、艺术家、专辑等）</p>
            
            <p><strong>3. 刷新列表：</strong></p>
            <p className="ml-4">• 点击"刷新列表"按钮更新音乐列表</p>
            <p className="ml-4">• 或者刷新整个页面</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaMusic className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">音乐文件夹</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <code>/public/music/music list/</code>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            当前显示 {musicList.length} 首音乐
          </p>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FaInfoCircle className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">配置文件</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <code>/public/music/musicList.json</code>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            包含音乐元数据信息
          </p>
        </div>
      </div>

      {musicList.length === 0 && !loading && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            <strong>提示：</strong> 音乐列表为空。请按照上述说明添加音乐文件并更新配置文件。
          </p>
        </div>
      )}
    </div>
  );
}

export default DynamicMusicManager;
