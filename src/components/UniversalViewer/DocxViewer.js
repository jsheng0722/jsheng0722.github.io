import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { FaDownload, FaFileWord } from 'react-icons/fa';
import { useI18n } from '../../context/I18nContext';

function DocxViewer({ filePath }) {
  const { t } = useI18n();
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDocx = async () => {
      try {
        setLoading(true);
        const response = await fetch(filePath);
        const arrayBuffer = await response.arrayBuffer();

        const result = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            styleMap: [
              "p[style-name='Heading 1'] => h1:fresh",
              "p[style-name='Heading 2'] => h2:fresh",
              "p[style-name='Heading 3'] => h3:fresh",
              "b => strong",
              "i => em",
              "u => u"
            ]
          }
        );

        setHtmlContent(result.value);

        if (result.messages && result.messages.length > 0) {
          console.warn('Docx conversion warnings:', result.messages);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading Docx:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (filePath) {
      loadDocx();
    }
  }, [filePath]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filePath.split('/').pop() || 'document.docx';
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">{t('UniversalViewerLoading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 dark:text-red-400">
          <p>{t('UniversalViewerError')}: {error}</p>
          <p className="text-sm mt-2">{t('UniversalViewerDocxNotSupported')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="docx-viewer">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <FaFileWord className="w-5 h-5 text-blue-500" />
          <span className="text-sm">{t('UniversalViewerWordDocument')}</span>
        </div>

        <button
          onClick={handleDownload}
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all flex items-center gap-2"
          title={t('UniversalViewerDownload')}
        >
          <FaDownload className="w-4 h-4" />
          <span className="text-sm">{t('UniversalViewerDownload')}</span>
        </button>
      </div>

      <div
        className="prose dark:prose-invert max-w-none p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}

export default DocxViewer;
