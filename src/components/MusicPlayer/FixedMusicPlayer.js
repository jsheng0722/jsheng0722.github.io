import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaMusic, FaFileAlt, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import LyricsDisplay from './LyricsDisplay';

function FixedMusicPlayer({ onClose, position = 'bottom-left' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const volumeRef = useRef(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [showLyrics, setShowLyrics] = useState(false);

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL || ''}/music/musicList.json`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) setCurrentTrack(data[0]);
      })
      .catch(() => {
        setCurrentTrack({
          title: 'Lo-Fi Chill Beats',
          artist: 'Chill Vibes',
          cover: 'https://via.placeholder.com/150/6366f1/ffffff?text=🎵',
          file: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav',
        });
      });
  }, []);

  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) setDuration(audio.duration);
    };
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('canplay', updateDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));
    if (audio.duration && !isNaN(audio.duration)) setDuration(audio.duration);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('canplay', updateDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [currentTrack]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) audio.pause();
    else audio.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (e) => {
    const t = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (isMuted) {
      if (audio) audio.volume = volumeRef.current;
      setIsMuted(false);
    } else {
      if (audio) {
        volumeRef.current = audio.volume;
        audio.volume = 0;
      }
      setIsMuted(true);
    }
  };

  const formatTime = (t) => {
    if (isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  const coverUrl = currentTrack.cover;
  const hasCover = Boolean(coverUrl);

  const isLeft = position === 'bottom-left';

  return (
    <>
      <audio ref={audioRef} src={currentTrack.file} preload="metadata" />

      <div
        className={`fixed z-40 transition-all duration-300 ease-out ${
          isLeft ? 'left-0 bottom-0 mb-4 ml-0' : 'right-0 top-1/2 -translate-y-1/2'
        } ${isMinimized ? 'w-14' : 'w-56'}`}
      >
        <div className={`bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-xl overflow-hidden ${
          isLeft
            ? 'border-r border-gray-200/80 dark:border-gray-700/80 rounded-r-2xl ml-0 mb-0'
            : 'border-l border-gray-200/80 dark:border-gray-700/80 rounded-l-2xl'
        }`}>
          {isMinimized ? (
            <div className="p-2.5 flex flex-col items-center gap-2">
              <button
                onClick={() => setIsMinimized(false)}
                className="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-transparent hover:ring-blue-400/50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Expand"
              >
                {hasCover ? (
                  <img
                    src={coverUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white"
                  style={{ display: hasCover ? 'none' : 'flex' }}
                >
                  <FaMusic className="w-5 h-5" />
                </div>
              </button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center hover:from-blue-600 hover:to-indigo-700 shadow-lg transition-all active:scale-95"
              >
                {isPlaying ? <FaPause className="w-3.5 h-3.5" /> : <FaPlay className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Close"
                >
                  <FaTimes className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="p-3">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Music</span>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    className={`p-1.5 rounded-lg transition-colors ${showLyrics ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    title="Lyrics"
                  >
                    <FaFileAlt className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Collapse to left"
                  >
                    {isLeft ? <FaChevronLeft className="w-3.5 h-3.5" /> : <FaChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Close"
                    >
                      <FaTimes className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                  {hasCover ? (
                    <img
                      src={coverUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white"
                    style={{ display: hasCover ? 'none' : 'flex' }}
                  >
                    <FaMusic className="w-6 h-6" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{currentTrack.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentTrack.artist}</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleTimeChange}
                  className="music-slider w-full h-1 rounded-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium text-sm hover:from-blue-600 hover:to-indigo-700 shadow-md transition-all active:scale-[0.98]"
                >
                  {isPlaying ? <FaPause className="w-4 h-4" /> : <FaPlay className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button
                  onClick={toggleMute}
                  className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <FaVolumeMute className="w-4 h-4" /> : <FaVolumeUp className="w-4 h-4" />}
                </button>
              </div>

              <Link
                to="/music"
                className="mt-3 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Open music library
                <FaChevronRight className="w-3 h-3 rotate-[-90deg]" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <LyricsDisplay
        currentMusic={currentTrack}
        currentTime={currentTime}
        isVisible={showLyrics}
        onClose={() => setShowLyrics(false)}
      />

      <style>{`
        .music-slider {
          -webkit-appearance: none;
          appearance: none;
          background: linear-gradient(to right, #e5e7eb 0%, #e5e7eb 100%);
        }
        .dark .music-slider { background: linear-gradient(to right, #374151 0%, #374151 100%); }
        .music-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .music-slider::-moz-range-thumb {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          cursor: pointer;
          border: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
      `}</style>
    </>
  );
}

export default FixedMusicPlayer;
