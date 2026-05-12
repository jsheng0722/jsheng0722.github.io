import React, { useState, useEffect } from 'react';
import { FaMusic, FaPlay, FaHeart, FaClock, FaCalendar, FaTag } from 'react-icons/fa';
import { Card, Badge, EmptyState } from '../../components/UI';
import PageLayout from '../../components/Layout/PageLayout';
import { useI18n } from '../../context/I18nContext';

function Music() {
  const { t } = useI18n();
  const [tracks, setTracks] = useState([]);
  const [inspirations, setInspirations] = useState([]);

  useEffect(() => {
    const base = process.env.PUBLIC_URL || '';

    fetch(`${base}/data/music.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setTracks(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setTracks([]);
      });

    fetch(`${base}/data/music-inspirations.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setInspirations(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setInspirations([]);
      });
  }, []);

  const formatDuration = (duration) => {
    return duration;
  };

  return (
    <PageLayout className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
          <FaMusic className="text-blue-500" />
          {t('MusicCreation')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('MusicSubtitle')}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <FaMusic className="text-blue-500" />
          {t('MusicLibrary')}
        </h2>

        {tracks.length === 0 ? (
          <EmptyState
            icon="music"
            title={t('MusicNoTracks')}
            description={t('MusicNoTracksDesc')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((track) => (
              <Card key={track.id} hover className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                    <FaMusic className="w-8 h-8 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {track.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {track.artist}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="secondary" size="small">
                        {track.genre}
                      </Badge>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FaClock className="w-3 h-3" />
                        {formatDuration(track.duration)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                        <FaPlay className="w-4 h-4" />
                        {t('Play')}
                      </button>
                      <button className={`p-1.5 rounded-lg transition-colors ${track.favorite ? 'text-red-500 bg-red-50 dark:bg-red-900/30' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'}`}>
                        <FaHeart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <FaTag className="text-purple-500" />
          {t('MusicInspirations')}
        </h2>

        {inspirations.length === 0 ? (
          <EmptyState
            icon="lightbulb"
            title={t('MusicNoInspirations')}
            description={t('MusicNoInspirationsDesc')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inspirations.map((inspiration) => (
              <Card key={inspiration.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xl">✨</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <Badge variant="warning" size="small" className="mb-2">
                      {inspiration.category}
                    </Badge>
                    <p className="text-gray-700 dark:text-gray-300">
                      {inspiration.content}
                    </p>
                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                      <FaCalendar className="w-3 h-3" />
                      {new Date(inspiration.timestamp).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default Music;