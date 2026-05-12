import React, { useState, useEffect } from 'react';
import { FaExternalLinkAlt, FaClock } from 'react-icons/fa';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import { useI18n } from '../../context/I18nContext';

function VideoPlayer() {
  const { t } = useI18n();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const categories = ['全部', '教程', '娱乐', '音乐', '新闻', '科技', '教育', '生活', '其他'];


  // 从静态文件加载视频数据
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const base = process.env.PUBLIC_URL || '';
        const response = await fetch(`${base}/data/videos.json`);
        if (response.ok) {
          const videos = await response.json();
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

    loadVideos();
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


  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {t('VideoMyCollection')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('VideoSubtitle')}
          </p>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder={t('VideoSearchPlaceholder')}
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
              <p className="text-gray-500 dark:text-gray-400">
                {videos.length === 0 
                  ? '暂无视频收藏'
                  : '试试调整搜索条件或分类筛选'}
              </p>
            </div>
          ) : (
            filteredVideos.map(video => (
              <div
                key={video.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2">
                    {video.title}
                  </h3>

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
