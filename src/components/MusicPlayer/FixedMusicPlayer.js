import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaMusic, FaStepBackward, FaStepForward, FaRandom, FaRedo, FaFileAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import LyricsDisplay from './LyricsDisplay';

function FixedMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [showLyrics, setShowLyrics] = useState(false);

  // 从musicList.json加载当前播放的音乐
  useEffect(() => {
    fetch('/music/musicList.json')
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          setCurrentTrack(data[0]); // 默认加载第一首歌
        }
      })
      .catch(error => {
        console.error('加载音乐列表失败:', error);
        // 使用默认数据
        setCurrentTrack({
          title: "Lo-Fi Chill Beats",
          artist: "Chill Vibes",
          cover: "https://via.placeholder.com/150/6366f1/ffffff?text=🎵",
          file: "https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav"
        });
      });
  }, []);
  
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('canplay', updateDuration);
    audio.addEventListener('ended', handleEnded);

    // 立即尝试获取时长
    if (audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('canplay', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  // 播放控制
  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (e) => {
    const audio = audioRef.current;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 如果没有加载音乐，不显示播放器
  if (!currentTrack) {
    return null;
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack.file}
        preload="metadata"
      />
      
      {/* 固定侧边栏音乐播放器 */}
      <div className={`fixed right-0 top-1/2 transform -translate-y-1/2 z-40 transition-all duration-300 ${
        isMinimized ? 'w-16' : 'w-80'
      }`}>
        <div className="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg rounded-l-lg overflow-hidden">
          {isMinimized ? (
            // 最小化状态 - 显示封面图片
            <div className="p-2 flex flex-col items-center space-y-2">
              <button
                onClick={() => setIsMinimized(false)}
                className="relative w-12 h-12 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                title="展开音乐播放器"
              >
                {currentTrack?.cover ? (
                  <img
                    src={currentTrack.cover}
                    alt={currentTrack.title || '音乐'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="w-full h-full bg-blue-600 flex items-center justify-center" style={{ display: currentTrack?.cover ? 'none' : 'flex' }}>
                  <FaMusic className="w-6 h-6 text-white" />
                </div>
              </button>
              <button
                onClick={togglePlay}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                {isPlaying ? <FaPause className="w-3 h-3" /> : <FaPlay className="w-3 h-3" />}
              </button>
            </div>
          ) : (
            // 完整状态
            <div className="p-4">
              {/* 头部 */}
              <div className="flex items-center justify-between mb-4">
                <Link
                  to="/music"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <FaMusic className="w-5 h-5" />
                  <span className="font-medium">音乐</span>
                </Link>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  title="最小化"
                >
                  ×
                </button>
              </div>

              {/* 当前播放信息 */}
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {currentTrack.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {currentTrack.artist}
                  </p>
                </div>
              </div>

              {/* 进度条 */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleTimeChange}
                  className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* 控制按钮 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowLyrics(!showLyrics)}
                    className={`p-1 transition-colors ${
                      showLyrics 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                    title="歌词"
                  >
                    <FaFileAlt className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <FaRandom className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <FaStepBackward className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={togglePlay}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  {isPlaying ? <FaPause className="w-5 h-5" /> : <FaPlay className="w-5 h-5" />}
                </button>

                <div className="flex items-center space-x-2">
                  <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <FaStepForward className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <FaRedo className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 音量控制 */}
              <div className="flex items-center space-x-2">
                <button onClick={toggleMute} className="p-1">
                  {isMuted ? <FaVolumeMute className="w-4 h-4 text-gray-500" /> : <FaVolumeUp className="w-4 h-4 text-gray-500" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* 快速访问 */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/music"
                  className="block w-full text-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  打开音乐库
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 歌词显示组件 */}
      <LyricsDisplay
        currentMusic={currentTrack}
        currentTime={currentTime}
        isVisible={showLyrics}
        onClose={() => setShowLyrics(false)}
      />

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </>
  );
}

export default FixedMusicPlayer;
