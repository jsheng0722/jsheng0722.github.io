import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useI18n } from '../../context/I18nContext';

const SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop&q=80',
    altKey: 'HomeCarouselAlt1',
  },
  {
    src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&h=900&fit=crop&q=80',
    altKey: 'HomeCarouselAlt2',
  },
  {
    src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1600&h=900&fit=crop&q=80',
    altKey: 'HomeCarouselAlt3',
  },
  {
    src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&h=900&fit=crop&q=80',
    altKey: 'HomeCarouselAlt4',
  },
  {
    src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1600&h=900&fit=crop&q=80',
    altKey: 'HomeCarouselAlt5',
  },
];

const AUTO_MS = 5500;

function WelcomeBanner() {
  const { t, locale } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState({});
  const timerRef = useRef(null);

  const len = SLIDES.length;
  const go = useCallback(
    (dir) => {
      setIndex((i) => (i + dir + len) % len);
    },
    [len]
  );

  useEffect(() => {
    if (paused || len <= 1) return;
    timerRef.current = window.setInterval(() => go(1), AUTO_MS);
    return () => clearInterval(timerRef.current);
  }, [paused, len, go, index]);

  const onError = (i) => setFailed((f) => ({ ...f, [i]: true }));

  if (len === 0) return null;

  return (
    <div
      className="w-full flex justify-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="group relative w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 bg-gray-900 dark:bg-gray-950"
        style={{ aspectRatio: '16 / 9', maxHeight: 'min(52vh, 520px)' }}
      >
        {/* 轨道：横向滑动 */}
        <div
          className="absolute inset-0 flex transition-transform duration-700 ease-out motion-reduce:transition-none"
          style={{
            width: `${len * 100}%`,
            transform: `translateX(-${(index / len) * 100}%)`,
          }}
        >
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className="relative h-full shrink-0 overflow-hidden"
              style={{ width: `${100 / len}%` }}
            >
              {!failed[i] ? (
                <img
                  src={slide.src}
                  alt={t(slide.altKey)}
                  className="h-full w-full object-cover object-center scale-105 motion-reduce:scale-100 transition-transform duration-[8000ms] ease-out group-hover:scale-100"
                  onError={() => onError(i)}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 via-indigo-900 to-slate-900 text-white/90">
                  <span className="text-sm font-medium">{t('HomeCarouselFallback')}</span>
                </div>
              )}
              {/* 底部渐变条，略提层次 */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent"
                aria-hidden
              />
            </div>
          ))}
        </div>

        {/* 左箭头 */}
        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg backdrop-blur-sm transition hover:bg-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800/90 dark:text-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 motion-reduce:opacity-100 max-sm:opacity-100"
          aria-label={t('HomeCarouselPrev')}
        >
          <FaChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg backdrop-blur-sm transition hover:bg-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800/90 dark:text-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 motion-reduce:opacity-100 max-sm:opacity-100"
          aria-label={t('HomeCarouselNext')}
        >
          <FaChevronRight className="h-4 w-4" />
        </button>

        {/* 指示器 */}
        <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2 px-4">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent ${
                i === index
                  ? 'w-8 bg-white shadow-md'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={locale === 'zh' ? `第 ${i + 1} 张` : `${t('HomeCarouselSlide')} ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
            />
          ))}
        </div>

        {/* 进度条（自动播放时） */}
        {!paused && len > 1 && (
          <div
            className="absolute bottom-0 left-0 right-0 z-[5] h-0.5 bg-white/20"
            aria-hidden
          >
            <div
              key={index}
              className="h-full origin-left bg-indigo-400/90 motion-reduce:hidden"
              style={{
                animation: `welcomeBannerProgress ${AUTO_MS}ms linear forwards`,
              }}
            />
          </div>
        )}
        <style>{`
          @keyframes welcomeBannerProgress {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default WelcomeBanner;
