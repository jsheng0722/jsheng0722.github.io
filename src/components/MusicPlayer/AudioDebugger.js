import React, { useState, useEffect } from 'react';
import { FaBug, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

function AudioDebugger({ audioRef, currentMusic }) {
  const [debugInfo, setDebugInfo] = useState({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (!audioRef?.current || !currentMusic) return;

    const audio = audioRef.current;
    
    const updateDebugInfo = () => {
      setDebugInfo({
        src: audio.src,
        currentTime: audio.currentTime,
        duration: audio.duration,
        readyState: audio.readyState,
        networkState: audio.networkState,
        paused: audio.paused,
        ended: audio.ended,
        error: audio.error?.message || null,
        canPlay: !isNaN(audio.duration) && audio.duration > 0,
        readyStateText: getReadyStateText(audio.readyState),
        networkStateText: getNetworkStateText(audio.networkState)
      });
    };

    const interval = setInterval(updateDebugInfo, 1000);
    updateDebugInfo();

    return () => clearInterval(interval);
  }, [audioRef, currentMusic]);

  const getReadyStateText = (state) => {
    const states = {
      0: 'HAVE_NOTHING - 无信息',
      1: 'HAVE_METADATA - 有元数据',
      2: 'HAVE_CURRENT_DATA - 有当前数据',
      3: 'HAVE_FUTURE_DATA - 有未来数据',
      4: 'HAVE_ENOUGH_DATA - 有足够数据'
    };
    return states[state] || '未知';
  };

  const getNetworkStateText = (state) => {
    const states = {
      0: 'NETWORK_EMPTY - 未初始化',
      1: 'NETWORK_IDLE - 空闲',
      2: 'NETWORK_LOADING - 加载中',
      3: 'NETWORK_NO_SOURCE - 无资源'
    };
    return states[state] || '未知';
  };

  if (!currentMusic) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="p-2 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="音频调试信息"
      >
        <FaBug className="w-4 h-4" />
      </button>

      {showDebug && (
        <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">音频调试信息</h4>
            <button
              onClick={() => setShowDebug(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              {debugInfo.canPlay ? (
                <FaCheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              ) : (
                <FaExclamationTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-medium">音频状态: </span>
                <span className={debugInfo.canPlay ? 'text-green-600' : 'text-yellow-600'}>
                  {debugInfo.canPlay ? '可播放' : '未就绪'}
                </span>
              </div>
            </div>

            <div className="border-t pt-2 space-y-1 text-xs">
              <div><span className="font-medium">文件路径:</span> {currentMusic.file}</div>
              <div><span className="font-medium">当前时间:</span> {debugInfo.currentTime?.toFixed(2)} 秒</div>
              <div><span className="font-medium">总时长:</span> {debugInfo.duration?.toFixed(2)} 秒</div>
              <div><span className="font-medium">就绪状态:</span> {debugInfo.readyStateText}</div>
              <div><span className="font-medium">网络状态:</span> {debugInfo.networkStateText}</div>
              <div><span className="font-medium">暂停状态:</span> {debugInfo.paused ? '是' : '否'}</div>
              <div><span className="font-medium">播放结束:</span> {debugInfo.ended ? '是' : '否'}</div>
              {debugInfo.error && (
                <div className="text-red-600">
                  <span className="font-medium">错误:</span> {debugInfo.error}
                </div>
              )}
            </div>

            <div className="border-t pt-2 mt-2">
              <h5 className="font-medium mb-1">诊断建议:</h5>
              <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                {!debugInfo.canPlay && (
                  <>
                    <li>• 检查音频文件路径是否正确</li>
                    <li>• 确认文件格式是否支持（推荐MP3）</li>
                    <li>• 查看浏览器控制台错误信息</li>
                  </>
                )}
                {debugInfo.readyState < 2 && (
                  <li>• 音频正在加载中，请稍候...</li>
                )}
                {debugInfo.networkState === 3 && (
                  <li className="text-red-600">• 音频文件无法访问，检查路径</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AudioDebugger;
