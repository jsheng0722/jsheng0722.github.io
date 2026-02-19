export const giscusConfig = {
  repo: process.env.REACT_APP_GISCUS_REPO || 'jsheng0722/jsheng0722.github.io',
  repoId: process.env.REACT_APP_GISCUS_REPO_ID || 'R_kgDOL5G9zQ',
  category: process.env.REACT_APP_GISCUS_CATEGORY || 'Announcements',
  categoryId: process.env.REACT_APP_GISCUS_CATEGORY_ID || 'DIC_kwDOLLuq2Y',
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '0',
  emitMetadata: '0',
  inputPosition: 'bottom',
  theme: 'preferred_color_scheme',
  lang: 'zh-CN',
};

export const isGiscusConfigured = () =>
  Boolean(giscusConfig.repo && giscusConfig.repoId && giscusConfig.categoryId);

export const getDiscussionsUrl = () =>
  giscusConfig.repo ? `https://github.com/${giscusConfig.repo}/discussions` : '#';
