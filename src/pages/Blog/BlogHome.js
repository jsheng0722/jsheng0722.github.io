import React, { useState, useEffect } from 'react';
import { FaEdit, FaSearch, FaCalendar, FaEye, FaHeart, FaComment, FaThumbsUp, FaShare, FaImage, FaVideo, FaCode, FaBook, FaTrash } from 'react-icons/fa';
import { ConfirmDialog } from '../../components/UI';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';

function BlogHome() {
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
    tags: [],
    mood: '😊',
    location: '',
    weather: '☀️'
  });

  const categories = ['全部', '技术', '生活', '随笔', '教程', '新闻', '分享'];
  const tags = ['全部', 'React', 'JavaScript', 'Python', 'Web开发', 'AI', '设计', '学习', '工作', '生活'];

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
      alert('请填写标题和内容');
      return;
    }

    const now = new Date();
    const newPostData = {
      id: Date.now(),
      ...newPost,
      author: 'jihui',
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].slice(0, 5),
      readTime: Math.ceil(newPost.content.length / 200) + '分钟',
      views: 0,
      likes: 0,
      comments: 0,
      cover: '/images/blog/default.jpg',
      type: 'article',
      images: [],
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
      tags: [],
      mood: '😊',
      location: '',
      weather: '☀️'
    });
    setShowPublishForm(false);

    alert('动态发布成功！');
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
      alert('只能编辑自己发布的动态');
      return;
    }
    setEditingPost(post);
    setNewPost({
      title: post.title,
      content: post.content,
      category: post.category,
      tags: post.tags || [],
      mood: post.mood || '😊',
      location: post.location || '',
      weather: post.weather || '☀️'
    });
    setShowPublishForm(true);
  };

  // 保存编辑
  const handleUpdatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('请填写标题和内容');
      return;
    }

    const now = new Date();
    const updatedPost = {
      ...editingPost,
      ...newPost,
      readTime: Math.ceil(newPost.content.length / 200) + '分钟',
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
      tags: [],
      mood: '😊',
      location: '',
      weather: '☀️'
    });
    setEditingPost(null);
    setShowPublishForm(false);

    alert('动态更新成功！');
  };

  // 删除动态
  const handleDeletePost = (post) => {
    if (!post.isLocal) {
      alert('只能删除自己发布的动态');
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
    alert('动态已删除');
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingPost(null);
    setNewPost({
      title: '',
      content: '',
      category: '生活',
      tags: [],
      mood: '😊',
      location: '',
      weather: '☀️'
    });
    setShowPublishForm(false);
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
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                我的动态
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                分享生活点滴 · 记录学习心得 · 展示技术成长
              </p>
            </div>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* 搜索框 */}
            <div className="flex-1 w-full relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索动态内容..."
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
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* 标签筛选 */}
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              {tags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>

            {/* 发布动态按钮 */}
            <button 
              onClick={() => setShowPublishForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <FaEdit className="w-4 h-4" />
              发布动态
            </button>
          </div>
        </div>

        {/* 发布/编辑动态表单 */}
        {showPublishForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editingPost ? '编辑动态' : '发布新动态'}
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
                  标题 *
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入动态标题..."
                />
              </div>

              {/* 内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  内容 *
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="分享你的想法..."
                />
              </div>

              {/* 分类和心情 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    分类
                  </label>
                  <select
                    value={newPost.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.filter(cat => cat !== '全部').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    心情
                  </label>
                  <select
                    value={newPost.mood}
                    onChange={(e) => handleInputChange('mood', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="😊">😊 开心</option>
                    <option value="😢">😢 难过</option>
                    <option value="😴">😴 疲惫</option>
                    <option value="🤔">🤔 思考</option>
                    <option value="🎉">🎉 兴奋</option>
                    <option value="😌">😌 平静</option>
                    <option value="🤩">🤩 激动</option>
                    <option value="😤">😤 生气</option>
                  </select>
                </div>
              </div>

              {/* 位置和天气 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    位置
                  </label>
                  <input
                    type="text"
                    value={newPost.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="你在哪里？"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    天气
                  </label>
                  <select
                    value={newPost.weather}
                    onChange={(e) => handleInputChange('weather', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="☀️">☀️ 晴天</option>
                    <option value="☁️">☁️ 多云</option>
                    <option value="🌧️">🌧️ 雨天</option>
                    <option value="❄️">❄️ 雪天</option>
                    <option value="🌩️">🌩️ 雷雨</option>
                    <option value="🌤️">🌤️ 阴天</option>
                  </select>
                </div>
              </div>

              {/* 标签 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  标签
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newPost.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded text-sm flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-blue-400 hover:text-blue-600"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="添加标签..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTag(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="添加标签..."]');
                      if (input.value.trim()) {
                        addTag(input.value.trim());
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    添加
                  </button>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={cancelEdit}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={editingPost ? handleUpdatePost : handlePublishPost}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPost ? '更新动态' : '发布动态'}
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
                      {post.category}
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
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeletePost(post)}
                        className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <FaTrash className="w-3 h-3" />
                        删除
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
                    {post.images.map((image, index) => (
                      <div key={index} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <div className="text-4xl text-gray-400">🖼️</div>
                      </div>
                    ))}
                  </div>
                )}

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
                      <span>分享</span>
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
              {searchTerm ? '未找到匹配的动态' : '还没有动态'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm ? '尝试其他搜索关键词' : '点击"发布动态"按钮分享您的第一条动态'}
            </p>
          </div>
        )}
      </main>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setPostToDelete(null);
        }}
        title="确认删除"
        message={`确定要删除动态"${postToDelete?.title}"吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />

      <Footer />
    </div>
  );
}

export default BlogHome;
