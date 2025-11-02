/**
 * 音乐管理Hook
 * 提供统一的音乐管理接口
 */

import { useState, useEffect, useCallback } from 'react';
import musicManager from '../utils/MusicManager';

export const useMusicManager = () => {
  const [state, setState] = useState(musicManager.getState());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 更新状态
  const updateState = useCallback(() => {
    setState(musicManager.getState());
  }, []);

  // 错误处理
  const handleError = useCallback((error) => {
    setError(error.message || '音乐操作失败');
    console.error('音乐管理器错误:', error);
  }, []);

  // 初始化
  useEffect(() => {
    // 监听所有音乐管理器事件
    const events = [
      'play', 'pause', 'stop', 'trackLoaded', 'playlistLoaded', 
      'playlistUpdate', 'volumeChange', 'muteChange', 
      'shuffleChange', 'repeatChange', 'error'
    ];

    events.forEach(event => {
      musicManager.on(event, updateState);
    });

    musicManager.on('error', handleError);

    // 加载音乐列表
    setLoading(true);
    musicManager.loadMusicList()
      .then(() => {
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        setLoading(false);
        handleError(err);
      });

    return () => {
      events.forEach(event => {
        musicManager.off(event, updateState);
      });
      musicManager.off('error', handleError);
    };
  }, [updateState, handleError]);

  // 播放控制
  const play = useCallback(async (track = null) => {
    try {
      setError(null);
      await musicManager.play(track);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  const pause = useCallback(() => {
    try {
      setError(null);
      musicManager.pause();
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  const stop = useCallback(() => {
    try {
      setError(null);
      musicManager.stop();
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  const next = useCallback(() => {
    try {
      setError(null);
      musicManager.next();
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  const previous = useCallback(() => {
    try {
      setError(null);
      musicManager.previous();
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // 音量控制
  const setVolume = useCallback((volume) => {
    try {
      setError(null);
      musicManager.setVolume(volume);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  const toggleMute = useCallback(() => {
    try {
      setError(null);
      musicManager.toggleMute();
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // 播放位置控制
  const setCurrentTime = useCallback((time) => {
    try {
      setError(null);
      musicManager.setCurrentTime(time);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // 播放模式
  const toggleShuffle = useCallback(() => {
    try {
      setError(null);
      musicManager.toggleShuffle();
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  const toggleRepeat = useCallback(() => {
    try {
      setError(null);
      musicManager.toggleRepeat();
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // 播放列表管理
  const addToPlaylist = useCallback((track) => {
    try {
      setError(null);
      musicManager.addToPlaylist(track);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  const removeFromPlaylist = useCallback((trackId) => {
    try {
      setError(null);
      musicManager.removeFromPlaylist(trackId);
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  const clearPlaylist = useCallback(() => {
    try {
      setError(null);
      musicManager.clearPlaylist();
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  // 搜索和筛选
  const searchMusic = useCallback((query) => {
    try {
      setError(null);
      return musicManager.searchMusic(query);
    } catch (err) {
      handleError(err);
      return [];
    }
  }, [handleError]);

  const filterByGenre = useCallback((genre) => {
    try {
      setError(null);
      return musicManager.filterByGenre(genre);
    } catch (err) {
      handleError(err);
      return [];
    }
  }, [handleError]);

  const sortMusic = useCallback((sortBy) => {
    try {
      setError(null);
      return musicManager.sortMusic(sortBy);
    } catch (err) {
      handleError(err);
      return [];
    }
  }, [handleError]);

  // 加载音乐列表
  const loadMusicList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await musicManager.loadMusicList();
      setLoading(false);
    } catch (err) {
      setLoading(false);
      handleError(err);
    }
  }, [handleError]);

  // 格式化时间
  const formatTime = useCallback((seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // 获取唯一类型列表
  const getGenres = useCallback(() => {
    const genres = [...new Set(state.playlist.map(track => track.genre))];
    return ['全部', ...genres];
  }, [state.playlist]);

  // 获取播放进度百分比
  const getProgress = useCallback(() => {
    if (!state.duration || state.duration === 0) return 0;
    return (state.currentTime / state.duration) * 100;
  }, [state.currentTime, state.duration]);

  return {
    // 状态
    ...state,
    loading,
    error,
    
    // 播放控制
    play,
    pause,
    stop,
    next,
    previous,
    
    // 音量控制
    setVolume,
    toggleMute,
    
    // 播放位置
    setCurrentTime,
    
    // 播放模式
    toggleShuffle,
    toggleRepeat,
    
    // 播放列表管理
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    
    // 搜索和筛选
    searchMusic,
    filterByGenre,
    sortMusic,
    
    // 工具函数
    loadMusicList,
    formatTime,
    getGenres,
    getProgress
  };
};

// 专门的Hook用于不同功能
export const useMusicPlayer = () => {
  const music = useMusicManager();
  
  return {
    // 播放状态
    isPlaying: music.isPlaying,
    currentTrack: music.currentTrack,
    currentTime: music.currentTime,
    duration: music.duration,
    progress: music.getProgress(),
    
    // 播放控制
    play: music.play,
    pause: music.pause,
    stop: music.stop,
    next: music.next,
    previous: music.previous,
    
    // 播放位置
    setCurrentTime: music.setCurrentTime,
    
    // 工具函数
    formatTime: music.formatTime
  };
};

export const useMusicPlaylist = () => {
  const music = useMusicManager();
  
  return {
    // 播放列表状态
    playlist: music.playlist,
    currentIndex: music.currentIndex,
    loading: music.loading,
    error: music.error,
    
    // 播放列表管理
    addToPlaylist: music.addToPlaylist,
    removeFromPlaylist: music.removeFromPlaylist,
    clearPlaylist: music.clearPlaylist,
    
    // 搜索和筛选
    searchMusic: music.searchMusic,
    filterByGenre: music.filterByGenre,
    sortMusic: music.sortMusic,
    getGenres: music.getGenres,
    
    // 工具函数
    loadMusicList: music.loadMusicList
  };
};

export const useMusicControls = () => {
  const music = useMusicManager();
  
  return {
    // 音量控制
    volume: music.volume,
    isMuted: music.isMuted,
    setVolume: music.setVolume,
    toggleMute: music.toggleMute,
    
    // 播放模式
    isShuffle: music.isShuffle,
    isRepeat: music.isRepeat,
    toggleShuffle: music.toggleShuffle,
    toggleRepeat: music.toggleRepeat,
    
    // 状态
    error: music.error
  };
};

export default useMusicManager;
