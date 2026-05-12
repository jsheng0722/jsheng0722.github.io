/**
 * 词根词缀词典：默认数据
 * 结构：{ id?, word, type: '词根'|'词缀', meaning, example? }
 */
export const ROOTS_AFFIXES = [
  { word: 'bio', type: '词根', meaning: '生命', example: 'biology 生物学' },
  { word: 'graph', type: '词根', meaning: '写、画', example: 'autograph 亲笔签名' },
  { word: 'tele', type: '词根', meaning: '远', example: 'telephone 电话' },
  { word: 'port', type: '词根', meaning: '拿、运', example: 'export 出口' },
  { word: 'dict', type: '词根', meaning: '说', example: 'dictionary 词典' },
  { word: 'vis', type: '词根', meaning: '看', example: 'visible 可见的' },
  { word: 'aud', type: '词根', meaning: '听', example: 'audience 听众' },
  { word: 'struct', type: '词根', meaning: '建造', example: 'structure 结构' },
  { word: 'ject', type: '词根', meaning: '投、掷', example: 'reject 拒绝' },
  { word: 'rupt', type: '词根', meaning: '破', example: 'interrupt 打断' },
  { word: 'spect', type: '词根', meaning: '看', example: 'inspect 检查' },
  { word: 'mit', type: '词根', meaning: '送', example: 'submit 提交' },
  { word: 'cred', type: '词根', meaning: '相信', example: 'credit 信用' },
  { word: 'chron', type: '词根', meaning: '时间', example: 'chronology 年代学' },
  { word: 'phil', type: '词根', meaning: '爱', example: 'philosophy 哲学' },
  { word: '-able', type: '词缀', meaning: '能…的', example: 'readable 可读的' },
  { word: '-ible', type: '词缀', meaning: '能…的', example: 'visible 可见的' },
  { word: '-ful', type: '词缀', meaning: '充满…的', example: 'beautiful 美丽的' },
  { word: '-less', type: '词缀', meaning: '无…的', example: 'careless 粗心的' },
  { word: '-tion', type: '词缀', meaning: '行为、状态', example: 'action 行动' },
  { word: '-ment', type: '词缀', meaning: '行为、结果', example: 'movement 运动' },
  { word: '-ness', type: '词缀', meaning: '性质、状态', example: 'happiness 幸福' },
  { word: '-ity', type: '词缀', meaning: '性质', example: 'ability 能力' },
  { word: '-er', type: '词缀', meaning: '人/物', example: 'worker 工人' },
  { word: '-or', type: '词缀', meaning: '人/物', example: 'actor 演员' },
  { word: '-ist', type: '词缀', meaning: '…家', example: 'artist 艺术家' },
  { word: 'un-', type: '词缀', meaning: '不、未', example: 'unhappy 不快乐的' },
  { word: 're-', type: '词缀', meaning: '再、回', example: 'return 返回' },
  { word: 'pre-', type: '词缀', meaning: '前、先', example: 'preview 预习' },
  { word: 'post-', type: '词缀', meaning: '后', example: 'postwar 战后的' },
  { word: 'dis-', type: '词缀', meaning: '不、分开', example: 'disagree 不同意' },
  { word: 'mis-', type: '词缀', meaning: '误', example: 'misunderstand 误解' },
  { word: 'inter-', type: '词缀', meaning: '在…之间', example: 'international 国际的' },
  { word: 'trans-', type: '词缀', meaning: '跨、转', example: 'transport 运输' },
  { word: 'sub-', type: '词缀', meaning: '下', example: 'subway 地铁' },
  { word: 'anti-', type: '词缀', meaning: '反', example: 'antivirus 杀毒' },
  { word: 'ex-', type: '词缀', meaning: '出、前', example: 'export 出口' },
  { word: 'in-', type: '词缀', meaning: '入、不', example: 'include 包含' },
  { word: 'im-', type: '词缀', meaning: '入、不', example: 'import 进口' },
  { word: 'con-', type: '词缀', meaning: '共同', example: 'connect 连接' },
  { word: 'com-', type: '词缀', meaning: '共同', example: 'combine 结合' },
  { word: 'de-', type: '词缀', meaning: '去掉、下', example: 'decrease 减少' },
  { word: 'en-', type: '词缀', meaning: '使…', example: 'enable 使能够' },
  { word: '-ize', type: '词缀', meaning: '使…化', example: 'realize 实现' },
  { word: '-ify', type: '词缀', meaning: '使…化', example: 'simplify 简化' },
  { word: '-en', type: '词缀', meaning: '使…', example: 'widen 加宽' }
];

export function getRootsAffixesList() {
  return ROOTS_AFFIXES.map((item, i) => ({ ...item, id: `ra-${i}-${(item.word || '').slice(0, 5)}` }));
}

export function saveRootsAffixesList(list) {
  // 不再保存到 localStorage
}

export function searchRootsAffixes(keyword, list) {
  const data = list ?? getRootsAffixesList();
  const q = (keyword || '').trim().toLowerCase();
  if (!q) return [];
  return data.filter(
    (item) =>
      (item.word && item.word.toLowerCase().includes(q)) ||
      (item.meaning && item.meaning.includes(q)) ||
      (item.example && item.example.toLowerCase().includes(q))
  );
}

/**
 * 根据当前输入的单词，匹配其中包含的词根/词缀
 * 词缀 -xxx 匹配单词结尾，词缀 xxx- 匹配单词开头，词根匹配单词内任意位置
 */
export function matchRootsAffixesInWord(inputWord, list) {
  const data = list ?? getRootsAffixesList();
  const w = (inputWord || '').trim().toLowerCase();
  if (w.length < 2) return [];
  return data.filter((item) => {
    const raw = (item.word || '').trim();
    if (!raw) return false;
    if (raw.startsWith('-')) {
      const suffix = raw.slice(1).toLowerCase();
      return suffix.length > 0 && w.endsWith(suffix);
    }
    if (raw.endsWith('-')) {
      const prefix = raw.slice(0, -1).toLowerCase();
      return prefix.length > 0 && w.startsWith(prefix);
    }
    return w.includes(raw.toLowerCase());
  });
}
