import React from 'react';
import { FaMusic, FaFileAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Card } from '../../components/UI';
import PageLayout from '../../components/Layout/PageLayout';
import { useI18n } from '../../context/I18nContext';

function Music() {
  const { t } = useI18n();
  return (
    <PageLayout className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
            <FaMusic className="text-blue-500" />
            {t('MusicCreation')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('MusicSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/music/simple-recorder" className="group">
            <Card hover className="hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <FaFileAlt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {t('MusicSimpleRecord')}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('MusicSimpleRecordDesc')}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t('MusicSimpleRecordFull')}
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                {t('MusicSimpleRecordCta')}
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>
          </Link>

          <Card className="opacity-60">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <FaMusic className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                  {t('MusicPlayer')}
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {t('MusicComingSoon')}
                </p>
              </div>
            </div>
            <p className="text-gray-400 dark:text-gray-500 mb-4">
              {t('MusicComingSoonDesc')}
            </p>
            <div className="flex items-center text-gray-400 text-sm font-medium">
              {t('MusicComingSoon')}
            </div>
          </Card>
        </div>

        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            {t('MusicInstructions')}
          </h3>
          <div className="space-y-2 text-blue-800 dark:text-blue-200">
            <p>• {t('MusicInstruction1')}</p>
            <p>• {t('MusicInstruction2')}</p>
            <p>• {t('MusicInstruction3')}</p>
            <p>• {t('MusicInstruction4')}</p>
            <p>• {t('MusicInstruction5')}</p>
          </div>
        </div>
    </PageLayout>
  );
}

export default Music;