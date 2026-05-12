import React, { useState, useEffect } from 'react';
import { FaBook, FaStar, FaStarHalfAlt, FaVolumeUp } from 'react-icons/fa';
import { Card, Badge, EmptyState, SearchBox } from '../../components/UI';
import PageLayout from '../../components/Layout/PageLayout';
import { useI18n } from '../../context/I18nContext';

const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

function VocabularyPage() {
  const { t } = useI18n();
  const [words, setWords] = useState([]);
  const [filteredWords, setFilteredWords] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const base = process.env.PUBLIC_URL || '';
    fetch(`${base}/data/vocabulary.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((fileWords) => {
        const wordsList = Array.isArray(fileWords) ? fileWords : [];
        setWords(wordsList);
      })
      .catch(() => {
        setWords([]);
      });
  }, []);

  useEffect(() => {
    let list = words;
    if (filter === 'new') list = list.filter(w => !w.lastReviewDate || w.reviewCount === 0);
    if (filter === 'familiar') list = list.filter(w => w.lastReviewDate || w.reviewCount > 0);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(w =>
        (w.word && w.word.toLowerCase().includes(q)) ||
        (w.meaning && w.meaning.toLowerCase().includes(q)) ||
        (w.sentence && w.sentence.toLowerCase().includes(q)) ||
        (w.sentenceCn && w.sentenceCn.toLowerCase().includes(q)) ||
        (w.partOfSpeech && w.partOfSpeech.toLowerCase().includes(q)) ||
        (Array.isArray(w.tags) && w.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }
    setFilteredWords(list);
  }, [words, filter, searchTerm]);

  const parsePhoneticsFromApi = (data) => {
    const list = Array.isArray(data) ? data : [];
    const allPhonetics = list.flatMap((e) => e.phonetics || []);
    const text = allPhonetics.map((p) => p.text).find((t) => t && String(t).trim());
    const audio = allPhonetics.map((p) => p.audio).find((url) => url && String(url).trim());
    return { phonetic: text || '', phoneticAudio: audio || '' };
  };

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

  const playPhoneticAudio = async (url, word, wordId) => {
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
      if (wordId != null) {
        const next = words.map((w) =>
          w.id === wordId
            ? { ...w, phonetic: result.phonetic || w.phonetic, phoneticAudio: result.phoneticAudio }
            : w
        );
        setWords(next);
      }
      return;
    }
    if (window.speechSynthesis && (result?.phonetic || word)) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word);
      u.lang = 'en-US';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
      if (wordId != null && result?.phonetic) {
        const next = words.map((w) =>
          w.id === wordId ? { ...w, phonetic: result.phonetic || w.phonetic } : w
        );
        setWords(next);
      }
      return;
    }
    alert(t('VocabNoPronunciation'));
  };

  const newCount = words.filter(w => !w.lastReviewDate || w.reviewCount === 0).length;
  const familiarCount = words.filter(w => w.lastReviewDate || w.reviewCount > 0).length;

  return (
    <PageLayout className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-6">
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
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {t('VocabTitle')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t('VocabSubtitle')}
            </p>
          </div>

          <Card className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <SearchBox
                placeholder={t('VocabSearchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-0"
              />
            </div>
          </Card>

          {filteredWords.length === 0 ? (
            <EmptyState
              icon="inbox"
              title={searchTerm || filter !== 'all' ? t('VocabNoSearchResult') : t('VocabNoWords')}
              description={searchTerm || filter !== 'all' ? '' : ''}
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
                        <Badge variant={(!w.lastReviewDate || w.reviewCount === 0) ? 'warning' : 'success'} size="small">
                          {(!w.lastReviewDate || w.reviewCount === 0) ? '生词' : '熟词'}
                        </Badge>
                      </div>
                      {w.meaning && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {w.meaning}
                        </p>
                      )}
                      {w.sentence && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic line-clamp-1">
                          {w.sentence}
                        </p>
                      )}
                      {w.sentenceCn && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {w.sentenceCn}
                        </p>
                      )}
                      {Array.isArray(w.tags) && w.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {w.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {w.remark && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {t('VocabNotes')}：{w.remark}
                        </p>
                      )}
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