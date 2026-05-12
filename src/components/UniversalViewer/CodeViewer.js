import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaCopy, FaCheck, FaDownload } from 'react-icons/fa';
import { useI18n } from '../../context/I18nContext';
import { getLanguageFromExtension } from '../../utils/fileTypeDetector';

function CodeViewer({ content, fileName }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const language = getLanguageFromExtension(fileName);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
    link.download = fileName || 'code';
    link.click();
  };

  return (
    <div className="code-viewer relative group w-full h-full">
      <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
        <button
          onClick={handleCopy}
          className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all flex items-center gap-2 text-sm"
          title={t('UniversalViewerCopy')}
        >
          {copied ? (
            <>
              <FaCheck className="w-4 h-4" />
              <span>{t('UniversalViewerCopied')}</span>
            </>
          ) : (
            <>
              <FaCopy className="w-4 h-4" />
              <span>{t('UniversalViewerCopy')}</span>
            </>
          )}
        </button>
        <button
          onClick={handleDownload}
          className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all"
          title={t('UniversalViewerDownload')}
        >
          <FaDownload className="w-4 h-4" />
        </button>
      </div>

      {fileName && (
        <div className="mb-2 px-4 py-2 bg-gray-800 dark:bg-gray-900 text-gray-300 rounded-t-lg text-sm font-mono">
          {fileName}
        </div>
      )}

      <div className="overflow-auto h-full rounded-lg">
        <SyntaxHighlighter
          style={oneDark}
          language={language}
          PreTag="div"
          className="rounded-lg !m-0 !h-full"
          customStyle={{
            margin: 0,
            borderRadius: fileName ? '0 0 0.5rem 0.5rem' : '0.5rem',
            fontSize: '0.875rem',
            minHeight: '100%'
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export default CodeViewer;
