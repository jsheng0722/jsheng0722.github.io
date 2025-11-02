const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * 自动歌词生成工具
 * 为音乐文件夹中的歌曲自动生成或搜索歌词
 */

const MUSIC_LIST_DIR = path.join(__dirname, '../public/music/music list');

// 歌词API配置（这里使用一个公开的歌词API）
const LYRICS_API = {
  // 使用网易云音乐API（需要代理或国内服务器）
  netease: 'https://music.163.com/api/search/get/web',
  // 备用API
  backup: 'https://api.lyrics.ovh/v1'
};

/**
 * 搜索歌词
 */
async function searchLyrics(title, artist) {
  return new Promise((resolve, reject) => {
    // URL编码处理
    const encodedArtist = encodeURIComponent(artist);
    const encodedTitle = encodeURIComponent(title);
    
    // 使用一个简单的歌词搜索服务
    const options = {
      hostname: 'api.lyrics.ovh',
      port: 443,
      path: `/v1/${encodedArtist}/${encodedTitle}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.lyrics) {
            resolve(result.lyrics);
          } else {
            resolve(null);
          }
        } catch (error) {
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`⚠️  搜索歌词失败: ${error.message}`);
      resolve(null);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    });

    req.end();
  });
}

/**
 * 将普通歌词转换为LRC格式
 */
function convertToLRC(lyrics, title, artist) {
  if (!lyrics) return null;

  const lines = lyrics.split('\n');
  const lrcLines = [];
  
  // 添加LRC头部信息
  lrcLines.push(`[ti:${title}]`);
  lrcLines.push(`[ar:${artist}]`);
  lrcLines.push(`[al:未知专辑]`);
  lrcLines.push(`[by:自动生成]`);
  lrcLines.push(`[00:00.00]${title} - ${artist}`);
  lrcLines.push('');

  // 转换歌词行，添加时间戳
  let timeOffset = 5; // 从5秒开始
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine && trimmedLine.length > 0) {
      const minutes = Math.floor(timeOffset / 60);
      const seconds = Math.floor(timeOffset % 60);
      const milliseconds = Math.floor((timeOffset % 1) * 100);
      
      const timeTag = `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}]`;
      lrcLines.push(`${timeTag}${trimmedLine}`);
      
      // 根据歌词长度调整时间间隔
      timeOffset += Math.max(2, Math.min(6, trimmedLine.length * 0.3));
    }
  });

  return lrcLines.join('\n');
}

/**
 * 生成默认歌词模板
 */
function generateDefaultLyrics(title, artist) {
  return `[ti:${title}]
[ar:${artist}]
[al:未知专辑]
[by:自动生成]
[00:00.00]${title} - ${artist}
[00:05.00]
[00:10.00]请添加歌词内容
[00:15.00]格式: [时间]歌词文本
[00:20.00]
[00:25.00]示例:
[00:30.00][00:30.00]第一句歌词
[00:35.00][00:35.00]第二句歌词
[00:40.00]
[00:45.00]提示：
[00:50.00]1. 时间格式: [分:秒.百分秒]
[00:55.00]2. 每行一个时间标签
[01:00.00]3. 可以使用歌词编辑器修改
[01:05.00]
`;
}

/**
 * 处理单个音乐文件夹的歌词
 */
async function processMusicFolder(folderPath, folderName) {
  console.log(`\n🎵 处理文件夹: ${folderName}`);
  
  // 读取metadata.json
  const metadataPath = path.join(folderPath, 'metadata.json');
  let metadata = {};
  
  if (fs.existsSync(metadataPath)) {
    try {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    } catch (error) {
      console.log(`⚠️  ${folderName}: metadata.json 格式错误`);
      return;
    }
  } else {
    console.log(`⚠️  ${folderName}: 未找到 metadata.json，跳过`);
    return;
  }

  const title = metadata.title || folderName;
  const artist = metadata.artist || '未知艺术家';
  
  // 检查是否已存在歌词文件
  const lyricsPath = path.join(folderPath, 'lyrics.lrc');
  const hasExistingLyrics = fs.existsSync(lyricsPath);
  
  if (hasExistingLyrics) {
    console.log(`✅ ${folderName}: 已存在歌词文件，跳过`);
    return;
  }

  console.log(`🔍 ${folderName}: 搜索歌词 "${title}" - "${artist}"`);
  
  // 尝试搜索歌词
  const lyrics = await searchLyrics(title, artist);
  
  let finalLyrics;
  if (lyrics) {
    console.log(`✅ ${folderName}: 找到歌词，转换为LRC格式`);
    finalLyrics = convertToLRC(lyrics, title, artist);
  } else {
    console.log(`⚠️  ${folderName}: 未找到歌词，生成模板`);
    finalLyrics = generateDefaultLyrics(title, artist);
  }
  
  // 保存歌词文件
  try {
    fs.writeFileSync(lyricsPath, finalLyrics, 'utf8');
    console.log(`✅ ${folderName}: 歌词文件已生成`);
  } catch (error) {
    console.log(`❌ ${folderName}: 保存歌词文件失败 - ${error.message}`);
  }
}

/**
 * 扫描所有音乐文件夹并生成歌词
 */
async function generateAllLyrics() {
  try {
    const folders = fs.readdirSync(MUSIC_LIST_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`\n找到 ${folders.length} 个音乐文件夹\n`);

    for (const folderName of folders) {
      const folderPath = path.join(MUSIC_LIST_DIR, folderName);
      await processMusicFolder(folderPath, folderName);
      
      // 添加延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n✅ 所有歌词文件处理完成！\n');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

/**
 * 为新添加的音乐文件生成歌词
 */
async function generateLyricsForNewMusic(folderName) {
  const folderPath = path.join(MUSIC_LIST_DIR, folderName);
  
  if (!fs.existsSync(folderPath)) {
    console.log(`❌ 文件夹不存在: ${folderPath}`);
    return;
  }

  await processMusicFolder(folderPath, folderName);
}

/**
 * 主函数
 */
async function main() {
  console.log('\n=================================');
  console.log('  自动歌词生成工具');
  console.log('=================================\n');
  console.log(`扫描目录: ${MUSIC_LIST_DIR}\n`);

  if (!fs.existsSync(MUSIC_LIST_DIR)) {
    console.error(`❌ 错误: 目录不存在: ${MUSIC_LIST_DIR}`);
    process.exit(1);
  }

  // 检查命令行参数
  const args = process.argv.slice(2);
  if (args.length > 0) {
    // 为指定文件夹生成歌词
    const folderName = args[0];
    await generateLyricsForNewMusic(folderName);
  } else {
    // 为所有文件夹生成歌词
    await generateAllLyrics();
  }

  console.log('=================================');
  console.log('  处理完成！');
  console.log('=================================\n');
  console.log('下一步操作:');
  console.log('1. 检查生成的 lyrics.lrc 文件');
  console.log('2. 编辑歌词文件完善时间戳和内容');
  console.log('3. 刷新浏览器页面查看效果\n');
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateAllLyrics,
  generateLyricsForNewMusic,
  searchLyrics,
  convertToLRC,
  generateDefaultLyrics
};
