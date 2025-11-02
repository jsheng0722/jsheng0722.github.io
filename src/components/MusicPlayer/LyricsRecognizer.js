import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaDownload, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import AudioLyricsGenerator from '../../audioLyricsGenerator';

function LyricsRecognizer({ musicFile, onLyricsGenerated, onClose }) {
  const [isRecognizing, setIsRecognizing] = useState(false);
  // const [isPlaying, setIsPlaying] = useState(false); // 暂时未使用
  const [lyrics, setLyrics] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  
  const generatorRef = useRef(null);
  // const audioRef = useRef(null); // 暂时未使用

  useEffect(() => {
    // 初始化语音识别生成器
    generatorRef.current = new AudioLyricsGenerator();
    
    return () => {
      if (generatorRef.current) {
        generatorRef.current.cleanup();
      }
    };
  }, []);

  /**
   * 开始识别歌词
   */
  const startRecognition = async () => {
    if (!generatorRef.current) {
      setError('语音识别功能未初始化');
      return;
    }

    try {
      setError(null);
      setIsRecognizing(true);
      setLyrics('');
      setStats(null);
      setProgress(0);

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 1;
        });
      }, 100);

      console.log('🎤 开始识别歌词...');
      
      // 开始识别
      const lrcContent = await generatorRef.current.startLyricsRecognition(musicFile, {
        title: '自动识别',
        artist: '未知艺术家',
        album: '未知专辑'
      });

      // 获取统计信息
      const recognitionStats = generatorRef.current.getRecognitionStats();
      
      clearInterval(progressInterval);
      setProgress(100);
      setLyrics(lrcContent);
      setStats(recognitionStats);
      setIsRecognizing(false);
      
      console.log('✅ 歌词识别完成');
      
    } catch (err) {
      console.error('❌ 识别失败:', err);
      setError(err.message || '识别过程中发生错误');
      setIsRecognizing(false);
      setProgress(0);
    }
  };

  /**
   * 停止识别
   */
  const stopRecognition = () => {
    if (generatorRef.current) {
      generatorRef.current.stopRecognition();
      setIsRecognizing(false);
      setProgress(0);
    }
  };

  /**
   * 保存歌词
   */
  const saveLyrics = () => {
    if (lyrics && onLyricsGenerated) {
      onLyricsGenerated(lyrics);
    }
  };

  /**
   * 下载歌词文件
   */
  const downloadLyrics = () => {
    const blob = new Blob([lyrics], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lyrics.lrc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FaMicrophone className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              语音识别歌词生成
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <FaStop className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          
          {/* 状态信息 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaExclamationTriangle className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900 dark:text-blue-100">使用说明</h3>
            </div>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• 点击"开始识别"后，系统会播放音乐并识别歌词</li>
              <li>• 请确保浏览器允许麦克风权限</li>
              <li>• 识别过程中请保持环境安静</li>
              <li>• 识别完成后可以编辑和保存歌词</li>
            </ul>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 dark:text-red-200 font-medium">错误</span>
              </div>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* 进度条 */}
          {isRecognizing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">识别进度</span>
                <span className="text-gray-900 dark:text-gray-100">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* 统计信息 */}
          {stats && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FaCheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-900 dark:text-green-100 font-medium">识别完成</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700 dark:text-green-300">识别段落：</span>
                  <span className="text-green-900 dark:text-green-100 font-medium">{stats.totalSegments}</span>
                </div>
                <div>
                  <span className="text-green-700 dark:text-green-300">总字数：</span>
                  <span className="text-green-900 dark:text-green-100 font-medium">{stats.totalWords}</span>
                </div>
                <div>
                  <span className="text-green-700 dark:text-green-300">平均置信度：</span>
                  <span className="text-green-900 dark:text-green-100 font-medium">
                    {(stats.averageConfidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-green-700 dark:text-green-300">音频时长：</span>
                  <span className="text-green-900 dark:text-green-100 font-medium">
                    {Math.floor(stats.duration / 60)}:{(stats.duration % 60).toFixed(0).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 歌词预览 */}
          {lyrics && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">生成的歌词</h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                  {lyrics}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {!isRecognizing && !lyrics && (
              <button
                onClick={startRecognition}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaMicrophone className="w-4 h-4" />
                开始识别
              </button>
            )}
            
            {isRecognizing && (
              <button
                onClick={stopRecognition}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <FaStop className="w-4 h-4" />
                停止识别
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {lyrics && (
              <>
                <button
                  onClick={downloadLyrics}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <FaDownload className="w-4 h-4" />
                  下载
                </button>
                <button
                  onClick={saveLyrics}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FaCheckCircle className="w-4 h-4" />
                  保存歌词
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LyricsRecognizer;
