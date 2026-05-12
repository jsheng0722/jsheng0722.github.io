import React, { useState, useEffect, useMemo } from 'react';
import { getFileType, getTypeInfo, formatFileSize } from '../../utils/fileTypeDetector';
import { useI18n } from '../../context/I18nContext';
import MarkdownViewer from './MarkdownViewer';
import TextViewer from './TextViewer';
import ImageViewer from './ImageViewer';
import AudioPlayer from './AudioPlayer';
import VideoPlayer from './VideoPlayer';
import CodeViewer from './CodeViewer';
import PdfViewer from './PdfViewer';
import ExcelViewer from './ExcelViewer';
import DocxViewer from './DocxViewer';
import HtmlViewer from './HtmlViewer';
import EnhancedUnsupportedViewer from './EnhancedUnsupportedViewer';
import FullscreenViewer from './FullscreenViewer';
import { Loading, EmptyState } from '../UI';

function UniversalViewer({
  file,
  filePath,
  showHeader = true,
  className = ''
}) {
  const { t } = useI18n();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileMetadata, setFileMetadata] = useState(null);

  const fileName = file?.name || filePath?.split('/').pop() || '';
  const fileType = useMemo(() => getFileType(fileName), [fileName]);
  const typeInfo = useMemo(() => getTypeInfo(fileName), [fileName]);

  useEffect(() => {
    if (!filePath) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fullPath = `/${filePath.replace(/^\//, '')}`;

    fetch(fullPath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`${t('UniversalViewerLoadFailed')}: ${response.statusText}`);
        }
        if (fileType === 'image' || fileType === 'audio' || fileType === 'video' || fileType === 'pdf') {
          return response.blob();
        }
        return response.text();
      })
      .then(data => {
        if (fileType === 'image' || fileType === 'audio' || fileType === 'video' || fileType === 'pdf') {
          const blobUrl = URL.createObjectURL(data);
          setContent(blobUrl);
          setFileMetadata({
            size: data.size,
            type: data.type
          });
        } else {
          setContent(data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading file:', error);
        setError(error.message);
        setLoading(false);
      });

    return () => {
      if (content && content.startsWith('blob:')) {
        URL.revokeObjectURL(content);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filePath, fileType, t]);

  if (!filePath) {
    return (
      <EmptyState
        title={t('UniversalViewerNoFile')}
        description={t('UniversalViewerNoFileDesc')}
        icon="file"
      />
    );
  }

  if (loading) {
    return <Loading text={t('UniversalViewerLoading')} />;
  }

  if (error) {
    return (
      <EmptyState
        title={t('UniversalViewerError')}
        description={error}
        icon="warning"
      />
    );
  }

  const renderViewer = () => {
    switch (fileType) {
      case 'markdown':
        return <MarkdownViewer content={content} />;
      case 'text':
      case 'css':
        return <TextViewer content={content} fileType={fileType} />;
      case 'html':
        return <HtmlViewer filePath={filePath} />;
      case 'image':
        return <ImageViewer src={content} alt={fileName} />;
      case 'audio':
        return <AudioPlayer src={content} fileName={fileName} />;
      case 'video':
        return <VideoPlayer src={content} fileName={fileName} />;
      case 'pdf':
        return <PdfViewer src={content} />;
      case 'excel':
      case 'csv':
        return <ExcelViewer filePath={`/${filePath.replace(/^\//, '')}`} />;
      case 'docx':
      case 'doc':
        return <DocxViewer filePath={`/${filePath.replace(/^\//, '')}`} />;
      case 'code':
      case 'json':
      case 'xml':
      case 'yaml':
        return <CodeViewer content={content} fileName={fileName} />;
      default:
        return <EnhancedUnsupportedViewer fileName={fileName} filePath={filePath} content={content} />;
    }
  };

  return (
    <div className={`universal-viewer ${className} flex flex-col h-full`}>
      {showHeader && (
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {fileName}
              </h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                <span className={`px-2 py-0.5 rounded bg-${typeInfo.color}-100 dark:bg-${typeInfo.color}-900 text-${typeInfo.color}-700 dark:text-${typeInfo.color}-300`}>
                  {typeInfo.name}
                </span>
                {fileMetadata?.size && (
                  <span>{formatFileSize(fileMetadata.size)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="viewer-content flex-1 min-h-0 w-full overflow-hidden">
        <FullscreenViewer>
          {renderViewer()}
        </FullscreenViewer>
      </div>
    </div>
  );
}

export default UniversalViewer;
