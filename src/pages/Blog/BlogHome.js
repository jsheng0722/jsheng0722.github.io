import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaCalendar, FaImage, FaVideo, FaCode, FaBook, FaFolderOpen } from 'react-icons/fa';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import { useI18n } from '../../context/I18nContext';

function BlogHome() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedTag, setSelectedTag] = useState('全部');

  const categories = ['全部', '技术', '生活', '随笔', '教程', '新闻', '分享', '其他'];
  const tags = ['全部', 'React', 'JavaScript', 'Python', 'Web开发', 'AI', '设计', '学习', '工作', '生活'];
  const getCategoryDisplayName = useMemo(() => {
    const m = { '全部': 'BlogCatAll', '技术': 'BlogCatTech', '生活': 'BlogCatLife', '随笔': 'BlogCatEssay', '教程': 'BlogCatTutorial', '新闻': 'BlogCatNews', '分享': 'BlogCatShare', '其他': 'BlogCatOther' };
    return (cat) => (m[cat] ? t(m[cat]) : cat);
  }, [t]);
  const getTagDisplayName = useMemo(() => {
    const m = { '全部': 'BlogTagAll', 'React': 'BlogTagReact', 'JavaScript': 'BlogTagJS', 'Python': 'BlogTagPython', 'Web开发': 'BlogTagWebDev', 'AI': 'BlogTagAI', '设计': 'BlogTagDesign', '学习': 'BlogTagStudy', '工作': 'BlogTagWork', '生活': 'BlogTagLife' };
    return (tag) => (m[tag] ? t(m[tag]) : tag);
  }, [t]);

  useEffect(() => {
    // 从JSON文件加载动态数据
    const loadPosts = async () => {
      try {
        const response = await fetch('/data/blog-posts.json');
        const data = await response.json();
        // 只显示已发布的动态
        const publishedPosts = data.filter(post => post.status === 'published').map(post => ({
          ...post,
          isLocal: false
        }));
        
        setPosts(publishedPosts);
        setFilteredPosts(publishedPosts);
      } catch (error) {
        console.error('加载动态数据失败:', error);
        setPosts([]);
        setFilteredPosts([]);
      }
    };

    loadPosts();
  }, []);

  useEffect(() => {
    let filtered = posts;

    if (selectedCategory !== '全部') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    if (selectedTag !== '全部') {
      filtered = filtered.filter(post => post.tags.includes(selectedTag));
    }

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
  }, [posts, selectedCategory, selectedTag, searchTerm]);


  const getTypeIcon = (type) => {
    switch (type) {
      case 'image':
        return <FaImage className="w-4 h-4 text-green-500" />;
      case 'video':
        return <FaVideo className="w-4 h-4 text-red-500" />;
      case 'code':
        return <FaCode className="w-4 h-4 text-blue-500" />;
      default:
        return <FaBook className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case '技术':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case '生活':
        return 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400';
      case '随笔':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case '教程':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case '分享':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header />

      {/* 右侧固定工具栏：不收缩，作品集大按钮常显 */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 pr-2">
        <button
          type="button"
          onClick={() => navigate('/portfolio')}
          className="flex items-center gap-2 px-4 py-3 rounded-l-xl shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium text-base whitespace-nowrap transition-all hover:scale-105 hover:shadow-xl"
          title={t('BlogGoToPortfolio')}
        >
          <FaFolderOpen className="w-6 h-6 shrink-0" />
          <span>{t('Portfolio')}</span>
        </button>
      </div>

      {/* 主内容区：艺术字绝对定位在内容左侧外侧，不占流；中间正文保持 max-w-4xl 全宽 */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* 艺术字：绝对定位在内容区左侧外侧，不参与布局 */}
        <div
          className="absolute right-full top-8 mr-6 sm:mr-8 md:mr-10 whitespace-nowrap"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', letterSpacing: '0.1em' }}
          aria-hidden
        >
          <span
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-500 opacity-90 pointer-events-none"
          >
            {t('Blog')}
          </span>
        </div>
        {/* 正文内容：保持原有宽度与布局 */}
        <div>
        {/* 动态区域 */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('BlogFeed')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t('BlogFeedSubtitle')}</p>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* 搜索框 */}
            <div className="flex-1 w-full relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('SearchFeedPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 分类筛选 */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{getCategoryDisplayName(category)}</option>
              ))}
            </select>

            {/* 标签筛选 */}
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
{tags.map(tag => (
              <option key={tag} value={tag}>{getTagDisplayName(tag)}</option>
            ))}
            </select>
          </div>
        </div>

        {/* 动态列表 */}
        <div className="space-y-6">
          {filteredPosts.map(post => (
            <article
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* 动态头部 */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {post.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{post.author}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <FaCalendar className="w-3 h-3" />
                        <span>{post.date} {post.time}</span>
                        {post.location && (
                          <>
                            <span>•</span>
                            <span>{post.location}</span>
                          </>
                        )}
                        {post.weather && (
                          <>
                            <span>•</span>
                            <span>{post.weather}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(post.category)}`}>
                      {getCategoryDisplayName(post.category)}
                    </span>
                    <div className="flex items-center space-x-1 text-gray-500">
                      {getTypeIcon(post.type)}
                    </div>
                  </div>
                </div>

                {/* 心情和标题 */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">{post.mood}</span>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {post.title}
                  </h2>
                </div>

                {/* 内容 */}
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {post.type === 'code' ? (
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
                        <code>{post.code}</code>
                      </pre>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{post.content}</p>
                  )}
                </div>

                {/* 图片展示 */}
                {post.images && post.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {post.images.map((url, index) => (
                      <div key={index} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                        <img src={url} alt="" className="w-full aspect-square object-cover" onError={(e) => { e.target.onerror = null; e.target.src = ''; e.target.className = 'w-full aspect-square object-contain'; e.target.parentElement.classList.add('flex', 'items-center', 'justify-center'); e.target.alt = t('BlogImageLoadFailed'); }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* 视频展示 */}
                {post.video && (() => {
                  const v = post.video.trim();
                  const ytMatch = v.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
                  const biliMatch = v.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/);
                  if (ytMatch) {
                    return (
                      <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 aspect-video max-w-2xl">
                        <iframe title="YouTube" src={`https://www.youtube.com/embed/${ytMatch[1]}`} className="w-full h-full" allowFullScreen />
                      </div>
                    );
                  }
                  if (biliMatch) {
                    return (
                      <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 aspect-video max-w-2xl">
                        <iframe title="B站" src={`https://player.bilibili.com/player.html?bvid=${biliMatch[1]}`} className="w-full h-full" allowFullScreen />
                      </div>
                    );
                  }
                  return (
                    <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 max-w-2xl">
                      <video src={v} controls className="w-full" />
                    </div>
                  );
                })()}

                {/* 标签 */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              </article>
          ))}
        </div>

        {/* 无结果提示 */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {searchTerm ? t('BlogNoResults') : t('BlogNoPostsYet')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? t('BlogNoResultsHint') : t('BlogNoPostsHint')}
            </p>
          </div>
        )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default BlogHome;
