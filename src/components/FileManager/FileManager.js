import React, { useState, useMemo } from 'react';
import { FaFolder, FaFile, FaFileAlt, FaMusic, FaImage, FaCode, FaVideo, FaSync } from 'react-icons/fa';
import { Button, Card, Dialog, Badge } from '../UI';

function FileManager() {
  const [currentPath, setCurrentPath] = useState('/');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'size', 'date', 'type'
  const [refreshKey, setRefreshKey] = useState(0); // 用于强制刷新
  const [selectedFile, setSelectedFile] = useState(null);

  // 从实际存储内容生成文件系统数据
  const generateFileSystem = () => {
    const fileSystem = {
      '/': {
        type: 'folder',
        children: {}
      }
    };

    // 安全解析localStorage数据的辅助函数
    const safeParseJSON = (key, defaultValue = []) => {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
      } catch (error) {
        console.error(`解析${key}数据失败:`, error);
        return defaultValue;
      }
    };

    // 添加笔记文件夹
    const notes = safeParseJSON('userNotes');
    if (notes.length > 0) {
      fileSystem['/notes'] = {
        type: 'folder',
        path: '/notes',
        children: {},
        icon: FaFileAlt,
        color: 'text-blue-500',
        count: notes.length,
        lastModified: notes.length > 0 ? new Date(Math.max(...notes.map(note => new Date(note.updatedAt || note.createdAt).getTime()))).toLocaleDateString() : null
      };
      fileSystem['/'].children['笔记'] = fileSystem['/notes'];
      
      // 添加笔记文件
      notes.forEach((note, index) => {
        const fileName = note.title || `未命名笔记${index + 1}`;
        fileSystem['/notes'].children[fileName] = {
          type: 'file',
          icon: FaFileAlt,
          color: 'text-blue-500',
          category: '笔记',
          metadata: {
            category: note.category,
            tags: note.tags || [],
            author: note.author,
            date: note.date,
            excerpt: note.excerpt,
            content: note.content
          },
          lastModified: new Date(note.updatedAt || note.createdAt || Date.now()).toLocaleDateString()
        };
      });
    }

    // 添加音乐文件夹
    const music = safeParseJSON('userMusic');
    if (music.length > 0) {
      fileSystem['/music'] = {
        type: 'folder',
        path: '/music',
        children: {},
        icon: FaMusic,
        color: 'text-purple-500',
        count: music.length,
        lastModified: music.length > 0 ? new Date(Math.max(...music.map(track => new Date(track.updatedAt || track.createdAt).getTime()))).toLocaleDateString() : null
      };
      fileSystem['/'].children['音乐'] = fileSystem['/music'];
      
      // 添加音乐文件
      music.forEach((track, index) => {
        const fileName = track.title || `未命名音乐${index + 1}`;
        fileSystem['/music'].children[fileName] = {
          type: 'file',
          icon: FaMusic,
          color: 'text-purple-500',
          category: '音乐',
          metadata: track,
          lastModified: new Date(track.updatedAt || track.createdAt || Date.now()).toLocaleDateString()
        };
      });
    }

    // 添加图形文件夹
    const diagrams = safeParseJSON('userDiagrams');
    if (diagrams.length > 0) {
      fileSystem['/diagrams'] = {
        type: 'folder',
        path: '/diagrams',
        children: {},
        icon: FaCode,
        color: 'text-green-500',
        count: diagrams.length,
        lastModified: diagrams.length > 0 ? new Date(Math.max(...diagrams.map(diagram => new Date(diagram.updatedAt || diagram.createdAt).getTime()))).toLocaleDateString() : null
      };
      fileSystem['/'].children['图形'] = fileSystem['/diagrams'];
      
      // 添加图形文件
      diagrams.forEach((diagram, index) => {
        const fileName = diagram.name || `图形${diagram.id || index + 1}`;
        fileSystem['/diagrams'].children[fileName] = {
          type: 'file',
          icon: FaCode,
          color: 'text-green-500',
          category: '图形',
          metadata: diagram,
          lastModified: new Date(diagram.updatedAt || diagram.createdAt || Date.now()).toLocaleDateString()
        };
      });
    }

    // 添加视频文件夹
    const videos = safeParseJSON('userVideos');
    if (videos.length > 0) {
      fileSystem['/videos'] = {
        type: 'folder',
        path: '/videos',
        children: {},
        icon: FaVideo,
        color: 'text-red-500',
        count: videos.length,
        lastModified: videos.length > 0 ? new Date(Math.max(...videos.map(video => new Date(video.addedDate).getTime()))).toLocaleDateString() : null
      };
      fileSystem['/'].children['视频'] = fileSystem['/videos'];
      
      // 添加视频文件
      videos.forEach((video, index) => {
        const fileName = video.title || `未命名视频${index + 1}`;
        fileSystem['/videos'].children[fileName] = {
          type: 'file',
          icon: FaVideo,
          color: 'text-red-500',
          category: '视频',
          metadata: video,
          lastModified: new Date(video.addedDate || Date.now()).toLocaleDateString()
        };
      });
    }

    // 添加商品文件夹
    const products = safeParseJSON('userProducts');
    if (products.length > 0) {
      fileSystem['/products'] = {
        type: 'folder',
        path: '/products',
        children: {},
        icon: FaFile,
        color: 'text-orange-500',
        count: products.length,
        lastModified: products.length > 0 ? new Date(Math.max(...products.map(product => new Date(product.addedDate).getTime()))).toLocaleDateString() : null
      };
      fileSystem['/'].children['商品'] = fileSystem['/products'];
      
      // 添加商品文件
      products.forEach((product, index) => {
        const fileName = product.title || `未命名商品${index + 1}`;
        fileSystem['/products'].children[fileName] = {
          type: 'file',
          icon: FaFile,
          color: 'text-orange-500',
          category: '商品',
          metadata: product,
          lastModified: new Date(product.addedDate || Date.now()).toLocaleDateString()
        };
      });
    }

    // 添加动态文件夹
    const posts = safeParseJSON('blogPosts');
    if (posts.length > 0) {
      fileSystem['/posts'] = {
        type: 'folder',
        path: '/posts',
        children: {},
        icon: FaFileAlt,
        color: 'text-indigo-500',
        count: posts.length,
        lastModified: posts.length > 0 ? new Date(Math.max(...posts.map(post => new Date(post.date + ' ' + post.time).getTime()))).toLocaleDateString() : null
      };
      fileSystem['/'].children['动态'] = fileSystem['/posts'];
      
      // 添加动态文件
      posts.forEach((post, index) => {
        const fileName = post.title || `未命名动态${index + 1}`;
        let lastModifiedDate = Date.now();
        if (post.date) {
          try {
            const dateStr = post.time ? `${post.date} ${post.time}` : post.date;
            lastModifiedDate = new Date(dateStr).getTime();
            if (isNaN(lastModifiedDate)) lastModifiedDate = Date.now();
          } catch (e) {
            lastModifiedDate = Date.now();
          }
        }
        fileSystem['/posts'].children[fileName] = {
          type: 'file',
          icon: FaFileAlt,
          color: 'text-indigo-500',
          category: '动态',
          metadata: post,
          lastModified: new Date(lastModifiedDate).toLocaleDateString()
        };
      });
    }

    // 添加灵感歌词文件夹
    const lyrics = safeParseJSON('inspirationLyrics');
    const quickLyrics = safeParseJSON('quickLyricsInspirations');
    const totalLyrics = lyrics.length + quickLyrics.length;
    
    if (totalLyrics > 0) {
      fileSystem['/lyrics'] = {
        type: 'folder',
        path: '/lyrics',
        children: {},
        icon: FaMusic,
        color: 'text-purple-500',
        count: totalLyrics,
        lastModified: totalLyrics > 0 ? new Date(Math.max(
          ...lyrics.map(lyric => new Date(lyric.updatedAt || lyric.createdAt).getTime()),
          ...quickLyrics.map(lyric => new Date(lyric.updatedAt || lyric.createdAt).getTime())
        )).toLocaleDateString() : null
      };
      fileSystem['/'].children['灵感歌词'] = fileSystem['/lyrics'];
      
      // 添加灵感歌词文件
      lyrics.forEach((lyric, index) => {
        const fileName = lyric.title || `灵感${lyric.id || index + 1}`;
        fileSystem['/lyrics'].children[fileName] = {
          type: 'file',
          icon: FaMusic,
          color: 'text-purple-500',
          category: '灵感歌词',
          metadata: lyric,
          lastModified: new Date(lyric.updatedAt || lyric.createdAt || Date.now()).toLocaleDateString()
        };
      });
      
      quickLyrics.forEach((lyric, index) => {
        const contentPreview = lyric.content ? lyric.content.substring(0, 20).replace(/\s+/g, ' ').trim() : '';
        const fileName = contentPreview || `快速${lyric.id || index + 1}`;
        fileSystem['/lyrics'].children[fileName] = {
          type: 'file',
          icon: FaMusic,
          color: 'text-purple-500',
          category: '灵感歌词',
          metadata: lyric,
          lastModified: new Date(lyric.updatedAt || lyric.createdAt || Date.now()).toLocaleDateString()
        };
      });
    }

    return fileSystem;
  };

  // 使用refreshKey来强制重新生成文件系统
  const fileSystem = useMemo(() => generateFileSystem(), [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // 刷新文件系统
  const refreshFileSystem = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getFileIcon = (file) => {
    if (file.type === 'folder') {
      return <FaFolder className="w-6 h-6 text-blue-500" />;
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'mp3':
      case 'wav':
      case 'flac':
        return <FaMusic className="w-6 h-6 text-purple-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaImage className="w-6 h-6 text-pink-500" />;
      case 'js':
      case 'html':
      case 'css':
      case 'py':
      case 'java':
        return <FaCode className="w-6 h-6 text-green-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <FaVideo className="w-6 h-6 text-red-500" />;
      default:
        return <FaFile className="w-6 h-6 text-gray-500" />;
    }
  };

  const handleItemClick = (item) => {
    if (item.type === 'folder') {
      setCurrentPath(item.path);
    } else {
      // 显示文件详情
      setSelectedFile(item);
    }
  };


  const getCurrentItems = () => {
    const current = fileSystem[currentPath];
    if (!current || !current.children) return [];
    
    return Object.entries(current.children).map(([name, data]) => ({
      name,
      ...data
    }));
  };

  return (
    <Card className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setCurrentPath('/')}
              size="small"
              variant="ghost"
            >
              首页
            </Button>
            <span className="text-gray-400">/</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{currentPath}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={refreshFileSystem}
              size="small"
              variant="ghost"
              icon={<FaSync />}
              iconPosition="left"
              title="刷新文件系统"
            >
              刷新
            </Button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            >
              <option value="name">按名称</option>
              <option value="size">按大小</option>
              <option value="date">按日期</option>
              <option value="type">按类型</option>
            </select>
            
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                <FaFile className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                <FaFileAlt className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 文件列表 */}
      <div className="flex-1 p-4 overflow-auto">
        {getCurrentItems().length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <FaFolder className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium mb-2">暂无内容</h3>
            <p className="text-sm text-center">
              开始使用各个功能模块，<br />
              您的内容将在这里显示
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {getCurrentItems().map((item) => (
              <div
                key={item.name}
                onClick={() => handleItemClick(item)}
                className="p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              >
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    {item.icon ? <item.icon className={`w-8 h-8 ${item.color}`} /> : getFileIcon(item)}
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.name}
                  </p>
                  {item.count && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.count} 项
                    </p>
                  )}
                  {item.lastModified && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {item.lastModified}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {getCurrentItems().map((item) => (
              <div
                key={item.name}
                onClick={() => handleItemClick(item)}
                className="flex items-center p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center flex-1">
                  <div className="mr-3">
                    {item.icon ? <item.icon className={`w-5 h-5 ${item.color}`} /> : getFileIcon(item)}
                  </div>
                  <div>
                    <span className="text-gray-900 dark:text-gray-100">{item.name}</span>
                    {item.count && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        ({item.count} 项)
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {item.lastModified || (item.type === 'folder' ? '文件夹' : '文件')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 状态栏 */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-2 text-sm text-gray-500 dark:text-gray-400">
        <span>{getCurrentItems().length} 个项目</span>
      </div>

      {/* 文件详情对话框 */}
      <Dialog
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        title={selectedFile ? `文件详情 - ${selectedFile.name}` : ''}
        size="large"
      >
        {selectedFile && (
          <div className="space-y-4">
            {/* 基本信息 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">基本信息</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">类型</span>
                  <Badge variant="primary">{selectedFile.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">最后修改</span>
                  <span className="text-gray-900 dark:text-gray-100">{selectedFile.lastModified}</span>
                </div>
              </div>
            </div>

            {/* 详细内容 */}
            {selectedFile.metadata && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">内容</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {selectedFile.category === '笔记' && (
                    <div className="space-y-3">
                      {selectedFile.metadata.category && (
                        <div>
                          <span className="text-xs text-gray-500">分类：</span>
                          <Badge variant="default" size="small">{selectedFile.metadata.category}</Badge>
                        </div>
                      )}
                      {selectedFile.metadata.tags && selectedFile.metadata.tags.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-500">标签：</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedFile.metadata.tags.map(tag => (
                              <Badge key={tag} variant="default" size="small">#{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedFile.metadata.author && (
                        <div>
                          <span className="text-xs text-gray-500">作者：</span>
                          <span className="text-sm">{selectedFile.metadata.author}</span>
                        </div>
                      )}
                      {selectedFile.metadata.excerpt && (
                        <div>
                          <span className="text-xs text-gray-500">摘要：</span>
                          <p className="text-sm mt-1">{selectedFile.metadata.excerpt}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedFile.category === '视频' && (
                    <div className="space-y-3">
                      {selectedFile.metadata.thumbnailUrl && (
                        <img src={selectedFile.metadata.thumbnailUrl} alt={selectedFile.metadata.title || '视频'} className="w-full rounded-lg" />
                      )}
                      {selectedFile.metadata.description && (
                        <p className="text-sm">{selectedFile.metadata.description}</p>
                      )}
                      {selectedFile.metadata.url && (
                        <a href={selectedFile.metadata.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                          打开视频链接
                        </a>
                      )}
                    </div>
                  )}

                  {selectedFile.category === '商品' && (
                    <div className="space-y-3">
                      {selectedFile.metadata.imageUrl && (
                        <img src={selectedFile.metadata.imageUrl} alt={selectedFile.metadata.title || '商品'} className="w-64 rounded-lg" />
                      )}
                      {selectedFile.metadata.description && (
                        <p className="text-sm">{selectedFile.metadata.description}</p>
                      )}
                      {selectedFile.metadata.price && (
                        <div>
                          <span className="text-2xl font-bold text-green-600">¥{selectedFile.metadata.price}</span>
                        </div>
                      )}
                      {selectedFile.metadata.rating && (
                        <div>
                          <span className="text-sm">评分：</span>
                          <span className="text-yellow-500">{'★'.repeat(selectedFile.metadata.rating)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedFile.category === '动态' && (
                    <div className="space-y-3">
                      {selectedFile.metadata.content && (
                        <p className="text-sm whitespace-pre-wrap">{selectedFile.metadata.content}</p>
                      )}
                      {selectedFile.metadata.tags && selectedFile.metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {selectedFile.metadata.tags.map(tag => (
                            <Badge key={tag} variant="default" size="small">#{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedFile.category === '灵感歌词' && (
                    <div className="space-y-3">
                      {selectedFile.metadata.content && (
                        <p className="text-sm whitespace-pre-wrap">{selectedFile.metadata.content}</p>
                      )}
                      {selectedFile.metadata.mood && (
                        <div>
                          <span className="text-xs text-gray-500">心情：</span>
                          <Badge variant="default" size="small">{selectedFile.metadata.mood}</Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 显示原始数据（用于调试） */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                      查看原始数据
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-900 text-green-400 p-2 rounded overflow-x-auto">
                      {JSON.stringify(selectedFile.metadata, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </Card>
  );
}

export default FileManager;
