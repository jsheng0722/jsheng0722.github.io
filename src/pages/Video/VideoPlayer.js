import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaHeart, FaShare, FaClock, FaEye, FaThumbsUp, FaComment } from 'react-icons/fa';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';

function VideoPlayer() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    url: '',
    source: 'YouTube',
    category: '教程',
    tags: [],
    reason: ''
  });
  
  const videoRef = React.useRef(null);

  const categories = ['全部', '教程', '娱乐', '音乐', '新闻', '科技', '教育', '生活', '其他'];

  // 添加视频事件监听器
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };
    
    const handleError = () => {
      console.log('视频加载错误');
      setIsPlaying(false);
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('loadstart', handleLoadStart);
    videoElement.addEventListener('canplay', handleCanPlay);

    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('loadstart', handleLoadStart);
      videoElement.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentVideo]);

  useEffect(() => {
    // 从localStorage加载用户收藏的视频
    const loadUserVideos = () => {
      try {
        const savedVideos = localStorage.getItem('userVideos');
        if (savedVideos) {
          const videos = JSON.parse(savedVideos);
          setVideos(videos);
          setFilteredVideos(videos);
        } else {
          // 如果没有保存的视频，显示空状态
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
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
    setFilteredVideos(filtered);
  }, [videos, selectedCategory, searchTerm]);

  const handleVideoSelect = (video) => {
    setCurrentVideo(video);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    // 防止重复点击
    if (isLoading) return;
    
    try {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        // 检查视频是否已加载
        if (videoRef.current.readyState < 2) {
          console.log('视频尚未加载完成');
          return;
        }
        
        // 直接调用play，让事件监听器处理状态
        videoRef.current.play().catch((error) => {
          console.log('播放失败:', error);
        });
      }
    } catch (error) {
      console.log('视频播放错误:', error);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };


  // 生成嵌入URL
  const generateEmbedUrl = (url, source) => {
    if (source === 'YouTube') {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
      return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
    } else if (source === 'Bilibili') {
      const videoId = url.match(/bilibili\.com\/video\/([^/?]+)/);
      return videoId ? `https://player.bilibili.com/player.html?bvid=${videoId[1]}` : null;
    }
    return null;
  };

  // 添加视频收藏
  const handleAddVideo = () => {
    if (!newVideo.title.trim() || !newVideo.url.trim()) {
      alert('请填写标题和视频链接');
      return;
    }

    const embedUrl = generateEmbedUrl(newVideo.url, newVideo.source);
    
    const videoData = {
      id: Date.now(),
      ...newVideo,
      embedUrl: embedUrl,
      type: embedUrl ? 'embed' : 'external',
      thumbnail: '/images/video/default.jpg',
      duration: '未知',
      views: 0,
      likes: 0,
      comments: 0,
      uploadDate: new Date().toISOString().split('T')[0],
      addedDate: new Date().toISOString().split('T')[0],
      status: '收藏中'
    };

    // 保存到localStorage
    const localVideos = JSON.parse(localStorage.getItem('userVideos') || '[]');
    const updatedVideos = [videoData, ...localVideos];
    localStorage.setItem('userVideos', JSON.stringify(updatedVideos));

    // 更新状态
    setVideos(prev => [videoData, ...prev]);

    // 重置表单
    setNewVideo({
      title: '',
      description: '',
      url: '',
      source: 'YouTube',
      category: '教程',
      tags: [],
      reason: ''
    });
    setShowAddForm(false);

    alert('视频收藏成功！');
  };

  // 加载本地收藏
  useEffect(() => {
    const localVideos = JSON.parse(localStorage.getItem('videoCollection') || '[]');
    if (localVideos.length > 0) {
      setVideos(prev => [...localVideos, ...prev]);
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case '已学习':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case '收藏中':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case '已制作':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
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

              {/* 视频平台 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  视频平台
                </label>
                <select
                  value={newVideo.source}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="YouTube">YouTube</option>
                  <option value="Bilibili">Bilibili</option>
                  <option value="其他">其他</option>
                </select>
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

              {/* 描述 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  描述
                </label>
                <textarea
                  value={newVideo.description}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="视频描述..."
                />
              </div>

              {/* 推荐理由 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  推荐理由
                </label>
                <textarea
                  value={newVideo.reason}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, reason: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="为什么收藏这个视频？"
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 视频播放器 */}
          <div className="lg:col-span-3">
            {currentVideo ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                {/* 视频播放区域 */}
                <div className="relative bg-black">
                  {currentVideo.type === 'embed' && currentVideo.embedUrl ? (
                    <iframe
                      src={currentVideo.embedUrl}
                      className="w-full h-96 lg:h-[500px]"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={currentVideo.title}
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      className="w-full h-96 lg:h-[500px]"
                      poster={currentVideo.thumbnail}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={() => setDuration(videoRef.current.duration)}
                    >
                      <source src={currentVideo.url} type="video/mp4" />
                      您的浏览器不支持视频播放。
                    </video>
                  )}

                  {/* 播放控制覆盖层 */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <button
                      onClick={togglePlayPause}
                      disabled={isLoading}
                      className={`w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : isPlaying ? (
                        <FaPause className="w-6 h-6 text-gray-800" />
                      ) : (
                        <FaPlay className="w-6 h-6 text-gray-800 ml-1" />
                      )}
                    </button>
                  </div>

                  {/* 底部控制栏 */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    {/* 进度条 */}
                    <div className="mb-4">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* 控制按钮 */}
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-4">
                        <button onClick={togglePlayPause} className="hover:text-gray-300">
                          {isPlaying ? <FaPause className="w-5 h-5" /> : <FaPlay className="w-5 h-5" />}
                        </button>
                        
                        <div className="flex items-center space-x-2">
                          <button onClick={toggleMute} className="hover:text-gray-300">
                            {isMuted ? <FaVolumeMute className="w-5 h-5" /> : <FaVolumeUp className="w-5 h-5" />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <span className="text-sm">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <button className="hover:text-gray-300">
                          <FaHeart className="w-5 h-5" />
                        </button>
                        <button className="hover:text-gray-300">
                          <FaShare className="w-5 h-5" />
                        </button>
                        <button onClick={toggleFullscreen} className="hover:text-gray-300">
                          {isFullscreen ? <FaCompress className="w-5 h-5" /> : <FaExpand className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 视频信息 */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {currentVideo.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {currentVideo.description}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentVideo.status)}`}>
                      {currentVideo.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <FaClock className="w-4 h-4 mr-1" />
                        {currentVideo.duration}
                      </span>
                      <span className="flex items-center">
                        <FaEye className="w-4 h-4 mr-1" />
                        {currentVideo.views.toLocaleString()} 次观看
                      </span>
                      <span>{currentVideo.uploadDate}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                        <FaThumbsUp className="w-4 h-4" />
                        <span>{currentVideo.likes}</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                        <FaComment className="w-4 h-4" />
                        <span>{currentVideo.comments}</span>
                      </button>
                    </div>
                  </div>

                  {/* 推荐理由 */}
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                      " {currentVideo.reason} "
                    </p>
                  </div>

                  {/* 标签 */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {currentVideo.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🎥</div>
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  选择一个视频开始播放
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  从右侧列表中选择您想观看的视频
                </p>
              </div>
            )}
          </div>

          {/* 视频列表侧边栏 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                视频列表
              </h3>

              {/* 搜索和筛选 */}
              <div className="mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="搜索视频..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* 视频列表 */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredVideos.map(video => (
                  <div
                    key={video.id}
                    onClick={() => handleVideoSelect(video)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      currentVideo?.id === video.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex space-x-3">
                      <div className="w-20 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <FaPlay className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                          {video.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {video.duration} • {video.views.toLocaleString()} 观看
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(video.status)}`}>
                            {video.status}
                          </span>
                          <span className="text-xs text-gray-400">{video.addedDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default VideoPlayer;
