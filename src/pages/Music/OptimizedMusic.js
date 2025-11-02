/**
 * 优化后的音乐页面
 * 使用统一的音乐管理器和播放器
 */

import React, { useState } from 'react';
import { FaPlay, FaPause, FaHeart, FaDownload, FaList, FaTh, FaSearch, FaSort, FaRandom, FaRedo } from 'react-icons/fa';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import UnifiedMusicPlayer from '../../components/MusicPlayer/UnifiedMusicPlayer';
import { useMusicManager } from '../../hooks/useMusicManager';

function OptimizedMusic() {
  const music = useMusicManager();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('全部');
  const [sortBy, setSortBy] = useState('title');
  const [showPlayer, setShowPlayer] = useState(true);

  // 获取筛选后的音乐列表
  const getFilteredMusic = () => {
    let filtered = music.playlist;
    
    // 搜索筛选
    if (searchQuery) {
      filtered = music.searchMusic(searchQuery);
    }
    
    // 类型筛选
    if (selectedGenre !== '全部') {
      filtered = music.filterByGenre(selectedGenre);
    }
    
    // 排序
    filtered = music.sortMusic(sortBy);
    
    return filtered;
  };

  const filteredMusic = getFilteredMusic();

  // 播放音乐
  const handlePlayMusic = (track) => {
    music.play(track);
    setShowPlayer(true);
  };

  // 切换喜欢状态
  const handleToggleLike = (trackId) => {
    // 这里可以添加喜欢/取消喜欢的逻辑
    console.log('切换喜欢状态:', trackId);
  };

  // 下载音乐
  const handleDownload = (track) => {
    const link = document.createElement('a');
    link.href = track.file;
    link.download = `${track.title} - ${track.artist}.mp3`;
    link.click();
  };

  // 渲染音乐卡片
  const renderMusicCard = (track) => (
    <div
      key={track.id}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
    >
      <div className="relative">
        <img
          src={track.cover}
          alt={track.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <button
            onClick={() => handlePlayMusic(track)}
            className="opacity-0 hover:opacity-100 bg-white bg-opacity-90 rounded-full p-3 text-gray-800 hover:bg-opacity-100 transition-all duration-200"
          >
            {music.currentTrack?.id === track.id && music.isPlaying ? (
              <FaPause className="w-6 h-6" />
            ) : (
              <FaPlay className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
          {track.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {track.artist}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {track.album} • {track.year}
        </p>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleLike(track.id)}
              className={`p-2 rounded-full transition-colors ${
                track.liked 
                  ? 'text-red-500 bg-red-50' 
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <FaHeart className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDownload(track)}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            >
              <FaDownload className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {track.duration}
          </span>
        </div>
      </div>
    </div>
  );

  // 渲染音乐列表项
  const renderMusicListItem = (track) => (
    <div
      key={track.id}
      className={`flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
        music.currentTrack?.id === track.id ? 'bg-blue-50 dark:bg-blue-900' : ''
      }`}
      onClick={() => handlePlayMusic(track)}
    >
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
        <img
          src={track.cover}
          alt={track.title}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
          {track.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {track.artist} • {track.album}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {track.duration}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleLike(track.id);
          }}
          className={`p-2 rounded-full transition-colors ${
            track.liked 
              ? 'text-red-500 bg-red-50' 
              : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
          }`}
        >
          <FaHeart className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDownload(track);
          }}
          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
        >
          <FaDownload className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              音乐库
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              发现和播放您喜爱的音乐
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPlayer(!showPlayer)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showPlayer ? '隐藏播放器' : '显示播放器'}
            </button>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="搜索音乐..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            
            {/* 类型筛选 */}
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {music.getGenres().map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            
            {/* 排序 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="title">标题</option>
              <option value="artist">艺术家</option>
              <option value="album">专辑</option>
              <option value="year">年份</option>
              <option value="duration">时长</option>
            </select>
            
            {/* 视图模式 */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <FaTh className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <FaList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 音乐列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {music.loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">加载音乐中...</p>
              </div>
            </div>
          ) : music.error ? (
            <div className="text-center p-8">
              <p className="text-red-500 mb-4">加载音乐失败: {music.error}</p>
              <button
                onClick={music.loadMusicList}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                重试
              </button>
            </div>
          ) : filteredMusic.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-gray-600 dark:text-gray-400">没有找到音乐</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6' : 'divide-y divide-gray-200 dark:divide-gray-700'}>
              {filteredMusic.map(track => 
                viewMode === 'grid' ? renderMusicCard(track) : renderMusicListItem(track)
              )}
            </div>
          )}
        </div>
      </div>

      {/* 统一音乐播放器 */}
      {showPlayer && (
        <div className="fixed bottom-0 right-0 z-50">
          <UnifiedMusicPlayer mode="minimized" />
        </div>
      )}

      <Footer />
    </div>
  );
}

export default OptimizedMusic;
