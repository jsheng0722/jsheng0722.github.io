import React from 'react';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import UniversalFileBrowser from '../../components/FileManager/UniversalFileBrowser';
import { useI18n } from '../../context/I18nContext';

function UniversalFilesPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                {t('UniversalFilesPageTitle')}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {t('UniversalFilesPageDesc')}
              </p>
            </div>
          </div>
        </div>

        <div className="h-[calc(100vh-250px)]">
          <UniversalFileBrowser />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default UniversalFilesPage;
