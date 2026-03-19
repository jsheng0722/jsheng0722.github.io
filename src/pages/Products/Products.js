import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import { Card } from '../../components/UI';
import { useI18n } from '../../context/I18nContext';
import {
  FaBlog,
  FaStickyNote,
  FaBook,
  FaFolderOpen,
  FaVideo,
  FaHeart,
  FaMusic,
  FaFolder,
  FaWallet,
  FaFilePdf,
  FaChartLine,
  FaSitemap,
  FaImage,
  FaArrowRight,
} from 'react-icons/fa';

const FEATURES = {
  blog: {
    path: '/blog',
    icon: FaBlog,
    titleKey: 'ProductsFeatureBlog',
    descKey: 'ProductsFeatureBlogDesc',
  },
  study: [
    { path: '/notes', icon: FaStickyNote, titleKey: 'Notes', descKey: 'ProductsFeatureNotesDesc' },
    { path: '/vocabulary', icon: FaBook, titleKey: 'Vocabulary', descKey: 'ProductsFeatureVocabDesc' },
    { path: '/learning-materials', icon: FaFolderOpen, titleKey: 'LearningMaterials', descKey: 'ProductsFeatureMaterialsDesc' },
  ],
  content: [
    { path: '/video', icon: FaVideo, titleKey: 'Video', descKey: 'ProductsFeatureVideoDesc' },
    { path: '/shop', icon: FaHeart, titleKey: 'Favorites', descKey: 'ProductsFeatureShopDesc' },
    { path: '/music', icon: FaMusic, titleKey: 'Music', descKey: 'ProductsFeatureMusicDesc' },
    { path: '/files', icon: FaFolder, titleKey: 'FileManager', descKey: 'ProductsFeatureFilesDesc' },
  ],
  tools: [
    { path: '/accounting', icon: FaWallet, titleKey: 'Accounting', descKey: 'ProductsFeatureAccountingDesc' },
    { path: '/pdf', icon: FaFilePdf, titleKey: 'PDF', descKey: 'ProductsFeaturePdfDesc' },
    { path: '/visualization', icon: FaChartLine, titleKey: 'ProductsFeatureVisualization', descKey: 'ProductsFeatureVisualizationDesc' },
    { path: '/architecture', icon: FaSitemap, titleKey: 'Architecture', descKey: 'ProductsFeatureArchDesc' },
    { path: '/image-lab', icon: FaImage, titleKey: 'ImageLab', descKey: 'ProductsFeatureImageLabDesc' },
  ],
};

const SECTION_CLASS = 'mb-10 last:mb-0';
const ROW_WRAPPER_CLASS = 'w-full';
const CARD_ROW_CLASS = 'flex flex-nowrap justify-start gap-x-[5px] w-full max-w-full overflow-x-auto py-2';

function FeatureCard({ path, icon: Icon, titleKey, descKey, t }) {
  return (
    <Link to={path} className="flex-shrink-0 w-fit min-w-[140px] max-w-[320px] block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-xl">
      <Card hover clickable padding="medium" className="h-full flex flex-col min-w-0 overflow-hidden text-left">
        <div className="flex items-start gap-2 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden break-words">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 break-words">{t(titleKey)}</h3>
            <p className="mt-0.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 break-words">{t(descKey)}</p>
            <span className="inline-flex items-center gap-1 mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              {t('ProductsGoTo')}
              <FaArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function BlogBanner({ t }) {
  const { path, icon: Icon, titleKey, descKey } = FEATURES.blog;
  return (
    <Link
      to={path}
      className="block w-full rounded-2xl overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 dark:from-violet-800 dark:via-purple-800 dark:to-indigo-900 p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white">
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{t(titleKey)}</h2>
            <p className="mt-1 text-white/90 text-sm sm:text-base max-w-2xl">{t(descKey)}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 text-white font-medium sm:self-center">
          {t('ProductsGoTo')}
          <FaArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}

function Products() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('ProductsMyServices')}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('ProductsSubtitleFeatures')}</p>
          </div>

          {/* 博客 - 顶部长条 */}
          <section className="mb-10">
            <BlogBanner t={t} />
          </section>

          {/* 学习记录 / 内容 / 工具：Flex 单行，卡片随内容伸缩，列间距 5px */}
          <section className={SECTION_CLASS}>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('ProductsSectionStudy')}</h2>
            <div className={ROW_WRAPPER_CLASS}>
              <div className={CARD_ROW_CLASS}>
                {FEATURES.study.map((item) => (
                  <FeatureCard key={item.path} {...item} t={t} />
                ))}
              </div>
            </div>
          </section>
          <section className={SECTION_CLASS}>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('ProductsSectionContent')}</h2>
            <div className={ROW_WRAPPER_CLASS}>
              <div className={CARD_ROW_CLASS}>
                {FEATURES.content.map((item) => (
                  <FeatureCard key={item.path} {...item} t={t} />
                ))}
              </div>
            </div>
          </section>
          <section className={SECTION_CLASS}>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('ProductsSectionTools')}</h2>
            <div className={ROW_WRAPPER_CLASS}>
              <div className={CARD_ROW_CLASS}>
                {FEATURES.tools.map((item) => (
                  <FeatureCard key={item.path} {...item} t={t} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Products;
