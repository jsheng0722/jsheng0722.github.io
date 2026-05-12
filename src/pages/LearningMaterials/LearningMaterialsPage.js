import React, { useEffect, useMemo, useState } from 'react';
import { FaBookOpen, FaExternalLinkAlt } from 'react-icons/fa';
import { Card, EmptyState, SearchBox, Badge } from '../../components/UI';
import PageLayout from '../../components/Layout/PageLayout';
import { useI18n } from '../../context/I18nContext';

function LearningMaterialsPage() {
  const { t } = useI18n();
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const base = process.env.PUBLIC_URL || '';
        const response = await fetch(`${base}/data/learning-materials.json`);
        if (response.ok) {
          const data = await response.json();
          setMaterials(data);
        } else {
          setMaterials([]);
        }
      } catch (error) {
        console.error('加载学习材料失败:', error);
        setMaterials([]);
      }
    };

    loadMaterials();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return materials;
    return materials.filter((item) =>
      (item.title || '').toLowerCase().includes(q) ||
      (item.type || '').toLowerCase().includes(q) ||
      (item.filePath || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q) ||
      (item.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [materials, search]);

  return (
    <PageLayout className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('MaterialsTitle')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('MaterialsStorageDesc')}
        </p>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <SearchBox
            placeholder={t('MaterialsSearchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-0"
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon="inbox"
          title={search ? t('MaterialsNoSearchResult') : t('MaterialsNoData')}
          description={search ? t('MaterialsNoSearchHint') : t('MaterialsNoDataDesc')}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map((item) => (
              <li key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <FaBookOpen className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</span>
                      <Badge variant="default" size="small">{item.type}</Badge>
                    </div>
                    {item.filePath && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                        {item.filePath}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{item.description}</p>
                    )}
                    {item.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="default" size="small">#{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.filePath && (
                      <a
                        href={item.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title={t('MaterialsOpenFile')}
                      >
                        <FaExternalLinkAlt className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </PageLayout>
  );
}

export default LearningMaterialsPage;
