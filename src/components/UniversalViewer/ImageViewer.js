import React, { useState } from 'react';
import { FaExpand, FaCompress, FaDownload } from 'react-icons/fa';
import { useI18n } from '../../context/I18nContext';

function ImageViewer({ src, alt }) {
  const { t } = useI18n();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    link.click();
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
          title={t('UniversalViewerExitFullscreen')}
        >
          <FaCompress className="w-5 h-5" />
        </button>
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full object-contain"
          onClick={toggleFullscreen}
        />
      </div>
    );
  }

  return (
    <div className="image-viewer">
      <div className="flex justify-end gap-2 mb-4">
        <button
          onClick={handleDownload}
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center gap-2"
          title={t('UniversalViewerDownload')}
        >
          <FaDownload className="w-4 h-4" />
          <span>{t('UniversalViewerDownload')}</span>
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all"
          title={t('UniversalViewerFullscreen')}
        >
          <FaExpand className="w-4 h-4" />
        </button>
      </div>
      <div className="flex justify-center">
        <img
          src={src}
          alt={alt}
          className="max-w-full h-auto rounded-lg shadow-lg cursor-pointer hover:opacity-95 transition-opacity"
          onClick={toggleFullscreen}
        />
      </div>
    </div>
  );
}

export default ImageViewer;
