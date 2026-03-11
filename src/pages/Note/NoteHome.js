import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaPencilAlt, FaCode, FaHeart, FaGraduationCap, FaPlus, FaThLarge, FaList } from 'react-icons/fa';
import { Button, Card, EmptyState, SearchBox } from '../../components/UI';
import PageLayout from '../../components/Layout/PageLayout';
import { NoteListItemCompact, NoteCard } from '../../components/Note';
import { useI18n } from '../../context/I18nContext';

const LAYOUT_KEY = 'notesLayoutView';

function NoteHome() {
  const navigate = useNavigate();
  const { t } = useI18n();
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
    const base = process.env.PUBLIC_URL || '';

    const applyMerge = (noteListData, userNotesList) => {
      const merged = [...(Array.isArray(noteListData) ? noteListData : []), ...(Array.isArray(userNotesList) ? userNotesList : [])];
      const allNotes = merged.filter(n => !deletedIds.has(String(n.id)));
      setNotes(allNotes);
      setFilteredNotes(allNotes);
    };

    fetch(`${base}/content/notes/userNotes.json`)
      .then(r => (r.ok ? r.json() : Promise.resolve(null)))
      .then(fileUserNotes => {
        const userNotes = Array.isArray(fileUserNotes) ? fileUserNotes : JSON.parse(localStorage.getItem('userNotes') || '[]');
        if (Array.isArray(fileUserNotes)) localStorage.setItem('userNotes', JSON.stringify(fileUserNotes));
        return fetch(`${base}/content/noteList_s.json`)
          .then(res => res.json())
          .then(data => applyMerge(data, userNotes));
      })
      .catch(() => {
        const fallbackUserNotes = JSON.parse(localStorage.getItem('userNotes') || '[]');
        fetch(`${base}/content/noteList_s.json`)
          .then(response => response.json())
          .then(data => applyMerge(data, fallbackUserNotes))
          .catch(err => {
            console.error('加载笔记失败:', err);
            const allNotes = fallbackUserNotes.filter(n => !deletedIds.has(String(n.id)));
            setNotes(allNotes);
            setFilteredNotes(allNotes);
          });
      });
  };

  // 筛选笔记（新分类 + 兼容旧分类：生活→日常日记，随笔→随笔写写）
  useEffect(() => {
    let filtered = notes;

    if (selectedCategory !== '全部') {
      filtered = filtered.filter(note => {
        const display = getDisplayCategory(note.category);
        return display === selectedCategory;
      });
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
    if (categoryName === '学习笔记') return notes.filter(n => n.category === '学习笔记').length;
    if (categoryName === '日常日记') return notes.filter(n => n.category === '日常日记' || n.category === '生活').length;
    if (categoryName === '随笔写写') return notes.filter(n => n.category === '随笔写写' || n.category === '随笔').length;
    if (categoryName === '算法') return notes.filter(n => n.category === '算法' || n.category === 'LeetCode').length;
    return notes.filter(note => note.category === categoryName).length;
  };

  function getDisplayCategory(cat) {
    if (cat === '生活') return '日常日记';
    if (cat === '随笔') return '随笔写写';
    return cat || '随笔写写';
  }

  const handleCreateNote = () => {
    navigate('/notes/editor');
  };

  const handleNoteClick = (note) => {
    navigate(`/notes/view/${note.id}`, { state: { note } });
  };

  return (
    <PageLayout className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* 左侧：总笔记数/学习笔记/日常日记/随笔写写/算法 = 统计 + 筛选，点击切换 */}
        <aside className="flex flex-row md:flex-col gap-2 md:w-44 shrink-0 flex-wrap md:flex-nowrap">
          <Card
            clickable
            onClick={() => setSelectedCategory('全部')}
            className={`flex-1 md:flex-none flex flex-row items-center justify-center gap-4 py-2.5 px-3 md:px-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg min-h-0 min-w-[120px] md:min-w-0 transition-all ${selectedCategory === '全部' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 dark:ring-offset-gray-950' : 'hover:opacity-90'}`}
          >
            <FaBook className="w-6 h-6 md:w-7 md:h-7 opacity-80 shrink-0" />
            <div className="min-w-0 flex-1 flex flex-col items-center justify-center text-center">
              <span className="text-xl md:text-2xl font-bold leading-tight">{notes.length}</span>
              <span className="text-xs opacity-90">{t('NoteTotal')}</span>
            </div>
          </Card>
          <Card
            clickable
            onClick={() => setSelectedCategory('学习笔记')}
            className={`flex-1 md:flex-none flex flex-row items-center justify-center gap-4 py-2.5 px-3 md:px-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg min-h-0 min-w-[120px] md:min-w-0 transition-all ${selectedCategory === '学习笔记' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 dark:ring-offset-gray-950' : 'hover:opacity-90'}`}
          >
            <FaGraduationCap className="w-6 h-6 md:w-7 md:h-7 opacity-80 shrink-0" />
            <div className="min-w-0 flex-1 flex flex-col items-center justify-center text-center">
              <span className="text-xl md:text-2xl font-bold leading-tight">{getCategoryStats('学习笔记')}</span>
              <span className="text-xs opacity-90">{t('NoteStudy')}</span>
            </div>
          </Card>
          <Card
            clickable
            onClick={() => setSelectedCategory('日常日记')}
            className={`flex-1 md:flex-none flex flex-row items-center justify-center gap-4 py-2.5 px-3 md:px-4 bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg min-h-0 min-w-[120px] md:min-w-0 transition-all ${selectedCategory === '日常日记' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 dark:ring-offset-gray-950' : 'hover:opacity-90'}`}
          >
            <FaHeart className="w-6 h-6 md:w-7 md:h-7 opacity-80 shrink-0" />
            <div className="min-w-0 flex-1 flex flex-col items-center justify-center text-center">
              <span className="text-xl md:text-2xl font-bold leading-tight">{getCategoryStats('日常日记')}</span>
              <span className="text-xs opacity-90">{t('NoteDaily')}</span>
            </div>
          </Card>
          <Card
            clickable
            onClick={() => setSelectedCategory('随笔写写')}
            className={`flex-1 md:flex-none flex flex-row items-center justify-center gap-4 py-2.5 px-3 md:px-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg min-h-0 min-w-[120px] md:min-w-0 transition-all ${selectedCategory === '随笔写写' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 dark:ring-offset-gray-950' : 'hover:opacity-90'}`}
          >
            <FaPencilAlt className="w-6 h-6 md:w-7 md:h-7 opacity-80 shrink-0" />
            <div className="min-w-0 flex-1 flex flex-col items-center justify-center text-center">
              <span className="text-xl md:text-2xl font-bold leading-tight">{getCategoryStats('随笔写写')}</span>
              <span className="text-xs opacity-90">{t('NoteEssay')}</span>
            </div>
          </Card>
          <Card
            clickable
            onClick={() => setSelectedCategory('算法')}
            className={`flex-1 md:flex-none flex flex-row items-center justify-center gap-4 py-2.5 px-3 md:px-4 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg min-h-0 min-w-[120px] md:min-w-0 transition-all ${selectedCategory === '算法' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 dark:ring-offset-gray-950' : 'hover:opacity-90'}`}
          >
            <FaCode className="w-6 h-6 md:w-7 md:h-7 opacity-80 shrink-0" />
            <div className="min-w-0 flex-1 flex flex-col items-center justify-center text-center">
              <span className="text-xl md:text-2xl font-bold leading-tight">{getCategoryStats('算法')}</span>
              <span className="text-xs opacity-90">{t('NoteAlgorithm')}</span>
            </div>
          </Card>
        </aside>

        <main className="min-w-0 flex-1">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          {t('NoteMyNotebook')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {t('NoteSubtitle')}
        </p>
      </div>

      {/* 操作栏 */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* 搜索框 */}
          <SearchBox
            placeholder={t('NoteSearchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* 布局切换 */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setLayoutAndPersist('card')}
              title={t('NoteCardView')}
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
              title={t('NoteCompactView')}
              className={`p-2 rounded-md transition-colors ${
                layoutView === 'compact'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <FaList className="w-4 h-4" />
            </button>
          </div>

          <Button
            onClick={handleCreateNote}
            icon={<FaPlus />}
            iconPosition="left"
            className="whitespace-nowrap"
          >
            {t('NoteWriteNote')}
          </Button>
        </div>
      </Card>

        {/* 笔记列表：卡片视图 / 紧凑视图 */}
        {filteredNotes.length === 0 ? (
          <EmptyState
              icon="inbox"
              title={searchTerm ? t('NoteNoMatch') : t('NoteNoNotes')}
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
        </main>
      </div>
    </PageLayout>
  );
}

export default NoteHome;
