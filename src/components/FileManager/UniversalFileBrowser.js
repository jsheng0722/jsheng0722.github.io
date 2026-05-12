import React, { useState, useEffect, useMemo } from 'react';
import {
  FaFolder, FaFile, FaFileAlt, FaMusic, FaImage, FaCode,
  FaVideo, FaSync, FaSearch, FaFilter,
  FaFilePdf, FaFileWord, FaFileExcel, FaFileArchive,
  FaDownload
} from 'react-icons/fa';
import {
  getFileType, getTypeInfo,
  formatFileSize
} from '../../utils/fileTypeDetector';
import { useI18n } from '../../context/I18nContext';
import { Button, Card, Dialog, Badge, EmptyState, Loading, Input } from '../UI';
import { UniversalViewer } from '../UniversalViewer';

const TYPE_ICONS = {
  markdown: FaFileAlt,
  docx: FaFileWord,
  doc: FaFileWord,
  pdf: FaFilePdf,
  text: FaFileAlt,
  excel: FaFileExcel,
  csv: FaFileExcel,
  image: FaImage,
  audio: FaMusic,
  video: FaVideo,
  code: FaCode,
  html: FaCode,
  css: FaCode,
  json: FaCode,
  archive: FaFileArchive
};

function UniversalFileBrowser({ basePath = '/files' }) {
  const { t } = useI18n();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/metadata/file-index.json');
        if (!response.ok) {
          throw new Error('Failed to load file index');
        }
        const indexData = await response.json();
        setFiles(indexData.files || []);
        setLoading(false);
      } catch (err) {
        console.error('Error loading files:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadFiles();
  }, [refreshKey]);

  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesSearch = searchQuery === '' ||
        file.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' ||
        file.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [files, searchQuery, categoryFilter]);

  const refreshFiles = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getFileIcon = (file) => {
    const type = getFileType(file.filename || file.name || '');
    const IconComponent = TYPE_ICONS[type] || FaFile;
    const typeInfo = getTypeInfo(file.filename || file.name || '');
    const colorClass = `text-${typeInfo.color}-500`;

    return <IconComponent className={`w-6 h-6 ${colorClass}`} />;
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  const handleClosePreview = () => {
    setSelectedFile(null);
  };

  const handleDownload = (file) => {
    const fullPath = `/${file.path.replace(/^\//, '')}`;
    window.open(fullPath, '_blank');
  };

  if (loading) {
    return <Loading text={t('UniversalFileBrowserLoading')} />;
  }

  if (error) {
    return (
      <EmptyState
        title={t('UniversalFileBrowserError')}
        description={error}
        icon="warning"
        action={
          <Button onClick={refreshFiles} icon={<FaSync />}>
            {t('UniversalFileBrowserRetry')}
          </Button>
        }
      />
    );
  }

  return (
    <div className="universal-file-browser">
      <Card className="h-full flex flex-col">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t('UniversalFileBrowserTitle')}
            </h2>
            <Button
              onClick={refreshFiles}
              size="small"
              variant="ghost"
              icon={<FaSync />}
            >
              {t('UniversalFileBrowserRefresh')}
            </Button>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                type="text"
                placeholder={t('UniversalFileBrowserSearchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<FaSearch />}
              />
            </div>

            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">{t('UniversalFileBrowserAll')}</option>
                <option value="documents">{t('UniversalFileBrowserDocuments')}</option>
                <option value="media">{t('UniversalFileBrowserMedia')}</option>
                <option value="archives">{t('UniversalFileBrowserArchives')}</option>
              </select>
            </div>

            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                title={t('UniversalFileBrowserGridView')}
              >
                <FaFolder className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                title={t('UniversalFileBrowserListView')}
              >
                <FaFileAlt className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {t('UniversalFileBrowserShowing')} {filteredFiles.length} {t('UniversalFileBrowserFiles')}
          </div>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          {filteredFiles.length === 0 ? (
            <EmptyState
              title={t('UniversalFileBrowserNoFiles')}
              description={t('UniversalFileBrowserNoFilesDesc')}
              icon="folder"
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFiles.map((file, index) => (
                <div
                  key={file.id || file.path || index}
                  onClick={() => handleFileClick(file)}
                  className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600"
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      {getFileIcon(file)}
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={file.name}>
                      {file.name || file.filename}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {getTypeInfo(file.filename || file.name || '').name}
                    </p>
                    {file.size && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatFileSize(file.size)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file, index) => (
                <div
                  key={file.id || file.path || index}
                  onClick={() => handleFileClick(file)}
                  className="flex items-center p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <div className="mr-3">
                    {getFileIcon(file)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {file.name || file.filename}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getTypeInfo(file.filename || file.name || '').name}
                      {file.size && ` · ${formatFileSize(file.size)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.tags && file.tags.length > 0 && (
                      <div className="flex gap-1">
                        {file.tags.slice(0, 2).map((tag, i) => (
                          <Badge key={i} variant="secondary" size="small">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title={t('UniversalFileBrowserDownload')}
                    >
                      <FaDownload className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-2 text-sm text-gray-500 dark:text-gray-400">
          {t('UniversalFileBrowserTotal')} {files.length} {t('UniversalFileBrowserFilesIn')}
        </div>
      </Card>

      <Dialog
        isOpen={!!selectedFile}
        onClose={handleClosePreview}
        title={selectedFile?.name || selectedFile?.filename || ''}
        size="large"
      >
        {selectedFile && (
          <div className="h-[600px]">
            <UniversalViewer
              file={selectedFile}
              filePath={selectedFile.path}
              showHeader={false}
            />
          </div>
        )}
      </Dialog>
    </div>
  );
}

export default UniversalFileBrowser;
