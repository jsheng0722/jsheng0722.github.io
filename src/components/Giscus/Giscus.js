import React, { useEffect, useRef, useState } from 'react';
import { giscusConfig, isGiscusConfigured } from '../../config/giscus';

export const GISCUS_LANGS = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en', label: 'English' },
];

function Giscus({ lang: langProp }) {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const lang = langProp || giscusConfig.lang || 'zh-CN';

  useEffect(() => {
    const container = containerRef.current;
    if (!isGiscusConfigured() || !container) return;

    setLoaded(false);

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', giscusConfig.repo);
    script.setAttribute('data-repo-id', giscusConfig.repoId);
    script.setAttribute('data-category', giscusConfig.category);
    script.setAttribute('data-category-id', giscusConfig.categoryId);
    script.setAttribute('data-mapping', giscusConfig.mapping);
    script.setAttribute('data-strict', giscusConfig.strict);
    script.setAttribute('data-reactions-enabled', giscusConfig.reactionsEnabled);
    script.setAttribute('data-emit-metadata', giscusConfig.emitMetadata);
    script.setAttribute('data-input-position', giscusConfig.inputPosition);
    script.setAttribute('data-theme', giscusConfig.theme);
    script.setAttribute('data-lang', lang);
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;
    script.onload = () => setLoaded(true);

    container.appendChild(script);

    const t = setTimeout(() => setLoaded(true), 4000);

    return () => {
      clearTimeout(t);
      container.innerHTML = '';
    };
  }, [lang]);

  if (!isGiscusConfigured()) return null;

  return (
    <div className="giscus-wrapper mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      {!loaded && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Loading comments… / 评论区加载中…
        </p>
      )}
      <div ref={containerRef} className="giscus min-h-[220px]" />
    </div>
  );
}

export default Giscus;
