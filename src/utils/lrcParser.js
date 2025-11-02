// LRC歌词解析器

/**
 * 解析LRC格式的歌词文件
 * @param {string} lrcContent - LRC文件内容
 * @returns {Object} 解析后的歌词对象
 */
export const parseLRC = (lrcContent) => {
  if (!lrcContent) return { metadata: {}, lyrics: [] };

  const lines = lrcContent.split('\n');
  const metadata = {};
  const lyrics = [];

  lines.forEach(line => {
    line = line.trim();
    if (!line) return;

    // 解析元数据标签 [ti:标题] [ar:艺术家] [al:专辑] 等
    const metaMatch = line.match(/\[(\w+):([^\]]*)\]/);
    if (metaMatch && !line.match(/\[\d+:\d+/)) {
      metadata[metaMatch[1]] = metaMatch[2].trim();
      return;
    }

    // 解析时间戳歌词 [00:12.34]歌词内容
    const timeMatch = line.match(/\[(\d+):(\d+)\.?(\d+)?\]/g);
    if (timeMatch) {
      const text = line.replace(/\[(\d+):(\d+)\.?(\d+)?\]/g, '').trim();
      
      timeMatch.forEach(timeTag => {
        const match = timeTag.match(/\[(\d+):(\d+)\.?(\d+)?\]/);
        if (match) {
          const minutes = parseInt(match[1]);
          const seconds = parseInt(match[2]);
          const milliseconds = match[3] ? parseInt(match[3].padEnd(2, '0')) : 0;
          const time = minutes * 60 + seconds + milliseconds / 100;

          lyrics.push({
            time,
            text: text || ''
          });
        }
      });
    }
  });

  // 按时间排序
  lyrics.sort((a, b) => a.time - b.time);

  return { metadata, lyrics };
};

/**
 * 根据当前时间获取应该显示的歌词
 * @param {Array} lyrics - 歌词数组
 * @param {number} currentTime - 当前播放时间
 * @returns {Object} 当前歌词信息
 */
export const getCurrentLyric = (lyrics, currentTime) => {
  if (!lyrics || lyrics.length === 0) {
    return { index: -1, text: '', prevText: '', nextText: '' };
  }

  let currentIndex = -1;
  
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      currentIndex = i;
    } else {
      break;
    }
  }

  return {
    index: currentIndex,
    text: currentIndex >= 0 ? lyrics[currentIndex].text : '',
    prevText: currentIndex > 0 ? lyrics[currentIndex - 1].text : '',
    nextText: currentIndex < lyrics.length - 1 ? lyrics[currentIndex + 1].text : ''
  };
};

/**
 * 格式化时间为 MM:SS 格式
 * @param {number} time - 时间（秒）
 * @returns {string} 格式化的时间
 */
export const formatLyricTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * 生成LRC格式的歌词内容
 * @param {Object} metadata - 元数据
 * @param {Array} lyrics - 歌词数组
 * @returns {string} LRC格式的歌词
 */
export const generateLRC = (metadata, lyrics) => {
  let lrcContent = '';

  // 添加元数据
  if (metadata.ti) lrcContent += `[ti:${metadata.ti}]\n`;
  if (metadata.ar) lrcContent += `[ar:${metadata.ar}]\n`;
  if (metadata.al) lrcContent += `[al:${metadata.al}]\n`;
  if (metadata.by) lrcContent += `[by:${metadata.by}]\n`;
  lrcContent += '\n';

  // 添加歌词
  lyrics.forEach(lyric => {
    const minutes = Math.floor(lyric.time / 60);
    const seconds = lyric.time % 60;
    const timeTag = `[${minutes.toString().padStart(2, '0')}:${seconds.toFixed(2).padStart(5, '0')}]`;
    lrcContent += `${timeTag}${lyric.text}\n`;
  });

  return lrcContent;
};
