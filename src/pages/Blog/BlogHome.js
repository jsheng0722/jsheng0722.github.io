import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaSearch, FaCalendar, FaEye, FaHeart, FaComment, FaThumbsUp, FaShare, FaImage, FaVideo, FaCode, FaBook, FaTrash, FaFolderOpen } from 'react-icons/fa';
import { ConfirmDialog } from '../../components/UI';
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
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '生活',
    customCategory: '',
    tags: [],
    mood: '😊',
    location: '',
    weather: '☀️',
    images: [],
    video: ''
  });

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
        // 只显示已发布的动态，标记为远程动态
        const publishedPosts = data.filter(post => post.status === 'published').map(post => ({
          ...post,
          isLocal: false
        }));
        
        // 加载本地存储的动态，标记为本地动态
        const localPosts = (JSON.parse(localStorage.getItem('blogPosts') || '[]')).map(post => ({
          ...post,
          isLocal: true
        }));
        
        // 合并数据，本地动态在前
        const allPosts = [...localPosts, ...publishedPosts].sort((a, b) => 
          new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)
        );
        
        setPosts(allPosts);
        setFilteredPosts(allPosts);
      } catch (error) {
        console.error('加载动态数据失败:', error);
        // 如果加载失败，只加载本地数据
        const localPosts = (JSON.parse(localStorage.getItem('blogPosts') || '[]')).map(post => ({
          ...post,
          isLocal: true
        }));
        setPosts(localPosts);
        setFilteredPosts(localPosts);
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

  const handlePublishPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert(t('RequiredTitleAndContent'));
      return;
    }

    const now = new Date();
    const resolvedCategory = newPost.category === '其他' ? ((newPost.customCategory || '').trim() || '其他') : newPost.category;
    const newPostData = {
      id: Date.now(),
      ...newPost,
      category: resolvedCategory,
      author: 'jihui',
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].slice(0, 5),
      readTime: Math.ceil(newPost.content.length / 200) + t('BlogReadTimeMin'),
      views: 0,
      likes: 0,
      comments: 0,
      cover: '/images/blog/default.jpg',
      type: 'article',
      images: Array.isArray(newPost.images) ? newPost.images : [],
      video: (newPost.video || '').trim() || undefined,
      status: 'published',
      isLocal: true
    };

    // 保存到localStorage
    const localPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const updatedPosts = [newPostData, ...localPosts];
    localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));

    // 更新状态
    setPosts(prev => [newPostData, ...prev]);
    setFilteredPosts(prev => [newPostData, ...prev]);

    // 重置表单
    setNewPost({
      title: '',
      content: '',
      category: '生活',
      customCategory: '',
      tags: [],
      mood: '😊',
      location: '',
      weather: '☀️',
      images: [],
      video: ''
    });
    setShowPublishForm(false);

    alert(t('PostPublished'));
  };

  const handleInputChange = (field, value) => {
    setNewPost(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = (tag) => {
    if (tag && !newPost.tags.includes(tag)) {
      setNewPost(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 开始编辑动态
  const handleEditPost = (post) => {
    if (!post.isLocal) {
      alert(t('CannotEditOthers'));
      return;
    }
    const catList = ['技术', '生活', '随笔', '教程', '新闻', '分享', '其他'];
    const isOther = !catList.includes(post.category);
    setEditingPost(post);
    setNewPost({
      title: post.title,
      content: post.content,
      category: isOther ? '其他' : post.category,
      customCategory: isOther ? post.category : '',
      tags: post.tags || [],
      mood: post.mood || '😊',
      location: post.location || '',
      weather: post.weather || '☀️',
      images: Array.isArray(post.images) ? post.images : [],
      video: post.video || ''
    });
    setShowPublishForm(true);
  };

  // 保存编辑
  const handleUpdatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert(t('RequiredTitleAndContent'));
      return;
    }

    const now = new Date();
    const resolvedCategory = newPost.category === '其他' ? ((newPost.customCategory || '').trim() || '其他') : newPost.category;
    const updatedPost = {
      ...editingPost,
      ...newPost,
      category: resolvedCategory,
      readTime: Math.ceil(newPost.content.length / 200) + t('BlogReadTimeMin'),
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].slice(0, 5),
      isLocal: true
    };

    // 更新localStorage
    const localPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const updatedPosts = localPosts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    );
    localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));

    // 更新状态
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
    setFilteredPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));

    // 重置表单
    setNewPost({
      title: '',
      content: '',
      category: '生活',
      customCategory: '',
      tags: [],
      mood: '😊',
      location: '',
      weather: '☀️',
      images: [],
      video: ''
    });
    setEditingPost(null);
    setShowPublishForm(false);

    alert(t('PostUpdated'));
  };

  // 删除动态
  const handleDeletePost = (post) => {
    if (!post.isLocal) {
      alert(t('CannotDeleteOthers'));
      return;
    }
    setPostToDelete(post);
    setShowDeleteDialog(true);
  };

  // 确认删除
  const confirmDelete = () => {
    if (!postToDelete) return;

    // 从localStorage删除
    const localPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const updatedPosts = localPosts.filter(post => post.id !== postToDelete.id);
    localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));

    // 更新状态
    setPosts(prev => prev.filter(post => post.id !== postToDelete.id));
    setFilteredPosts(prev => prev.filter(post => post.id !== postToDelete.id));

    setShowDeleteDialog(false);
    setPostToDelete(null);
    alert(t('PostDeleted'));
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingPost(null);
    setNewPost({
      title: '',
      content: '',
      category: '生活',
      customCategory: '',
      tags: [],
      mood: '😊',
      location: '',
      weather: '☀️',
      images: [],
      video: ''
    });
    setShowPublishForm(false);
  };

  const handleImageFiles = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    e.target.value = '';
    const maxSize = 2 * 1024 * 1024; // 单张建议 2MB 内
    const next = (index, acc) => {
      if (index >= files.length) {
        if (acc.length) setNewPost(prev => ({ ...prev, images: [...(prev.images || []), ...acc] }));
        return;
      }
      const file = files[index];
      if (file.size > maxSize && !window.confirm(t('BlogImageLargeConfirm').replace('{name}', file.name).replace('{size}', (file.size / 1024 / 1024).toFixed(1)))) {
        next(index + 1, acc);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result;
        const nextAcc = dataUrl ? [...acc, dataUrl] : acc;
        next(index + 1, nextAcc);
      };
      reader.readAsDataURL(file);
    };
    next(0, []);
  };

  const handleVideoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert(t('VideoUploadTip'));
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      if (dataUrl) setNewPost(prev => ({ ...prev, video: dataUrl }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeImageAt = (index) => {
    setNewPost(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };


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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
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

            {/* 发布动态按钮 */}
            <button 
              onClick={() => setShowPublishForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <FaEdit className="w-4 h-4" />
              {t('PublishPost')}
            </button>
          </div>
        </div>

        {/* 发布/编辑动态表单 */}
        {showPublishForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editingPost ? t('EditPost') : t('NewPost')}
              </h2>
              <button
                onClick={cancelEdit}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('TitleRequired')}
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('TitlePlaceholder')}
                />
              </div>

              {/* 内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('ContentRequired')}
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('ContentPlaceholder')}
                />
              </div>

              {/* 图片 / 视频：小图标上传 */}
              <div className="flex items-center gap-2 flex-wrap">
                <label className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title={t('BlogUploadImage')}>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageFiles} />
                  <FaImage className="w-4 h-4" />
                </label>
                <label className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" title={t('BlogUploadVideo')}>
                  <input type="file" accept="video/*" className="hidden" onChange={handleVideoFile} />
                  <FaVideo className="w-4 h-4" />
                </label>
                {(newPost.images || []).length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('BlogSelectedImagesCount').replace('{count}', (newPost.images || []).length)}</span>
                )}
                {newPost.video && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('BlogSelectedVideo')}</span>
                )}
              </div>
              {(newPost.images || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(newPost.images || []).map((url, index) => (
                    <div key={index} className="relative">
                      <img src={url} alt="" className="w-14 h-14 object-cover rounded border border-gray-200 dark:border-gray-600" onError={(e) => { e.target.style.display = 'none'; }} />
                      <button type="button" onClick={() => removeImageAt(index)} className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-xs leading-none flex items-center justify-center hover:bg-red-600">×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* 标签：已选标签在上，输入框固定在下 */}
              <div className="py-3 px-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/80 text-sm space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide shrink-0">{t('BlogTagsLabel')}</span>
                  {newPost.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium"
                    >
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900 dark:hover:text-blue-100 leading-none opacity-70 hover:opacity-100" aria-label={t('BlogRemoveTag')}>×</button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="text"
                    id="blog-tag-input"
                    placeholder={t('BlogTagInputPlaceholder')}
                    className="w-36 py-1.5 px-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 text-sm placeholder-gray-400"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const v = e.target.value.trim();
                        if (v) { addTag(v); e.target.value = ''; }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('blog-tag-input');
                      if (input?.value?.trim()) { addTag(input.value.trim()); input.value = ''; }
                    }}
                    className="py-1.5 px-2.5 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    {t('BlogAdd')}
                  </button>
                </div>
              </div>

              {/* 分类 / 心情 / 位置 / 天气：一行，位置不填则留空；分类选「其他」可自定义 */}
              <div className="flex flex-wrap items-center gap-3 py-3 px-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/80 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide">{t('BlogCategoryLabel')}</span>
                  <select
                    value={newPost.category}
                    onChange={(e) => {
                      const v = e.target.value;
                      handleInputChange('category', v);
                      if (v !== '其他') handleInputChange('customCategory', '');
                    }}
                    className="py-1.5 pl-2 pr-6 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-sm appearance-none cursor-pointer"
                  >
                    {categories.filter(cat => cat !== '全部').map(category => (
                      <option key={category} value={category}>{getCategoryDisplayName(category)}</option>
                    ))}
                  </select>
                  {newPost.category === '其他' && (
                    <input
                      type="text"
                      value={newPost.customCategory || ''}
                      onChange={(e) => handleInputChange('customCategory', e.target.value)}
                      placeholder={t('BlogCustomCategoryPlaceholder')}
                      className="w-24 py-1.5 px-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 text-sm placeholder-gray-400"
                    />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide">{t('BlogMoodLabel')}</span>
                  <select
                    value={newPost.mood}
                    onChange={(e) => handleInputChange('mood', e.target.value)}
                    className="py-1.5 pl-2 pr-7 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 text-sm cursor-pointer"
                  >
                    <option value="😊">😊</option>
                    <option value="😢">😢</option>
                    <option value="😴">😴</option>
                    <option value="🤔">🤔</option>
                    <option value="🎉">🎉</option>
                    <option value="😌">😌</option>
                    <option value="🤩">🤩</option>
                    <option value="😤">😤</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide">{t('BlogLocationLabel')}</span>
                  <input
                    type="text"
                    value={newPost.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-24 py-1.5 px-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 text-sm placeholder-gray-400"
                    placeholder={t('BlogLocationPlaceholder')}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide">{t('BlogWeatherLabel')}</span>
                  <select
                    value={newPost.weather}
                    onChange={(e) => handleInputChange('weather', e.target.value)}
                    className="py-1.5 pl-2 pr-7 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50 text-sm cursor-pointer"
                  >
                    <option value="☀️">☀️</option>
                    <option value="☁️">☁️</option>
                    <option value="🌧️">🌧️</option>
                    <option value="❄️">❄️</option>
                    <option value="🌩️">🌩️</option>
                    <option value="🌤️">🌤️</option>
                  </select>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={cancelEdit}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('BlogCancel')}
                </button>
                <button
                  onClick={editingPost ? handleUpdatePost : handlePublishPost}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPost ? t('BlogUpdatePost') : t('BlogPublishPostButton')}
                </button>
              </div>
            </div>
          </div>
        )}

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
                  {/* 编辑和删除按钮（仅本地动态显示） */}
                  {post.isLocal && (
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <FaEdit className="w-3 h-3" />
                        {t('BlogEdit')}
                      </button>
                      <button
                        onClick={() => handleDeletePost(post)}
                        className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <FaTrash className="w-3 h-3" />
                        {t('BlogDelete')}
                      </button>
                    </div>
                  )}
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

              {/* 互动区域 */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
                      <FaHeart className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                      <FaComment className="w-4 h-4" />
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                      <FaShare className="w-4 h-4" />
                      <span>{t('BlogShare')}</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <FaEye className="w-3 h-3" />
                      <span>{post.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FaThumbsUp className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
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
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm ? t('BlogNoResultsHint') : t('BlogNoPostsHint')}
            </p>
          </div>
        )}
        </div>
      </main>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setPostToDelete(null);
        }}
        title={t('ConfirmDeletePost')}
        message={`${postToDelete?.title ? `"${postToDelete.title}"` : ''} ${t('ConfirmDeletePostMessage')}`}
        confirmText={t('Delete')}
        cancelText={t('Cancel')}
        type="danger"
      />

      <Footer />
    </div>
  );
}

export default BlogHome;
