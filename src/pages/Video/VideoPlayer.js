import React, { useState, useEffect } from 'react';
import { FaExternalLinkAlt, FaTrash, FaClock } from 'react-icons/fa';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';

function VideoPlayer() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    category: '教程',
    description: '',
    reason: ''
  });

  const categories = ['全部', '教程', '娱乐', '音乐', '新闻', '科技', '教育', '生活', '其他'];


  // 从localStorage加载用户收藏的视频
  useEffect(() => {
    const loadUserVideos = () => {
      try {
        const savedVideos = localStorage.getItem('userVideos');
        if (savedVideos) {
          const videos = JSON.parse(savedVideos);
          setVideos(videos);
          setFilteredVideos(videos);
        } else {
          setVideos([]);
          setFilteredVideos([]);
        }
      } catch (error) {
        console.error('加载视频数据失败:', error);
        setVideos([]);
        setFilteredVideos([]);
      }
    };

    loadUserVideos();
  }, []);

  // 更新筛选后的视频列表
  useEffect(() => {
    const filtered = videos.filter(video => {
      const matchesCategory = selectedCategory === '全部' || video.category === selectedCategory;
      const matchesSearch = searchTerm === '' || 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
    setFilteredVideos(filtered);
  }, [videos, selectedCategory, searchTerm]);

  // 打开视频链接
  const handleOpenVideo = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // 删除视频
  const handleDeleteVideo = (videoId, e) => {
    e.stopPropagation(); // 防止触发列表项的点击事件
    if (window.confirm('确定要删除这个收藏吗？')) {
      const updatedVideos = videos.filter(video => video.id !== videoId);
      setVideos(updatedVideos);
      setFilteredVideos(updatedVideos);
      localStorage.setItem('userVideos', JSON.stringify(updatedVideos));
    }
  };

  // 添加视频收藏
  const handleAddVideo = () => {
    if (!newVideo.title.trim() || !newVideo.url.trim()) {
      alert('请填写标题和视频链接');
      return;
    }

    const videoData = {
      id: Date.now(),
      title: newVideo.title.trim(),
      url: newVideo.url.trim(),
      category: newVideo.category,
      description: newVideo.description.trim() || '',
      reason: newVideo.reason.trim() || '',
      addedDate: new Date().toISOString().split('T')[0]
    };

    // 保存到localStorage
    const localVideos = JSON.parse(localStorage.getItem('userVideos') || '[]');
    const updatedVideos = [videoData, ...localVideos];
    localStorage.setItem('userVideos', JSON.stringify(updatedVideos));

    // 更新状态
    setVideos(updatedVideos);
    setFilteredVideos(updatedVideos);

    // 重置表单
    setNewVideo({
      title: '',
      url: '',
      category: '教程',
      description: '',
      reason: ''
    });
    setShowAddForm(false);

    alert('视频收藏成功！');
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                我的视频收藏
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                精选视频内容 · 学习资源分享 · 个人作品展示
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                ➕ 收藏视频
              </button>
            </div>
          </div>
        </div>

        {/* 收藏视频表单 */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">收藏视频</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 视频标题 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  视频标题 *
                </label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入视频标题..."
                />
              </div>

              {/* 视频链接 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  视频链接 *
                </label>
                <input
                  type="url"
                  value={newVideo.url}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              {/* 分类 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  分类
                </label>
                <select
                  value={newVideo.category}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                >
                  {categories.filter(cat => cat !== '全部').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* 描述（可选） */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  描述（可选）
                </label>
                <textarea
                  value={newVideo.description}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="视频描述（可选）..."
                />
              </div>

              {/* 推荐理由（可选） */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  推荐理由（可选）
                </label>
                <textarea
                  value={newVideo.reason}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, reason: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="为什么收藏这个视频？（可选）"
                />
              </div>

              {/* 操作按钮 */}
              <div className="md:col-span-2 flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddVideo}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  收藏视频
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 搜索和筛选 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="搜索视频..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 视频列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🎥</div>
              <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {videos.length === 0 ? '还没有收藏任何视频' : '没有找到匹配的视频'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {videos.length === 0 
                  ? '点击右上角的"收藏视频"按钮开始收藏您喜欢的视频吧！'
                  : '试试调整搜索条件或分类筛选'}
              </p>
              {videos.length === 0 && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  收藏第一个视频
                </button>
              )}
            </div>
          ) : (
            filteredVideos.map(video => (
              <div
                key={video.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1 line-clamp-2">
                      {video.title}
                    </h3>
                    <button
                      onClick={(e) => handleDeleteVideo(video.id, e)}
                      className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="删除"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>

                  {video.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {video.description}
                    </p>
                  )}

                  {video.reason && (
                    <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                        "{video.reason}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-medium">
                      {video.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center">
                      <FaClock className="w-3 h-3 mr-1" />
                      {video.addedDate}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenVideo(video.url)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaExternalLinkAlt className="w-4 h-4" />
                    打开视频
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default VideoPlayer;
