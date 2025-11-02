/**
 * 统一音乐播放器组件
 * 整合所有音乐播放功能，替代多个分散的播放器
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaStepBackward, FaStepForward, 
  FaRandom, FaRedo, FaMusic, FaExpand, FaCompress, FaList, FaHeart, 
  FaDownload, FaSearch, FaSort, FaTimes, FaMinus, FaPlus
} from 'react-icons/fa';
import musicManager from '../../utils/MusicManager';
import LyricsDisplay from './LyricsDisplay';

function UnifiedMusicPlayer({ 
  mode = 'fixed', // 'fixed', 'draggable', 'minimized'
  position = { x: 0, y: 0 },
  onPositionChange = () => {},
  className = ''
}) {
  // 状态管理
  const [state, setState] = useState(musicManager.getState());
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlaylist, setFilteredPlaylist] = useState([]);
  const [sortBy, setSortBy] = useState('title');
  const [selectedGenre, setSelectedGenre] = useState('全部');
  
  const playerRef = useRef(null);
  const audioRef = useRef(null);

  // 初始化
  useEffect(() => {
    // 加载音乐列表
    musicManager.loadMusicList();
    
    // 设置音频引用
    if (audioRef.current) {
      musicManager.audio = audioRef.current;
    }

    // 监听音乐管理器事件
    const handleStateChange = () => {
      setState(musicManager.getState());
    };

    const handlePlaylistUpdate = (playlist) => {
      setFilteredPlaylist(playlist);
    };

    musicManager.on('play', handleStateChange);
    musicManager.on('pause', handleStateChange);
    musicManager.on('stop', handleStateChange);
    musicManager.on('trackLoaded', handleStateChange);
    musicManager.on('playlistLoaded', handlePlaylistUpdate);
    musicManager.on('playlistUpdate', handlePlaylistUpdate);

    return () => {
      musicManager.off('play', handleStateChange);
      musicManager.off('pause', handleStateChange);
      musicManager.off('stop', handleStateChange);
      musicManager.off('trackLoaded', handleStateChange);
      musicManager.off('playlistLoaded', handlePlaylistUpdate);
      musicManager.off('playlistUpdate', handlePlaylistUpdate);
    };
  }, []);

  // 更新筛选后的播放列表
  useEffect(() => {
    let filtered = musicManager.playlist;
    
    // 搜索筛选
    if (searchQuery) {
      filtered = musicManager.searchMusic(searchQuery);
    }
    
    // 类型筛选
    if (selectedGenre !== '全部') {
      filtered = musicManager.filterByGenre(selectedGenre);
    }
    
    // 排序
    filtered = musicManager.sortMusic(sortBy);
    
    setFilteredPlaylist(filtered);
  }, [searchQuery, selectedGenre, sortBy, state.playlist]);

  // 拖拽功能（仅draggable模式）
  const handleMouseDown = (e) => {
    if (mode !== 'draggable' || e.target.closest('button, input')) return;
    
    setIsDragging(true);
    const rect = playerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    };
    
    onPositionChange(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 播放控制
  const handlePlayPause = () => {
    if (state.isPlaying) {
      musicManager.pause();
    } else {
      musicManager.play();
    }
  };

  const handleStop = () => {
    musicManager.stop();
  };

  const handleNext = () => {
    musicManager.next();
  };

  const handlePrevious = () => {
    musicManager.previous();
  };

  const handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    musicManager.setVolume(volume);
  };

  const handleMuteToggle = () => {
    musicManager.toggleMute();
  };

  const handleTimeChange = (e) => {
    const time = parseFloat(e.target.value);
    musicManager.setCurrentTime(time);
  };

  const handleShuffleToggle = () => {
    musicManager.toggleShuffle();
  };

  const handleRepeatToggle = () => {
    musicManager.toggleRepeat();
  };

  // 播放列表操作
  const handlePlayTrack = (track) => {
    musicManager.loadTrack(track);
    musicManager.play();
  };

  const handleAddToPlaylist = (track) => {
    musicManager.addToPlaylist(track);
  };

  const handleRemoveFromPlaylist = (trackId) => {
    musicManager.removeFromPlaylist(trackId);
  };

  // 格式化时间
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取唯一类型列表
  const getGenres = () => {
    const genres = [...new Set(musicManager.playlist.map(track => track.genre))];
    return ['全部', ...genres];
  };

  // 渲染播放器内容
  const renderPlayerContent = () => {
    if (isMinimized) {
      return (
        <div className="flex items-center gap-2 p-2">
          <button
            onClick={handlePlayPause}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            {state.isPlaying ? <FaPause className="w-4 h-4" /> : <FaPlay className="w-4 h-4" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {state.currentTrack?.title || '无音乐'}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {state.currentTrack?.artist || ''}
            </div>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <FaExpand className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="p-4">
        {/* 当前播放信息 */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
            {state.currentTrack?.cover ? (
              <img 
                src={state.currentTrack.cover} 
                alt={state.currentTrack.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <FaMusic className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">
              {state.currentTrack?.title || '无音乐'}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {state.currentTrack?.artist || ''}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <FaList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <FaMusic className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <FaMinus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <span>{formatTime(state.currentTime)}</span>
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={state.duration || 0}
                value={state.currentTime || 0}
                onChange={handleTimeChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <span>{formatTime(state.duration)}</span>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={handleShuffleToggle}
            className={`p-2 rounded-full ${state.isShuffle ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FaRandom className="w-4 h-4" />
          </button>
          
          <button
            onClick={handlePrevious}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <FaStepBackward className="w-4 h-4" />
          </button>
          
          <button
            onClick={handlePlayPause}
            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            {state.isPlaying ? <FaPause className="w-5 h-5" /> : <FaPlay className="w-5 h-5" />}
          </button>
          
          <button
            onClick={handleNext}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <FaStepForward className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleRepeatToggle}
            className={`p-2 rounded-full ${state.isRepeat ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FaRedo className="w-4 h-4" />
          </button>
        </div>

        {/* 音量控制 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMuteToggle}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            {state.isMuted ? <FaVolumeMute className="w-4 h-4" /> : <FaVolumeUp className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={state.volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-500 w-8">
            {Math.round(state.volume * 100)}%
          </span>
        </div>

        {/* 播放列表 */}
        {showPlaylist && (
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <FaSearch className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="搜索音乐..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            
            <div className="flex gap-2 mb-3">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                {getGenres().map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="title">标题</option>
                <option value="artist">艺术家</option>
                <option value="album">专辑</option>
                <option value="year">年份</option>
                <option value="duration">时长</option>
              </select>
            </div>
            
            <div className="max-h-48 overflow-y-auto">
              {filteredPlaylist.map((track, index) => (
                <div
                  key={track.id}
                  className={`flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer ${
                    state.currentTrack?.id === track.id ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => handlePlayTrack(track)}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                    <FaMusic className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{track.title}</div>
                    <div className="text-xs text-gray-500 truncate">{track.artist}</div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToPlaylist(track);
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <FaPlus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromPlaylist(track.id);
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 歌词显示 */}
        {showLyrics && state.currentTrack && (
          <div className="mt-4 border-t pt-4">
            <LyricsDisplay 
              currentMusic={state.currentTrack}
              currentTime={state.currentTime}
              isVisible={showLyrics}
              onClose={() => setShowLyrics(false)}
            />
          </div>
        )}
      </div>
    );
  };

  // 根据模式渲染不同的容器
  const getContainerStyle = () => {
    const baseStyle = {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    };

    switch (mode) {
      case 'draggable':
        return {
          ...baseStyle,
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '320px',
          zIndex: 1000,
          cursor: isDragging ? 'grabbing' : 'grab'
        };
      case 'minimized':
        return {
          ...baseStyle,
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '300px',
          zIndex: 1000
        };
      default: // fixed
        return {
          ...baseStyle,
          width: '100%',
          maxWidth: '400px'
        };
    }
  };

  return (
    <>
      <audio ref={audioRef} />
      
      <div
        ref={playerRef}
        className={`music-player ${className}`}
        style={getContainerStyle()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {renderPlayerContent()}
      </div>
    </>
  );
}

export default UnifiedMusicPlayer;
