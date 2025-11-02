/**
 * 统一音乐管理器
 * 整合所有音乐功能，提供统一的API
 */

class MusicManager {
  constructor() {
    this.audio = null;
    this.currentTrack = null;
    this.playlist = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.volume = 1;
    this.isMuted = false;
    this.isShuffle = false;
    this.isRepeat = false;
    this.listeners = new Map();
    
    this.initializeAudio();
  }

  /**
   * 初始化音频元素
   */
  initializeAudio() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.setupAudioEvents();
    }
  }

  /**
   * 设置音频事件监听
   */
  setupAudioEvents() {
    if (!this.audio) return;

    this.audio.addEventListener('timeupdate', () => {
      this.emit('timeupdate', {
        currentTime: this.audio.currentTime,
        duration: this.audio.duration
      });
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.emit('loadedmetadata', {
        duration: this.audio.duration
      });
    });

    this.audio.addEventListener('ended', () => {
      this.handleTrackEnd();
    });

    this.audio.addEventListener('error', (e) => {
      this.emit('error', e);
    });
  }

  /**
   * 加载音乐列表
   */
  async loadMusicList() {
    try {
      const response = await fetch('/music/musicList.json');
      if (response.ok) {
        const data = await response.json();
        this.playlist = data;
        this.emit('playlistLoaded', data);
        return data;
      } else {
        throw new Error('音乐列表加载失败');
      }
    } catch (error) {
      console.error('加载音乐列表失败:', error);
      // 使用默认数据
      this.playlist = this.getDefaultPlaylist();
      this.emit('playlistLoaded', this.playlist);
      return this.playlist;
    }
  }

  /**
   * 获取默认播放列表
   */
  getDefaultPlaylist() {
    return [
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
      },
      {
        id: 2,
        title: "示例音乐 2",
        artist: "示例艺术家",
        album: "示例专辑",
        duration: "4:15",
        genre: "示例类型",
        file: "/music/music list/song2.mp3",
        cover: "https://via.placeholder.com/300x300/6366f1/ffffff?text=🎵",
        year: "2024",
        liked: false
      }
    ];
  }

  /**
   * 播放音乐
   */
  async play(track = null) {
    try {
      if (track) {
        await this.loadTrack(track);
      }
      
      if (this.audio && this.currentTrack) {
        await this.audio.play();
        this.isPlaying = true;
        this.emit('play', this.currentTrack);
      }
    } catch (error) {
      console.error('播放失败:', error);
      this.emit('error', error);
    }
  }

  /**
   * 暂停音乐
   */
  pause() {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
      this.emit('pause', this.currentTrack);
    }
  }

  /**
   * 停止音乐
   */
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
      this.emit('stop', this.currentTrack);
    }
  }

  /**
   * 加载音乐文件
   */
  async loadTrack(track) {
    if (!track) return;
    
    this.currentTrack = track;
    
    if (this.audio) {
      this.audio.src = track.file;
      this.audio.load();
      this.emit('trackLoaded', track);
    }
  }

  /**
   * 设置音量
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    this.emit('volumeChange', this.volume);
  }

  /**
   * 静音/取消静音
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audio) {
      this.audio.muted = this.isMuted;
    }
    this.emit('muteChange', this.isMuted);
  }

  /**
   * 设置播放位置
   */
  setCurrentTime(time) {
    if (this.audio) {
      this.audio.currentTime = time;
    }
  }

  /**
   * 下一首
   */
  next() {
    if (this.isShuffle) {
      this.currentIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    }
    
    const nextTrack = this.playlist[this.currentIndex];
    if (nextTrack) {
      this.loadTrack(nextTrack);
      if (this.isPlaying) {
        this.play();
      }
    }
  }

  /**
   * 上一首
   */
  previous() {
    if (this.isShuffle) {
      this.currentIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      this.currentIndex = this.currentIndex === 0 
        ? this.playlist.length - 1 
        : this.currentIndex - 1;
    }
    
    const prevTrack = this.playlist[this.currentIndex];
    if (prevTrack) {
      this.loadTrack(prevTrack);
      if (this.isPlaying) {
        this.play();
      }
    }
  }

  /**
   * 切换随机播放
   */
  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    this.emit('shuffleChange', this.isShuffle);
  }

  /**
   * 切换循环播放
   */
  toggleRepeat() {
    this.isRepeat = !this.isRepeat;
    this.emit('repeatChange', this.isRepeat);
  }

  /**
   * 处理歌曲结束
   */
  handleTrackEnd() {
    if (this.isRepeat) {
      this.audio.currentTime = 0;
      this.play();
    } else {
      this.next();
    }
  }

  /**
   * 添加到播放列表
   */
  addToPlaylist(track) {
    this.playlist.push(track);
    this.emit('playlistUpdate', this.playlist);
  }

  /**
   * 从播放列表移除
   */
  removeFromPlaylist(trackId) {
    this.playlist = this.playlist.filter(track => track.id !== trackId);
    this.emit('playlistUpdate', this.playlist);
  }

  /**
   * 清空播放列表
   */
  clearPlaylist() {
    this.playlist = [];
    this.currentIndex = 0;
    this.stop();
    this.emit('playlistUpdate', this.playlist);
  }

  /**
   * 搜索音乐
   */
  searchMusic(query) {
    if (!query) return this.playlist;
    
    const lowerQuery = query.toLowerCase();
    return this.playlist.filter(track => 
      track.title.toLowerCase().includes(lowerQuery) ||
      track.artist.toLowerCase().includes(lowerQuery) ||
      track.album.toLowerCase().includes(lowerQuery) ||
      track.genre.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * 按类型筛选
   */
  filterByGenre(genre) {
    if (!genre || genre === '全部') return this.playlist;
    return this.playlist.filter(track => track.genre === genre);
  }

  /**
   * 排序音乐
   */
  sortMusic(sortBy) {
    const sorted = [...this.playlist];
    
    switch (sortBy) {
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'artist':
        return sorted.sort((a, b) => a.artist.localeCompare(b.artist));
      case 'album':
        return sorted.sort((a, b) => a.album.localeCompare(b.album));
      case 'year':
        return sorted.sort((a, b) => b.year - a.year);
      case 'duration':
        return sorted.sort((a, b) => this.parseDuration(b.duration) - this.parseDuration(a.duration));
      default:
        return sorted;
    }
  }

  /**
   * 解析时长
   */
  parseDuration(duration) {
    const parts = duration.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }

  /**
   * 获取当前状态
   */
  getState() {
    return {
      currentTrack: this.currentTrack,
      isPlaying: this.isPlaying,
      volume: this.volume,
      isMuted: this.isMuted,
      isShuffle: this.isShuffle,
      isRepeat: this.isRepeat,
      playlist: this.playlist,
      currentIndex: this.currentIndex,
      currentTime: this.audio ? this.audio.currentTime : 0,
      duration: this.audio ? this.audio.duration : 0
    };
  }

  /**
   * 事件监听
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * 移除事件监听
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`事件监听器错误 (${event}):`, error);
        }
      });
    }
  }

  /**
   * 销毁管理器
   */
  destroy() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }
    this.listeners.clear();
  }
}

// 创建全局实例
const musicManager = new MusicManager();

export default musicManager;
