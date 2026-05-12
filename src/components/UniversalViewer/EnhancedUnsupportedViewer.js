import React, { useState } from 'react';
import {
  FaDownload,
  FaExclamationTriangle,
  FaGlobe,
  FaFileAlt,
  FaEye
} from 'react-icons/fa';
import { useI18n } from '../../context/I18nContext';
import TextViewer from './TextViewer';

function EnhancedUnsupportedViewer({ fileName, filePath, content }) {
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState('default');

  const handleDownload = () => {
    window.open(filePath, '_blank');
  };

  const getGoogleViewerUrl = () => {
    const fullUrl = window.location.origin + '/' + filePath.replace(/^\//, '');
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
  };

  const getOfficeViewerUrl = () => {
    const fullUrl = window.location.origin + '/' + filePath.replace(/^\//, '');
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fullUrl)}`;
  };

  if (viewMode === 'text') {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="mb-4 flex gap-2 shrink-0">
          <button
            onClick={() => setViewMode('default')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm transition-colors"
          >
            <FaFileAlt className="inline mr-2" />
            返回
          </button>
        </div>
        <div className="flex-1 min-h-0 w-full">
          <TextViewer content={content} fileType="text" />
        </div>
      </div>
    );
  }

  if (viewMode === 'google') {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="mb-4 flex gap-2 shrink-0">
          <button
            onClick={() => setViewMode('default')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm transition-colors"
          >
            <FaFileAlt className="inline mr-2" />
            返回
          </button>
        </div>
        <iframe
          src={getGoogleViewerUrl()}
          className="w-full flex-1 min-h-0 border border-gray-200 dark:border-gray-700 rounded-lg"
          title="Google Docs Viewer"
        />
      </div>
    );
  }

  if (viewMode === 'office') {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="mb-4 flex gap-2 shrink-0">
          <button
            onClick={() => setViewMode('default')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm transition-colors"
          >
            <FaFileAlt className="inline mr-2" />
            返回
          </button>
        </div>
        <iframe
          src={getOfficeViewerUrl()}
          className="w-full flex-1 min-h-0 border border-gray-200 dark:border-gray-700 rounded-lg"
          title="Microsoft Office Online Viewer"
        />
      </div>
    );
  }

  const ext = fileName?.split('.').pop()?.toLowerCase() || '';
  const isOfficeFile = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext);

  return (
    <div className="unsupported-viewer w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center justify-center py-12 max-w-2xl w-full">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <FaExclamationTriangle className="w-10 h-10 text-yellow-500" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {t('UniversalViewerUnsupported')}
        </h3>

        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
          您可以尝试以下预览方式
        </p>

        {fileName && (
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg mb-6">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {fileName}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {isOfficeFile && (
            <>
              <button
                onClick={() => setViewMode('office')}
                className="px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all flex items-center gap-3 justify-center text-base font-medium"
              >
                <FaGlobe className="w-5 h-5" />
                <span>Office Online</span>
              </button>
              <button
                onClick={() => setViewMode('google')}
                className="px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center gap-3 justify-center text-base font-medium"
              >
                <FaGlobe className="w-5 h-5" />
                <span>Google Docs</span>
              </button>
            </>
          )}

          <button
            onClick={() => setViewMode('text')}
            className="px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all flex items-center gap-3 justify-center text-base font-medium"
          >
            <FaEye className="w-5 h-5" />
            <span>文本预览</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center gap-3 justify-center text-base font-medium"
          >
            <FaDownload className="w-5 h-5" />
            <span>{t('UniversalViewerDownload')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default EnhancedUnsupportedViewer;
