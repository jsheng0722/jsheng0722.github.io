import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaExpand, FaCompress, FaFileAlt } from 'react-icons/fa';
import { parseLRC, getCurrentLyric, formatLyricTime } from '../../utils/lrcParser';

function LyricsDisplay({ currentMusic, currentTime, isVisible, onClose }) {
  const [lyricsData, setLyricsData] = useState({ metadata: {}, lyrics: [] });
  const [currentLyric, setCurrentLyric] = useState({ index: -1, text: '', prevText: '', nextText: '' });
  const [showFullLyrics, setShowFullLyrics] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const currentLyricRef = useRef(null);

  // 加载歌词文件
  useEffect(() => {
    if (!currentMusic?.lyricsFile) {
      setLyricsData({ metadata: {}, lyrics: [] });
      return;
    }

    fetch(currentMusic.lyricsFile)
      .then(response => response.text())
      .then(lrcContent => {
        const parsed = parseLRC(lrcContent);
        setLyricsData(parsed);
      })
      .catch(error => {
        console.error('加载歌词失败:', error);
        setLyricsData({ metadata: {}, lyrics: [] });
      });
  }, [currentMusic]);

  // 更新当前歌词
  useEffect(() => {
    if (lyricsData.lyrics.length > 0) {
      const current = getCurrentLyric(lyricsData.lyrics, currentTime);
      setCurrentLyric(current);
    }
  }, [lyricsData, currentTime]);

  // 自动滚动到当前歌词
  useEffect(() => {
    if (currentLyricRef.current && !showFullLyrics) {
      currentLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentLyric.index, showFullLyrics]);

  if (!isVisible || !currentMusic) return null;

  const hasLyrics = lyricsData.lyrics.length > 0;

  return (
    <>
      {/* 背景遮罩 */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* 歌词窗口 */}
      <div className={`fixed ${
        isExpanded 
          ? 'inset-4 md:inset-10' 
          : 'right-20 top-1/2 transform -translate-y-1/2 w-96 max-h-[80vh]'
      } z-50 transition-all duration-300`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 h-full flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FaFileAlt className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">歌词</h3>
          </div>
          <div className="flex items-center gap-2">
            {hasLyrics && (
              <button
                onClick={() => setShowFullLyrics(!showFullLyrics)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showFullLyrics ? '同步模式' : '完整歌词'}
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title={isExpanded ? '缩小' : '展开'}
            >
              {isExpanded ? <FaCompress className="w-4 h-4" /> : <FaExpand className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 歌曲信息 */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">{currentMusic.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{currentMusic.artist}</p>
        </div>

        {/* 歌词内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          {!hasLyrics ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">暂无歌词</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                请在歌曲文件夹中添加 lyrics.lrc 文件
              </p>
            </div>
          ) : showFullLyrics ? (
            // 完整歌词模式
            <div className="space-y-3">
              {lyricsData.lyrics.map((lyric, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg transition-all ${
                    index === currentLyric.index
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono min-w-[50px]">
                      {formatLyricTime(lyric.time)}
                    </span>
                    <p className={`text-sm ${
                      index === currentLyric.index
                        ? 'text-blue-600 dark:text-blue-400 font-medium text-base'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {lyric.text || '♪'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // 同步滚动模式
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              {/* 上一句 */}
              {currentLyric.prevText && (
                <p className="text-gray-400 dark:text-gray-500 text-center text-sm">
                  {currentLyric.prevText}
                </p>
              )}
              
              {/* 当前句 */}
              <div ref={currentLyricRef}>
                <p className="text-blue-600 dark:text-blue-400 text-center text-xl font-medium leading-relaxed px-4">
                  {currentLyric.text || '♪'}
                </p>
              </div>
              
              {/* 下一句 */}
              {currentLyric.nextText && (
                <p className="text-gray-400 dark:text-gray-500 text-center text-sm">
                  {currentLyric.nextText}
                </p>
              )}

              {/* 当前时间显示 */}
              <div className="text-xs text-gray-400 mt-4">
                {formatLyricTime(currentTime)}
              </div>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        {hasLyrics && !showFullLyrics && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              歌词会随音乐自动滚动显示
            </p>
          </div>
        )}
        </div>
      </div>
    </>
  );
}

export default LyricsDisplay;
