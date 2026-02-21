import React, { useState, useEffect } from 'react';
import { FaBook, FaPlus, FaStar, FaStarHalfAlt, FaEdit, FaTrash, FaSave, FaTimes, FaSearch, FaVolumeUp, FaCloudDownloadAlt } from 'react-icons/fa';
import { Button, Card, Badge, EmptyState, SearchBox, Input, Textarea } from '../../components/UI';
import PageLayout from '../../components/Layout/PageLayout';
import PhoneticKeyboard from './PhoneticKeyboard';
import { matchRootsAffixesInWord, getRootsAffixesList, saveRootsAffixesList } from './rootsAffixesData';
import { writeFilesToPickedFolder } from '../../utils/syncToProject';

const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

const STORAGE_KEY = 'vocabularyWords';

const PARTS_OF_SPEECH = [
  { value: '', label: '不选' },
  { value: 'n.', label: 'n. 名词' },
  { value: 'v.', label: 'v. 动词' },
  { value: 'adj.', label: 'adj. 形容词' },
  { value: 'adv.', label: 'adv. 副词' },
  { value: 'prep.', label: 'prep. 介词' },
  { value: 'conj.', label: 'conj. 连词' },
  { value: 'pron.', label: 'pron. 代词' },
  { value: 'interj.', label: 'interj. 感叹词' },
  { value: 'art.', label: 'art. 冠词' },
  { value: 'num.', label: 'num. 数词' }
];

function loadWords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (_) {
    return [];
  }
}

function saveWords(words) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

function VocabularyPage() {
  const [words, setWords] = useState([]);
  const [filteredWords, setFilteredWords] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'new' | 'familiar'
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    word: '',
    phonetic: '',
    phoneticAudio: '',
    partOfSpeech: '',
    definition: '',
    example: '',
    synonyms: '',
    remark: '',
    isNew: true
  });
  const [selectedRootsAffixes, setSelectedRootsAffixes] = useState([]); // 当前单词下已选的词根词缀标签，保存时写入该词
  const [phoneticKeyboardOpen, setPhoneticKeyboardOpen] = useState(false);
  const [phoneticLoading, setPhoneticLoading] = useState(false);
  const [showRootsManager, setShowRootsManager] = useState(false);
  const [rootsAffixesList, setRootsAffixesList] = useState([]);
  const [rootsEditEntry, setRootsEditEntry] = useState(null);
  const [rootsForm, setRootsForm] = useState({ word: '', type: '词根', meaning: '', example: '' });
  const [showQuickAddRoot, setShowQuickAddRoot] = useState(false);
  const [quickRootForm, setQuickRootForm] = useState({ word: '', type: '词根', meaning: '', example: '' });

  useEffect(() => {
    const base = process.env.PUBLIC_URL || '';
    Promise.all([
      fetch(`${base}/content/vocabulary/words.json`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${base}/content/vocabulary/rootsAffixes.json`).then((r) => (r.ok ? r.json() : null))
    ]).then(([fileWords, fileRoots]) => {
      const wordsList = Array.isArray(fileWords) ? fileWords : loadWords();
      if (Array.isArray(fileWords)) saveWords(fileWords);
      setWords(wordsList);
      if (Array.isArray(fileRoots)) {
        const withIds = fileRoots.map((item, i) => ({ ...item, id: item.id ?? `ra-${i}-${(item.word || '').slice(0, 5)}` }));
        saveRootsAffixesList(withIds);
        setRootsAffixesList(withIds);
      } else {
        setRootsAffixesList(getRootsAffixesList());
      }
    }).catch(() => {
      setWords(loadWords());
      setRootsAffixesList(getRootsAffixesList());
    });
  }, []);

  // 根据当前输入的单词匹配词根词缀（仅当单词长度>=2时计算）
  const rootsResults = (form.word || '').trim().length >= 2 ? matchRootsAffixesInWord(form.word, rootsAffixesList) : [];

  useEffect(() => {
    let list = words;
    if (filter === 'new') list = list.filter(w => w.isNew);
    if (filter === 'familiar') list = list.filter(w => !w.isNew);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(w =>
        (w.word && w.word.toLowerCase().includes(q)) ||
        (w.definition && w.definition.toLowerCase().includes(q)) ||
        (w.example && w.example.toLowerCase().includes(q)) ||
        (w.partOfSpeech && w.partOfSpeech.toLowerCase().includes(q)) ||
        (w.synonyms && w.synonyms.toLowerCase().includes(q)) ||
        (w.remark && w.remark.toLowerCase().includes(q)) ||
        (Array.isArray(w.rootsAffixes) && w.rootsAffixes.some(ra =>
          (ra.word && ra.word.toLowerCase().includes(q)) ||
          (ra.meaning && String(ra.meaning).toLowerCase().includes(q))
        ))
      );
    }
    setFilteredWords(list);
  }, [words, filter, searchTerm]);

  const resetForm = () => {
    setForm({
      word: '',
      phonetic: '',
      phoneticAudio: '',
      partOfSpeech: '',
      definition: '',
      example: '',
      synonyms: '',
      remark: '',
      isNew: true
    });
    setSelectedRootsAffixes([]);
    setEditingId(null);
    setShowForm(false);
    setShowQuickAddRoot(false);
    setQuickRootForm({ word: '', type: '词根', meaning: '', example: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const word = (form.word || '').trim();
    if (!word) {
      alert('请填写单词');
      return;
    }
    const item = {
      id: editingId ?? Date.now(),
      word,
      phonetic: (form.phonetic || '').trim(),
      phoneticAudio: (form.phoneticAudio || '').trim() || undefined,
      partOfSpeech: (form.partOfSpeech || '').trim(),
      definition: (form.definition || '').trim(),
      example: (form.example || '').trim(),
      synonyms: (form.synonyms || '').trim() || undefined,
      remark: (form.remark || '').trim() || undefined,
      isNew: !!form.isNew,
      rootsAffixes: selectedRootsAffixes.length ? selectedRootsAffixes.map(({ word: w, type, meaning, example: ex }) => ({ word: w, type, meaning, example: ex })) : undefined
    };
    if (editingId != null) {
      const next = words.map(w => w.id === editingId ? item : w);
      setWords(next);
      saveWords(next);
    } else {
      const next = [...words, item];
      setWords(next);
      saveWords(next);
    }
    resetForm();
  };

  const handleToggleNew = (id) => {
    const next = words.map(w => w.id === id ? { ...w, isNew: !w.isNew } : w);
    setWords(next);
    saveWords(next);
  };

  const handleEdit = (w) => {
    setForm({
      word: w.word || '',
      phonetic: w.phonetic || '',
      phoneticAudio: w.phoneticAudio || '',
      partOfSpeech: w.partOfSpeech || '',
      definition: w.definition || '',
      example: w.example || '',
      synonyms: w.synonyms || '',
      remark: w.remark || '',
      isNew: !!w.isNew
    });
    setSelectedRootsAffixes(Array.isArray(w.rootsAffixes) ? w.rootsAffixes : []);
    setEditingId(w.id);
    setShowForm(true);
  };

  const handleInsertPhonetic = (char) => {
    setForm(f => ({ ...f, phonetic: (f.phonetic || '') + char }));
  };

  const handleSelectRootAffix = (entry) => {
    const key = `${entry.word}-${entry.type}`;
    if (selectedRootsAffixes.some((e) => `${e.word}-${e.type}` === key)) return;
    setSelectedRootsAffixes((prev) => [...prev, { word: entry.word, type: entry.type, meaning: entry.meaning || '', example: entry.example || '' }]);
  };

  const handleRemoveRootAffix = (index) => {
    setSelectedRootsAffixes((prev) => prev.filter((_, i) => i !== index));
  };

  /** 在添加/编辑单词时快速添加新词根词缀并选入本词 */
  const handleQuickAddRoot = (e) => {
    e?.preventDefault();
    const { word, type, meaning, example } = quickRootForm;
    if (!(word || '').trim()) {
      alert('请填写词根/词缀');
      return;
    }
    const entry = {
      word: word.trim(),
      type: type || '词根',
      meaning: (meaning || '').trim(),
      example: (example || '').trim(),
      id: `ra-${Date.now()}-${word.trim().slice(0, 5)}`
    };
    const nextList = [...rootsAffixesList, entry];
    setRootsAffixesList(nextList);
    saveRootsAffixesList(nextList);
    handleSelectRootAffix(entry);
    setQuickRootForm({ word: '', type: '词根', meaning: '', example: '' });
    setShowQuickAddRoot(false);
  };

  const openRootsManager = () => {
    setShowRootsManager(true);
    setRootsAffixesList(getRootsAffixesList());
    setRootsEditEntry(null);
    setRootsForm({ word: '', type: '词根', meaning: '', example: '' });
  };

  const saveRootsEntry = (e) => {
    e?.preventDefault();
    const { word, type, meaning, example } = rootsForm;
    if (!(word || '').trim()) {
      alert('请填写词根/词缀');
      return;
    }
    const entry = { word: word.trim(), type: type || '词根', meaning: (meaning || '').trim(), example: (example || '').trim() };
    if (rootsEditEntry != null) {
      const next = rootsAffixesList.map((item) => (item.id === rootsEditEntry.id ? { ...item, ...entry } : item));
      setRootsAffixesList(next);
      saveRootsAffixesList(next);
      setRootsEditEntry(null);
    } else {
      const newEntry = { ...entry, id: `ra-${Date.now()}-${entry.word.slice(0, 5)}` };
      const next = [...rootsAffixesList, newEntry];
      setRootsAffixesList(next);
      saveRootsAffixesList(next);
    }
    setRootsForm({ word: '', type: '词根', meaning: '', example: '' });
  };

  const deleteRootsEntry = (id) => {
    if (!window.confirm('确定删除该词根/词缀？')) return;
    const next = rootsAffixesList.filter((item) => item.id !== id);
    setRootsAffixesList(next);
    saveRootsAffixesList(next);
    if (rootsEditEntry?.id === id) {
      setRootsEditEntry(null);
      setRootsForm({ word: '', type: '词根', meaning: '', example: '' });
    }
  };

  const startEditRoots = (entry) => {
    setRootsEditEntry(entry);
    setRootsForm({ word: entry.word || '', type: entry.type || '词根', meaning: entry.meaning || '', example: entry.example || '' });
  };

  const cancelEditRoots = () => {
    setRootsEditEntry(null);
    setRootsForm({ word: '', type: '词根', meaning: '', example: '' });
  };

  /** 从 Free Dictionary API 返回的 data 中解析出第一个可用的音标文本和读音 URL */
  const parsePhoneticsFromApi = (data) => {
    const list = Array.isArray(data) ? data : [];
    const allPhonetics = list.flatMap((e) => e.phonetics || []);
    const text = allPhonetics.map((p) => p.text).find((t) => t && String(t).trim());
    const audio = allPhonetics.map((p) => p.audio).find((url) => url && String(url).trim());
    return { phonetic: text || '', phoneticAudio: audio || '' };
  };

  const fetchPhonetic = async () => {
    const word = (form.word || '').trim();
    if (!word) {
      alert('请先输入单词');
      return;
    }
    setPhoneticLoading(true);
    try {
      const res = await fetch(`${DICTIONARY_API}/${encodeURIComponent(word)}`);
      if (!res.ok) throw new Error('未找到');
      const data = await res.json();
      const { phonetic: text, phoneticAudio: audio } = parsePhoneticsFromApi(data);
      setForm((f) => ({
        ...f,
        ...(text && { phonetic: text }),
        ...(audio && { phoneticAudio: audio })
      }));
      if (!text) throw new Error('无音标');
    } catch (err) {
      alert('无法获取音标，请检查单词拼写或稍后重试');
    } finally {
      setPhoneticLoading(false);
    }
  };

  const syncVocabularyToProject = async () => {
    const files = [
      { name: 'words.json', content: JSON.stringify(words, null, 2) },
      { name: 'rootsAffixes.json', content: JSON.stringify(rootsAffixesList, null, 2) }
    ];
    try {
      const done = await writeFilesToPickedFolder(files);
      if (done) {
        alert('已直接写入所选文件夹。\n请选择项目的 public/content/vocabulary 目录；下次 push 到 GitHub 即可。');
        return;
      }
    } catch (e) {
      console.warn('File System Access 写入失败，改用下载', e);
    }
    const blob1 = new Blob([files[0].content], { type: 'application/json' });
    const blob2 = new Blob([files[1].content], { type: 'application/json' });
    const url1 = URL.createObjectURL(blob1);
    const url2 = URL.createObjectURL(blob2);
    const a1 = document.createElement('a');
    const a2 = document.createElement('a');
    a1.href = url1;
    a1.download = 'words.json';
    a2.href = url2;
    a2.download = 'rootsAffixes.json';
    a1.click();
    setTimeout(() => {
      a2.click();
      URL.revokeObjectURL(url1);
      URL.revokeObjectURL(url2);
    }, 200);
    alert('已下载 words.json 与 rootsAffixes.json。\n请将这两个文件放入项目的 public/content/vocabulary/ 目录，然后 push 到 GitHub。');
  };

  /** 根据单词从 API 获取音标与读音 URL，用于列表无 phoneticAudio 时补拉并播放 */
  const fetchPhoneticForWord = async (word) => {
    if (!(word || '').trim()) return null;
    try {
      const res = await fetch(`${DICTIONARY_API}/${encodeURIComponent(word.trim())}`);
      if (!res.ok) return null;
      const data = await res.json();
      return parsePhoneticsFromApi(data);
    } catch (_) {
      return null;
    }
  };

  /** @param onFetched 在无 URL 时拉取到音标/读音后回调，用于表单内回填 */
  const playPhoneticAudio = async (url, word, wordId, onFetched) => {
    const toPlay = url || null;
    if (toPlay) {
      try {
        const audio = new Audio(toPlay);
        await audio.play().catch(() => {});
      } catch (_) {}
      return;
    }
    if (!(word || '').trim()) return;
    const result = await fetchPhoneticForWord(word);
    if (result?.phoneticAudio) {
      try {
        const audio = new Audio(result.phoneticAudio);
        await audio.play().catch(() => {});
      } catch (_) {}
      if (onFetched) onFetched(result);
      if (wordId != null) {
        const next = words.map((w) =>
          w.id === wordId
            ? { ...w, phonetic: result.phonetic || w.phonetic, phoneticAudio: result.phoneticAudio }
            : w
        );
        setWords(next);
        saveWords(next);
      }
      return;
    }
    // API 无读音 URL 或请求失败时，用浏览器 TTS 朗读单词
    if (window.speechSynthesis && (result?.phonetic || word)) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word);
      u.lang = 'en-US';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
      if (onFetched && result) onFetched(result);
      if (wordId != null && result?.phonetic) {
        const next = words.map((w) =>
          w.id === wordId ? { ...w, phonetic: result.phonetic || w.phonetic } : w
        );
        setWords(next);
        saveWords(next);
      }
      return;
    }
    alert('未获取到该单词的读音，请检查拼写或稍后重试');
  };

  const handleDelete = (id) => {
    if (!window.confirm('确定删除该单词？')) return;
    const next = words.filter(w => w.id !== id);
    setWords(next);
    saveWords(next);
    if (editingId === id) resetForm();
  };

  const newCount = words.filter(w => w.isNew).length;
  const familiarCount = words.filter(w => !w.isNew).length;

  return (
    <PageLayout className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* 左侧：总词数/生词/熟词 = 统计 + 筛选，点击切换 */}
        <aside className="flex flex-row md:flex-col gap-2 md:w-44 shrink-0">
          <Card
            clickable
            onClick={() => setFilter('all')}
            className={`flex-1 md:flex-none flex flex-row items-center justify-center gap-4 py-2.5 px-3 md:px-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg min-h-0 transition-all ${filter === 'all' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 dark:ring-offset-gray-950' : 'hover:opacity-90'}`}
          >
            <FaBook className="w-6 h-6 md:w-7 md:h-7 opacity-80 shrink-0" />
            <div className="min-w-0 flex-1 flex flex-col items-center justify-center text-center">
              <span className="text-xl md:text-2xl font-bold leading-tight">{words.length}</span>
              <span className="text-xs opacity-90">总词数</span>
            </div>
          </Card>
          <Card
            clickable
            onClick={() => setFilter('new')}
            className={`flex-1 md:flex-none flex flex-row items-center justify-center gap-4 py-2.5 px-3 md:px-4 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg min-h-0 transition-all ${filter === 'new' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 dark:ring-offset-gray-950' : 'hover:opacity-90'}`}
          >
            <FaStarHalfAlt className="w-6 h-6 md:w-7 md:h-7 opacity-80 shrink-0" />
            <div className="min-w-0 flex-1 flex flex-col items-center justify-center text-center">
              <span className="text-xl md:text-2xl font-bold leading-tight">{newCount}</span>
              <span className="text-xs opacity-90">生词</span>
            </div>
          </Card>
          <Card
            clickable
            onClick={() => setFilter('familiar')}
            className={`flex-1 md:flex-none flex flex-row items-center justify-center gap-4 py-2.5 px-3 md:px-4 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg min-h-0 transition-all ${filter === 'familiar' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 dark:ring-offset-gray-950' : 'hover:opacity-90'}`}
          >
            <FaStar className="w-6 h-6 md:w-7 md:h-7 opacity-80 shrink-0" />
            <div className="min-w-0 flex-1 flex flex-col items-center justify-center text-center">
              <span className="text-xl md:text-2xl font-bold leading-tight">{familiarCount}</span>
              <span className="text-xs opacity-90">熟词</span>
            </div>
          </Card>
        </aside>

        <main className="min-w-0 flex-1">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            单词本
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            记录生词与熟词，支持筛选与搜索
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="small" icon={<FaCloudDownloadAlt />} iconPosition="left" onClick={syncVocabularyToProject} title="下载到 public/content/vocabulary/ 后 push 到 GitHub">
            同步到项目
          </Button>
          <Button variant="ghost" size="small" icon={<FaSearch />} iconPosition="left" onClick={openRootsManager}>
            管理词根词缀
          </Button>
        </div>
      </div>

      {/* 词根词缀词典管理：查看 / 添加 / 编辑 / 删除 */}
      {showRootsManager && (
        <Card className="mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">词根词缀词典</h2>
            <Button variant="ghost" size="small" icon={<FaTimes />} onClick={() => { setShowRootsManager(false); setRootsEditEntry(null); }}>
              关闭
            </Button>
          </div>
          <form onSubmit={saveRootsEntry} className="flex flex-wrap gap-3 mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <Input placeholder="词根/词缀" value={rootsForm.word} onChange={(e) => setRootsForm((f) => ({ ...f, word: e.target.value }))} className="w-28" />
            <select value={rootsForm.type} onChange={(e) => setRootsForm((f) => ({ ...f, type: e.target.value }))} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <option value="词根">词根</option>
              <option value="词缀">词缀</option>
            </select>
            <Input placeholder="释义" value={rootsForm.meaning} onChange={(e) => setRootsForm((f) => ({ ...f, meaning: e.target.value }))} className="flex-1 min-w-[100px]" />
            <Input placeholder="例句" value={rootsForm.example} onChange={(e) => setRootsForm((f) => ({ ...f, example: e.target.value }))} className="flex-1 min-w-[100px]" />
            {rootsEditEntry ? (
              <>
                <Button type="submit" size="small">保存</Button>
                <Button type="button" variant="ghost" size="small" onClick={cancelEditRoots}>取消</Button>
              </>
            ) : (
              <Button type="submit" size="small" icon={<FaPlus />}>添加</Button>
            )}
          </form>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {rootsAffixesList.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <span className="font-medium w-24 truncate">{entry.word}</span>
                  <Badge variant="default" size="small">{entry.type}</Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex-1 min-w-0 truncate">{entry.meaning}</span>
                  {entry.example && <span className="text-xs text-gray-500 truncate max-w-[180px]" title={entry.example}>{entry.example}</span>}
                  <Button type="button" variant="ghost" size="small" icon={<FaEdit />} onClick={() => startEditRoots(entry)} title="编辑" />
                  <Button type="button" variant="danger" size="small" icon={<FaTrash />} onClick={() => deleteRootsEntry(entry.id)} title="删除" />
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* 操作栏 */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <SearchBox
            placeholder="搜索单词、释义或例句..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-0"
          />
          <Button
            onClick={() => { resetForm(); setShowForm(!showForm); setForm({ ...form, word: '', phonetic: '', phoneticAudio: '', partOfSpeech: '', definition: '', example: '', synonyms: '', remark: '', isNew: true }); setSelectedRootsAffixes([]); }}
            icon={showForm ? <FaTimes /> : <FaPlus />}
            iconPosition="left"
          >
            {showForm ? '取消' : '添加单词'}
          </Button>
        </div>
      </Card>

      {/* 添加/编辑表单 */}
      {showForm && (
        <Card className="mb-6 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {editingId ? '编辑单词' : '添加单词'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="单词 *"
                value={form.word}
                onChange={(e) => setForm(f => ({ ...f, word: e.target.value }))}
                placeholder="例如 biology、readable"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">类型（词性）</label>
                <select
                  value={form.partOfSpeech}
                  onChange={(e) => setForm(f => ({ ...f, partOfSpeech: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  {PARTS_OF_SPEECH.map((opt) => (
                    <option key={opt.value || 'none'} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 根据当前输入的单词匹配词根词缀，点击 + 加入下方标签，保存时写入该单词的词根词缀注释 */}
            {(form.word || '').trim().length >= 2 && (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <FaSearch />
                  匹配的词根词缀
                </h3>
                {rootsResults.length > 0 ? (
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                    {rootsResults.map((entry, i) => {
                      const key = `${entry.word}-${entry.type}`;
                      const isSelected = selectedRootsAffixes.some((e) => `${e.word}-${e.type}` === key);
                      return (
                        <div
                          key={`${entry.word}-${i}`}
                          className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
                        >
                          <span className="font-medium text-gray-900 dark:text-gray-100">{entry.word}</span>
                          <Badge variant="default" size="small">{entry.type}</Badge>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{entry.meaning}</span>
                          {entry.example && (
                            <span className="text-xs text-gray-500 dark:text-gray-500 truncate max-w-[100px]" title={entry.example}>
                              {entry.example}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleSelectRootAffix(entry)}
                            disabled={isSelected}
                            className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold ${
                              isSelected
                                ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 cursor-default'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                            title={isSelected ? '已添加' : '添加为词根词缀注释'}
                          >
                            +
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">未匹配到词根或词缀</p>
                )}
                {selectedRootsAffixes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">已选（保存后写入该单词注释）：</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedRootsAffixes.map((entry, index) => (
                        <span
                          key={`${entry.word}-${entry.type}-${index}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-3 py-1 text-sm"
                        >
                          <span className="font-medium">{entry.word}</span>
                          <Badge variant="default" size="small">{entry.type}</Badge>
                          <span className="text-gray-600 dark:text-gray-400">{entry.meaning}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRootAffix(index)}
                            className="ml-0.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                            title="移除"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  {!showQuickAddRoot ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={() => setShowQuickAddRoot(true)}
                      title="词根词缀库中没有当前单词相关项时可在此添加，并自动选入本词"
                    >
                      添加新词根/词缀
                    </Button>
                  ) : (
                    <div className="space-y-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          placeholder="词根或词缀，如 bio、-able"
                          value={quickRootForm.word}
                          onChange={(e) => setQuickRootForm((f) => ({ ...f, word: e.target.value }))}
                        />
                        <select
                          value={quickRootForm.type}
                          onChange={(e) => setQuickRootForm((f) => ({ ...f, type: e.target.value }))}
                          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                        >
                          <option value="词根">词根</option>
                          <option value="词缀">词缀</option>
                        </select>
                      </div>
                      <Input
                        placeholder="释义"
                        value={quickRootForm.meaning}
                        onChange={(e) => setQuickRootForm((f) => ({ ...f, meaning: e.target.value }))}
                      />
                      <Input
                        placeholder="例词（可选）"
                        value={quickRootForm.example}
                        onChange={(e) => setQuickRootForm((f) => ({ ...f, example: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <Button type="button" size="small" onClick={handleQuickAddRoot}>添加并选入本词</Button>
                        <Button type="button" variant="ghost" size="small" onClick={() => { setShowQuickAddRoot(false); setQuickRootForm({ word: '', type: '词根', meaning: '', example: '' }); }}>取消</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <div className="flex items-end gap-2">
                  <div className="flex-1 min-w-0">
                    <Input
                      label="音标"
                      value={form.phonetic}
                      onChange={(e) => setForm(f => ({ ...f, phonetic: e.target.value }))}
                      placeholder="例如 /ˈæpl/ 或点击自动获取"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    icon={<FaVolumeUp />}
                    onClick={fetchPhonetic}
                    disabled={phoneticLoading || !(form.word || '').trim()}
                    title="根据单词自动获取音标与读音（需联网）"
                  >
                    {phoneticLoading ? '获取中…' : '自动获取'}
                  </Button>
                  {(form.phoneticAudio || form.phonetic || form.word) && (
                    <button
                      type="button"
                      onClick={() => playPhoneticAudio(form.phoneticAudio, form.word, null, (r) => setForm((f) => ({ ...f, phonetic: r.phonetic || f.phonetic, phoneticAudio: r.phoneticAudio || f.phoneticAudio })))}
                      className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      title={form.phoneticAudio ? '播放读音' : '获取并播放读音（需联网）'}
                    >
                      <FaVolumeUp className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="mt-2 relative">
                  <PhoneticKeyboard
                    open={phoneticKeyboardOpen}
                    onToggle={() => setPhoneticKeyboardOpen(!phoneticKeyboardOpen)}
                    onInsert={handleInsertPhonetic}
                  />
                </div>
              </div>
            </div>
            <Textarea
              label="释义"
              value={form.definition}
              onChange={(e) => setForm(f => ({ ...f, definition: e.target.value }))}
              placeholder="单词释义"
              rows={2}
            />
            <Textarea
              label="例句"
              value={form.example}
              onChange={(e) => setForm(f => ({ ...f, example: e.target.value }))}
              placeholder="例句（可选）"
              rows={2}
            />
            <Input
              label="近义词"
              value={form.synonyms}
              onChange={(e) => setForm(f => ({ ...f, synonyms: e.target.value }))}
              placeholder="多个用逗号分隔，如 happy, joyful, glad"
            />
            <Textarea
              label="备注"
              value={form.remark}
              onChange={(e) => setForm(f => ({ ...f, remark: e.target.value }))}
              placeholder="可选备注"
              rows={2}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isNew"
                checked={form.isNew}
                onChange={(e) => setForm(f => ({ ...f, isNew: e.target.checked }))}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <label htmlFor="isNew" className="text-sm text-gray-700 dark:text-gray-300">
                标记为生词（未掌握）
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" icon={<FaSave />} iconPosition="left">
                {editingId ? '保存' : '添加'}
              </Button>
              <Button type="button" variant="ghost" onClick={resetForm}>
                取消
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 单词列表 */}
      {filteredWords.length === 0 ? (
        <EmptyState
          icon="inbox"
          title={searchTerm || filter !== 'all' ? '没有匹配的单词' : '还没有单词'}
          description={searchTerm || filter !== 'all' ? '试试其他筛选或搜索' : '点击「添加单词」开始记录'}
          action={!searchTerm && filter === 'all' ? (
            <Button onClick={() => setShowForm(true)} icon={<FaPlus />} iconPosition="left">
              添加单词
            </Button>
          ) : null}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredWords.map((w) => (
              <li
                key={w.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                      {w.word}
                    </span>
                    {w.partOfSpeech && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{w.partOfSpeech}</span>
                    )}
                    {w.phonetic && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {w.phonetic}
                      </span>
                    )}
                    {(w.phonetic || w.word) && (
                      <button
                        type="button"
                        onClick={() => playPhoneticAudio(w.phoneticAudio, w.word, w.id)}
                        className="p-1 rounded text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                        title={w.phoneticAudio ? '播放读音' : '获取并播放读音（需联网）'}
                      >
                        <FaVolumeUp className="w-4 h-4" />
                      </button>
                    )}
                    <Badge variant={w.isNew ? 'warning' : 'success'} size="small">
                      {w.isNew ? '生词' : '熟词'}
                    </Badge>
                  </div>
                  {w.rootsAffixes && w.rootsAffixes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {w.rootsAffixes.map((ra, i) => (
                        <span
                          key={`${ra.word}-${i}`}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-xs"
                        >
                          <span className="font-medium">{ra.word}</span>
                          <span className="text-gray-500 dark:text-gray-400">{ra.type}</span>
                          <span>{ra.meaning}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {w.definition && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {w.definition}
                    </p>
                  )}
                  {w.example && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic line-clamp-1">
                      {w.example}
                    </p>
                  )}
                  {w.synonyms && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      近义词：{w.synonyms}
                    </p>
                  )}
                  {w.remark && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      备注：{w.remark}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleToggleNew(w.id)}
                    title={w.isNew ? '标记为熟词' : '标记为生词'}
                  >
                    {w.isNew ? '标为熟词' : '标为生词'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    icon={<FaEdit />}
                    onClick={() => handleEdit(w)}
                    title="编辑"
                  />
                  <Button
                    variant="danger"
                    size="small"
                    icon={<FaTrash />}
                    onClick={() => handleDelete(w.id)}
                    title="删除"
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
        </main>
      </div>
    </PageLayout>
  );
}

export default VocabularyPage;
