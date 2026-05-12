import React from 'react';
import { FaDownload, FaExclamationTriangle } from 'react-icons/fa';
import { useI18n } from '../../context/I18nContext';

function UnsupportedViewer({ fileName }) {
  const { t } = useI18n();

  const handleDownload = () => {
    window.open(fileName, '_blank');
  };

  return (
    <div className="unsupported-viewer">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <FaExclamationTriangle className="w-10 h-10 text-yellow-500" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {t('UniversalViewerUnsupported')}
        </h3>

        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
          {t('UniversalViewerUnsupportedDesc')}
        </p>

        {fileName && (
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg mb-6">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {fileName}
            </span>
          </div>
        )}

        <button
          onClick={handleDownload}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center gap-2"
        >
          <FaDownload className="w-5 h-5" />
          <span>{t('UniversalViewerDownload')}</span>
        </button>
      </div>
    </div>
  );
}

export default UnsupportedViewer;
