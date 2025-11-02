import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import { FaBook, FaPencilAlt, FaCode, FaHeart, FaSearch, FaPlus, FaCalendar, FaUser, FaClock } from 'react-icons/fa';
import { Button, Card, Input, Badge, EmptyState } from '../../components/UI';

function NoteHome() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: '全部', icon: <FaBook />, color: 'bg-blue-600', hoverColor: 'hover:bg-blue-700' },
    { id: 'life', name: '生活', icon: <FaHeart />, color: 'bg-pink-600', hoverColor: 'hover:bg-pink-700' },
    { id: 'essay', name: '随笔', icon: <FaPencilAlt />, color: 'bg-purple-600', hoverColor: 'hover:bg-purple-700' },
    { id: '算法', name: '算法', icon: <FaCode />, color: 'bg-green-600', hoverColor: 'hover:bg-green-700' }
  ];

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    // 从JSON文件加载笔记
    fetch('/content/noteList_s.json')
      .then(response => response.json())
      .then(data => {
        // 从localStorage加载用户创建的笔记
        const userNotes = JSON.parse(localStorage.getItem('userNotes') || '[]');
        
        // 合并两个数组
        const allNotes = [...data, ...userNotes];
        
        setNotes(allNotes);
        setFilteredNotes(allNotes);
      })
      .catch(error => {
        console.error('加载笔记失败:', error);
        // 如果JSON加载失败，只加载localStorage中的笔记
        const userNotes = JSON.parse(localStorage.getItem('userNotes') || '[]');
        setNotes(userNotes);
        setFilteredNotes(userNotes);
      });
  };

  // 筛选笔记
  useEffect(() => {
    let filtered = notes;

    if (selectedCategory !== '全部') {
      filtered = filtered.filter(note => note.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredNotes(filtered);
  }, [notes, selectedCategory, searchTerm]);

  const getCategoryStats = (categoryName) => {
    if (categoryName === '全部') return notes.length;
    return notes.filter(note => note.category === categoryName).length;
  };

  const handleCreateNote = () => {
    navigate('/notes/editor');
  };

  const handleNoteClick = (note) => {
    navigate(`/notes/view/${note.id}`, { state: { note } });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            我的笔记本
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            记录生活点滴 · 总结技术心得 · 整理算法题解
          </p>
        </div>

        {/* 操作栏 */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* 搜索框 */}
            <div className="flex-1 w-full">
              <Input
                type="text"
                placeholder="搜索笔记标题、内容或标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<FaSearch />}
                iconPosition="left"
              />
            </div>

            {/* 写笔记按钮 */}
            <Button
              onClick={handleCreateNote}
              icon={<FaPlus />}
              iconPosition="left"
              className="whitespace-nowrap"
            >
              写笔记
            </Button>
          </div>
        </Card>

        {/* 分类标签 */}
        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map(category => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              variant={selectedCategory === category.name ? 'primary' : 'ghost'}
              icon={category.icon}
              iconPosition="left"
              className={`${
                selectedCategory === category.name
                  ? `${category.color} text-white shadow-lg transform scale-105`
                  : ''
              }`}
            >
              <span>{category.name}</span>
              <Badge
                variant={selectedCategory === category.name ? 'primary' : 'default'}
                size="small"
                className="ml-2"
              >
                {getCategoryStats(category.name)}
              </Badge>
            </Button>
          ))}
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FaBook className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{notes.length}</span>
            </div>
            <div className="text-sm opacity-90">总笔记数</div>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FaHeart className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{getCategoryStats('生活')}</span>
            </div>
            <div className="text-sm opacity-90">生活笔记</div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FaPencilAlt className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{getCategoryStats('随笔')}</span>
            </div>
            <div className="text-sm opacity-90">随笔文章</div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <FaCode className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{getCategoryStats('算法')}</span>
            </div>
            <div className="text-sm opacity-90">算法题解</div>
          </Card>
        </div>

        {/* 笔记网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon="inbox"
                title={searchTerm ? '未找到匹配的笔记' : '还没有笔记'}
                description={searchTerm ? '尝试其他搜索关键词' : '点击"写笔记"按钮创建您的第一篇笔记'}
                action={!searchTerm ? (
                  <Button
                    onClick={handleCreateNote}
                    icon={<FaPlus />}
                    iconPosition="left"
                  >
                    开始写笔记
                  </Button>
                ) : null}
              />
            </div>
          ) : (
            filteredNotes.map(note => (
              <Card
                key={note.id}
                onClick={() => handleNoteClick(note)}
                hover
                clickable
              >
                {/* 笔记卡片头部 */}
                <div className={`h-2 rounded-t-xl ${
                  note.category === '生活' ? 'bg-pink-500' :
                  note.category === '随笔' ? 'bg-purple-500' :
                  (note.category === '算法' || note.category === 'LeetCode') ? 'bg-green-500' :
                  'bg-blue-500'
                }`}></div>

                <div className="p-6">
                  {/* 分类标签 */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`p-2 rounded-lg ${
                      note.category === '生活' ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' :
                      note.category === '随笔' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                      (note.category === '算法' || note.category === 'LeetCode') ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {note.category === '生活' ? <FaHeart className="w-4 h-4" /> :
                       note.category === '随笔' ? <FaPencilAlt className="w-4 h-4" /> :
                       (note.category === '算法' || note.category === 'LeetCode') ? <FaCode className="w-4 h-4" /> :
                       <FaBook className="w-4 h-4" />}
                    </span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {note.category || '未分类'}
                    </span>
                    {(note?.status === 'draft' || note?.isDraft === true || note?.draft === true) && (
                      <Badge variant="warning" size="small">草稿</Badge>
                    )}
                  </div>

                  {/* 标题 */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                    {note.title}
                  </h3>

                  {/* 摘要 */}
                  {note.excerpt && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {note.excerpt}
                    </p>
                  )}

                  {/* 元信息 */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <FaUser className="w-3 h-3" />
                      {note.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCalendar className="w-3 h-3" />
                      {note.date}
                    </div>
                    {note.readTime && (
                      <div className="flex items-center gap-1">
                        <FaClock className="w-3 h-3" />
                        {note.readTime}
                      </div>
                    )}
                  </div>

                  {/* 标签 */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {note.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="default" size="small">
                          #{tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="default" size="small">
                          +{note.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* 算法特殊标识 */}
                  {note.category === '算法' && note.difficulty && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">难度</span>
                        <Badge
                          variant={
                            note.difficulty === '简单' ? 'success' :
                            note.difficulty === '中等' ? 'warning' :
                            'danger'
                          }
                          size="small"
                        >
                          {note.difficulty}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default NoteHome;
