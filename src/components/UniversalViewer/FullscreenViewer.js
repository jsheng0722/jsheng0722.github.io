import React, { useState, useCallback } from 'react';
import { FaExpand, FaCompress } from 'react-icons/fa';
import { useI18n } from '../../context/I18nContext';

function FullscreenViewer({ children }) {
  const { t } = useI18n();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = React.useRef(null);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if (containerRef.current.webkitRequestFullscreen) {
          await containerRef.current.webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen =
        document.fullscreenElement || document.webkitFullscreenElement;
      setIsFullscreen(!!isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`fullscreen-viewer relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}
    >
      <button
        onClick={toggleFullscreen}
        className={`absolute top-2 right-2 z-20 p-2 rounded-lg transition-all ${
          isFullscreen
            ? 'bg-gray-800 hover:bg-gray-700 text-white'
            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
        }`}
        title={isFullscreen ? t('UniversalViewerExitFullscreen') : t('UniversalViewerFullscreen')}
      >
        {isFullscreen ? (
          <FaCompress className="w-5 h-5" />
        ) : (
          <FaExpand className="w-5 h-5" />
        )}
      </button>
      <div className={`${isFullscreen ? 'h-screen' : 'h-full'}`}>
        {children}
      </div>
    </div>
  );
}

export default FullscreenViewer;
