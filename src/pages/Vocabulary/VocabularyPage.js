import React, { useState, useEffect, useRef } from 'react';
import { FaBook, FaPlus, FaStar, FaStarHalfAlt, FaEdit, FaTrash, FaSave, FaTimes, FaSearch, FaVolumeUp, FaCloudDownloadAlt } from 'react-icons/fa';
import { Button, Card, Badge, EmptyState, SearchBox, Input, Textarea, Collapsible } from '../../components/UI';
import PageLayout from '../../components/Layout/PageLayout';
import PhoneticKeyboard from './PhoneticKeyboard';
import { matchRootsAffixesInWord, getRootsAffixesList, saveRootsAffixesList } from './rootsAffixesData';
import { writeFilesToPickedFolder, canUseFileSystemAccess } from '../../utils/syncToProject';
import { useI18n } from '../../context/I18nContext';
import { useSession } from '../../context/SessionContext';

const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

const STORAGE_KEY = 'vocabularyWords';

const SYNC_SUCCESS_UNTIL_KEY = 'vocabSyncSuccessUntil';

/** 同步成功提示显示到该时间戳（模块级 + sessionStorage，避免刷新/重挂载后提示丢失） */
let syncSuccessUntil = 0;

function getSyncSuccessUntilFromStorage() {
  try {
    const v = sessionStorage.getItem(SYNC_SUCCESS_UNTIL_KEY);
    const t = v ? parseInt(v, 10) : 0;
    return Number.isFinite(t) ? t : 0;
  } catch (_) {
    return 0;
  }
}

function setSyncSuccessUntilStorage(until) {
  try {
    if (until > 0) sessionStorage.setItem(SYNC_SUCCESS_UNTIL_KEY, String(until));
    else sessionStorage.removeItem(SYNC_SUCCESS_UNTIL_KEY);
  } catch (_) {}
}

const PARTS_OF_SPEECH = [
  { value: 'None', label: '不选' },
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
  const { t } = useI18n();
  const { startSession, sessionEnabled, VOCAB_SYNC_COUNT_KEY } = useSession();
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
    relatedPhrases: '',
    derivations: '',
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
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncSuccessHint, setSyncSuccessHint] = useState(false);
  const [sessionSyncCount, setSessionSyncCount] = useState(0);
  const syncSuccessUntilRef = useRef(0);

  // 从 sessionStorage 恢复本 session 的同步次数；仅当 session 未开启时清零，超时未点「结束」前仍保留次数
  useEffect(() => {
    if (sessionEnabled) {
      try {
        const n = parseInt(sessionStorage.getItem(VOCAB_SYNC_COUNT_KEY) || '0', 10);
        const count = Number.isFinite(n) ? n : 0;
        setSessionSyncCount(count);
        if (count > 0) setSyncSuccessHint(true);
      } catch (_) {
        setSessionSyncCount(0);
      }
    } else {
      setSessionSyncCount(0);
    }
  }, [sessionEnabled, VOCAB_SYNC_COUNT_KEY]);

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

  // 若挂载时仍在「已同步」显示窗口内（含刷新后从 sessionStorage 恢复），恢复提示并设定时关闭
  useEffect(() => {
    const fromStorage = getSyncSuccessUntilFromStorage();
    const until = Math.max(syncSuccessUntil, fromStorage);
    if (until > Date.now()) {
      syncSuccessUntil = until;
      setSyncSuccessHint(true);
      const ms = Math.min(until - Date.now(), 2500);
      const t = setTimeout(() => {
        setSyncSuccessHint(false);
        syncSuccessUntil = 0;
        setSyncSuccessUntilStorage(0);
      }, ms);
      return () => clearTimeout(t);
    }
  }, []);

  // 根据当前输入的单词匹配词根词缀
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
        (w.relatedPhrases && w.relatedPhrases.toLowerCase().includes(q)) ||
        (w.derivations && w.derivations.toLowerCase().includes(q)) ||
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
      relatedPhrases: '',
      derivations: '',
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
      alert(t('VocabFillWord'));
      return;
    }
    const item = {
      id: editingId ?? Date.now(),
      word,
      phonetic: (form.phonetic || '').trim(),
      phoneticAudio: (form.phoneticAudio || '').trim() || undefined,
      partOfSpeech: (form.partOfSpeech || '').trim(),
      definition: (form.definition || '').trim(),
      relatedPhrases: (form.relatedPhrases || '').trim() || undefined,
      derivations: (form.derivations || '').trim() || undefined,
      example: (form.example || '').trim() || undefined,
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
      relatedPhrases: w.relatedPhrases || '',
      derivations: w.derivations || '',
      example: w.example || '',
      synonyms: w.synonyms || '',
      remark: w.remark || '',
      isNew: !!w.isNew
    });
    setSelectedRootsAffixes(Array.isArray(w.rootsAffixes) ? w.rootsAffixes : []);
    setEditingId(w.id);
    setShowForm(true);
  };

  /** 同步到本地：Chrome 选目录写入，其他浏览器下载 JSON 供放入仓库后 git push。
   * 若尚未开启 session，则在首次同步时开启 session；在 session 期间同步成功后，「已同步」会持续显示并统计次数。 */
  const handleSyncToLocal = async () => {
    // 与本地存储相关的操作：若尚未开启 session，则开启
    startSession();
    const files = [
      { name: 'words.json', content: JSON.stringify(words, null, 2) },
      { name: 'rootsAffixes.json', content: JSON.stringify(rootsAffixesList, null, 2) }
    ];
    setSyncInProgress(true);
    setSyncSuccessHint(false);
    syncSuccessUntilRef.current = 0;
    let result;
    try {
      result = await writeFilesToPickedFolder(files);
      if (result.success) {
        setSyncSuccessHint(true);
        setSessionSyncCount((c) => {
          try {
            const fromStorage = parseInt(sessionStorage.getItem(VOCAB_SYNC_COUNT_KEY) || '0', 10);
            const current = Number.isFinite(fromStorage) ? fromStorage : 0;
            const next = current + 1;
            sessionStorage.setItem(VOCAB_SYNC_COUNT_KEY, String(next));
            return next;
          } catch (_) {
            return c + 1;
          }
        });
        return;
      }
      if (result.cancelledByUser) return;
    } catch (e) {
      console.warn('File System Access 写入失败', e);
    } finally {
      setSyncInProgress(false);
    }
    // 非 Chrome 或用户取消：下载 JSON，提示放入 public/content/vocabulary/ 后 git push
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
    alert(t('VocabSyncDownloaded'));
    // 下载方式同样视为一次本地同步操作：确保已开启 session，并累计次数
    startSession();
    setSyncSuccessHint(true);
    setSessionSyncCount((c) => {
      try {
        const fromStorage = parseInt(sessionStorage.getItem(VOCAB_SYNC_COUNT_KEY) || '0', 10);
        const current = Number.isFinite(fromStorage) ? fromStorage : 0;
        const next = current + 1;
        sessionStorage.setItem(VOCAB_SYNC_COUNT_KEY, String(next));
        return next;
      } catch (_) {
        return c + 1;
      }
    });
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
      alert(t('VocabFillRootAffix'));
      return;
    }
    const entry = {
      word: word.trim(),
      type: type || t('VocabRoot'),
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
      alert(t('VocabFillRootAffix'));
      return;
    }
    const entry = { word: word.trim(), type: type || t('VocabRoot'), meaning: (meaning || '').trim(), example: (example || '').trim() };
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
    if (!window.confirm(t('VocabConfirmDeleteRoot'))) return;
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
      alert(t('VocabInputWordFirst'));
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
      alert(t('VocabPhoneticFailed'));
    } finally {
      setPhoneticLoading(false);
    }
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
    alert(t('VocabNoPronunciation'));
  };

  const handleDelete = (id) => {
    if (!window.confirm(t('VocabConfirmDeleteWord'))) return;
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
              <span className="text-xs opacity-90">{t('VocabTotalWords')}</span>
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
              <span className="text-xs opacity-90">{t('VocabNewWords')}</span>
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
              <span className="text-xs opacity-90">{t('VocabFamiliarWords')}</span>
            </div>
          </Card>
        </aside>

        <main className="min-w-0 flex-1">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              {t('VocabTitle')}
            </h1>
            <button
              type="button"
              onClick={handleSyncToLocal}
              disabled={syncInProgress}
              title={canUseFileSystemAccess() ? t('VocabSyncToProject') : t('VocabSyncExport')}
              className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center shrink-0 disabled:opacity-50 transition-colors"
            >
              {syncInProgress ? (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <FaCloudDownloadAlt className="w-4 h-4" />
              )}
            </button>
            {(() => {
              const fromStorage = getSyncSuccessUntilFromStorage();
              const until = Math.max(syncSuccessUntil, fromStorage);
              const inWindow = until > 0 && Date.now() < until;
              const showSuccess = syncSuccessHint || inWindow;
              return showSuccess ? (
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {t('VocabSyncSuccess')}
                  {sessionSyncCount > 0 ? ` (${sessionSyncCount} 次)` : ''}
                </span>
              ) : null;
            })()}
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t('VocabSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="small" icon={<FaSearch />} iconPosition="left" onClick={openRootsManager}>
            {t('VocabManageRoots')}
          </Button>
        </div>
      </div>

      {/* 词根词缀词典管理：查看 / 添加 / 编辑 / 删除 */}
      {showRootsManager && (
        <Card className="mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('VocabRootsDict')}</h2>
            <Button variant="ghost" size="small" icon={<FaTimes />} onClick={() => { setShowRootsManager(false); setRootsEditEntry(null); }}>
              {t('VocabClose')}
            </Button>
          </div>
          <form onSubmit={saveRootsEntry} className="flex flex-wrap gap-3 mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <Input placeholder={`${t('VocabRoot')}/${t('VocabAffix')}`} value={rootsForm.word} onChange={(e) => setRootsForm((f) => ({ ...f, word: e.target.value }))} className="w-28" />
            <select value={rootsForm.type} onChange={(e) => setRootsForm((f) => ({ ...f, type: e.target.value }))} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <option value="词根">{t('VocabRoot')}</option>
              <option value="词缀">{t('VocabAffix')}</option>
            </select>
            <Input placeholder={t('VocabMeaning')} value={rootsForm.meaning} onChange={(e) => setRootsForm((f) => ({ ...f, meaning: e.target.value }))} className="flex-1 min-w-[100px]" />
            <Input placeholder={t('VocabExample')} value={rootsForm.example} onChange={(e) => setRootsForm((f) => ({ ...f, example: e.target.value }))} className="flex-1 min-w-[100px]" />
            {rootsEditEntry ? (
              <>
                <Button type="submit" size="small">{t('Save')}</Button>
                <Button type="button" variant="ghost" size="small" onClick={cancelEditRoots}>{t('Cancel')}</Button>
              </>
            ) : (
              <Button type="submit" size="small" icon={<FaPlus />}>{t('VocabAdd')}</Button>
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
            placeholder={t('VocabSearchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-0"
          />
          <Button
            onClick={() => { resetForm(); setShowForm(!showForm); setSelectedRootsAffixes([]); }}
            icon={showForm ? <FaTimes /> : <FaPlus />}
            iconPosition="left"
          >
            {showForm ? t('Cancel') : t('VocabAddWord')}
          </Button>
        </div>
      </Card>

      {/* 添加/编辑表单 */}
      {showForm && (
        <Card className="mb-6 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {editingId ? t('VocabEditWord') : t('VocabAddWord')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('VocabWordRequired')}
                value={form.word}
                onChange={(e) => setForm(f => ({ ...f, word: e.target.value }))}
                placeholder="例如 biology、readable"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('VocabPartOfSpeech')}</label>
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
                  {t('VocabMatchedRoots')}
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('VocabNoMatch')}</p>
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
                      title={t('VocabAddNewRoot')}
                    >
                      {t('VocabAddNewRoot')}
                    </Button>
                  ) : (
                    <div className="space-y-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          placeholder={`${t('VocabRoot')}/${t('VocabAffix')} e.g. bio, -able`}
                          value={quickRootForm.word}
                          onChange={(e) => setQuickRootForm((f) => ({ ...f, word: e.target.value }))}
                        />
                        <select
                          value={quickRootForm.type}
                          onChange={(e) => setQuickRootForm((f) => ({ ...f, type: e.target.value }))}
                          className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                        >
                          <option value="词根">{t('VocabRoot')}</option>
                          <option value="词缀">{t('VocabAffix')}</option>
                        </select>
                      </div>
                      <Input
                        placeholder={t('VocabMeaning')}
                        value={quickRootForm.meaning}
                        onChange={(e) => setQuickRootForm((f) => ({ ...f, meaning: e.target.value }))}
                      />
                      <Input
                        placeholder={`${t('VocabExample')} (optional)`}
                        value={quickRootForm.example}
                        onChange={(e) => setQuickRootForm((f) => ({ ...f, example: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <Button type="button" size="small" onClick={handleQuickAddRoot}>{t('VocabAddAndSelect')}</Button>
                        <Button type="button" variant="ghost" size="small" onClick={() => { setShowQuickAddRoot(false); setQuickRootForm({ word: '', type: '词根', meaning: '', example: '' }); }}>{t('Cancel')}</Button>
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
                      label={t('VocabPhonetic')}
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
                    {phoneticLoading ? t('VocabFetching') : t('VocabAutoFetch')}
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
              label={t('VocabMeaning')}
              value={form.definition}
              onChange={(e) => setForm(f => ({ ...f, definition: e.target.value }))}
              placeholder="单词释义"
              rows={2}
            />
            <Collapsible title={t('VocabRelatedPhrases')} defaultExpanded={false}>
              <Textarea
                label=""
                value={form.relatedPhrases}
                onChange={(e) => setForm(f => ({ ...f, relatedPhrases: e.target.value }))}
                placeholder="关联短语（可选）"
                rows={2}
              />
            </Collapsible>
            <Collapsible title={t('VocabDerivations')} defaultExpanded={false}>
              <Textarea
                label=""
                value={form.derivations}
                onChange={(e) => setForm(f => ({ ...f, derivations: e.target.value }))}
                placeholder="派生/联想（可选）"
                rows={2}
              />
            </Collapsible>
            <Collapsible title={t('VocabSynonyms')} defaultExpanded={false}>
              <Input
                label=""
                value={form.synonyms}
                onChange={(e) => setForm(f => ({ ...f, synonyms: e.target.value }))}
                placeholder="多个用逗号分隔，如 happy, joyful, glad"
              />
            </Collapsible>
            <Collapsible title={t('VocabExample')} defaultExpanded={false}>
              <Textarea
                label=""
                value={form.example}
                onChange={(e) => setForm(f => ({ ...f, example: e.target.value }))}
                placeholder="例句（可选）"
                rows={2}
              />
            </Collapsible>
            <Collapsible title={t('VocabNotes')} defaultExpanded={false}>
              <Textarea
                label=""
                value={form.remark}
                onChange={(e) => setForm(f => ({ ...f, remark: e.target.value }))}
                placeholder="可选备注"
                rows={2}
              />
            </Collapsible>
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
          title={searchTerm || filter !== 'all' ? t('VocabNoSearchResult') : t('VocabNoWords')}
          description={searchTerm || filter !== 'all' ? '' : ''}
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
                  {w.relatedPhrases && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {t('VocabRelatedPhrases')}：{w.relatedPhrases}
                    </p>
                  )}
                  {w.derivations && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {t('VocabDerivations')}：{w.derivations}
                    </p>
                  )}
                  {w.example && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic line-clamp-1">
                      {w.example}
                    </p>
                  )}
                  {w.synonyms && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {t('VocabSynonyms')}：{w.synonyms}
                    </p>
                  )}
                  {w.remark && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {t('VocabNotes')}：{w.remark}
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
