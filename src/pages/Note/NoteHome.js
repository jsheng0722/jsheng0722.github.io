import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaPencilAlt, FaCode, FaHeart, FaPlus, FaThLarge, FaList } from 'react-icons/fa';
import { Button, Card, Badge, EmptyState, SearchBox } from '../../components/UI';
import PageLayout from '../../components/Layout/PageLayout';
import { NoteListItemCompact, NoteCard } from '../../components/Note';

const LAYOUT_KEY = 'notesLayoutView';

function NoteHome() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');
  const [layoutView, setLayoutView] = useState(() => {
    try {
      return localStorage.getItem(LAYOUT_KEY) || 'card';
    } catch (_) {
      return 'card';
    }
  });

  const setLayoutAndPersist = (view) => {
    setLayoutView(view);
    try {
      localStorage.setItem(LAYOUT_KEY, view);
    } catch (_) {}
  };

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
    const getDeletedIds = () => {
      try {
        return new Set(JSON.parse(localStorage.getItem('notesDeletedIds') || '[]'));
      } catch (_) {
        return new Set();
      }
    };
    const deletedIds = getDeletedIds();

    fetch('/content/noteList_s.json')
      .then(response => response.json())
      .then(data => {
        const userNotes = JSON.parse(localStorage.getItem('userNotes') || '[]');
        const merged = [...data, ...userNotes];
        const allNotes = merged.filter(n => !deletedIds.has(String(n.id)));
        setNotes(allNotes);
        setFilteredNotes(allNotes);
      })
      .catch(error => {
        console.error('加载笔记失败:', error);
        const userNotes = JSON.parse(localStorage.getItem('userNotes') || '[]');
        const allNotes = userNotes.filter(n => !deletedIds.has(String(n.id)));
        setNotes(allNotes);
        setFilteredNotes(allNotes);
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
    <PageLayout className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <SearchBox
            placeholder="搜索笔记标题、内容或标签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* 布局切换 */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setLayoutAndPersist('card')}
              title="卡片视图"
              className={`p-2 rounded-md transition-colors ${
                layoutView === 'card'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <FaThLarge className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutAndPersist('compact')}
              title="紧凑视图"
              className={`p-2 rounded-md transition-colors ${
                layoutView === 'compact'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <FaList className="w-4 h-4" />
            </button>
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

        {/* 笔记列表：卡片视图 / 紧凑视图 */}
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
        ) : layoutView === 'compact' ? (
          <Card className="overflow-hidden p-0">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotes.map(note => (
                <NoteListItemCompact
                  key={note.id}
                  note={note}
                  onClick={handleNoteClick}
                />
              ))}
            </ul>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={handleNoteClick}
              />
            ))}
          </div>
        )}
    </PageLayout>
  );
}

export default NoteHome;
