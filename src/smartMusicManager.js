const fs = require('fs');
const path = require('path');
const { generateLyricsForNewMusic } = require('./autoLyricsGenerator');

/**
 * 智能音乐管理器
 * 自动为新添加的音乐文件生成完整的元数据和歌词
 */

const MUSIC_LIST_DIR = path.join(__dirname, '../public/music/music list');
const MUSIC_LIST_JSON = path.join(__dirname, '../public/music/musicList.json');

// 支持的音频格式
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.flac'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

/**
 * 从文件名提取歌曲信息
 */
function extractInfoFromFileName(fileName) {
  // 移除扩展名
  const nameWithoutExt = path.parse(fileName).name;
  
  // 常见的分隔符模式
  const patterns = [
    /^(.+?)\s*-\s*(.+?)$/,  // "歌手 - 歌曲名"
    /^(.+?)\s*_\s*(.+?)$/,  // "歌手_歌曲名"
    /^(.+?)\s*\.\s*(.+?)$/, // "歌手.歌曲名"
  ];
  
  for (const pattern of patterns) {
    const match = nameWithoutExt.match(pattern);
    if (match) {
      return {
        artist: match[1].trim(),
        title: match[2].trim()
      };
    }
  }
  
  // 如果没有匹配到模式，整个文件名作为歌曲名
  return {
    artist: '未知艺术家',
    title: nameWithoutExt
  };
}

/**
 * 创建音乐文件夹结构
 */
async function createMusicFolder(audioFile) {
  const fileName = path.parse(audioFile).name;
  const folderPath = path.join(MUSIC_LIST_DIR, fileName);
  
  // 创建文件夹
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`✅ 创建文件夹: ${fileName}`);
  }
  
  // 移动音频文件到文件夹
  const sourcePath = path.join(MUSIC_LIST_DIR, audioFile);
  const targetPath = path.join(folderPath, audioFile);
  
  if (fs.existsSync(sourcePath)) {
    fs.renameSync(sourcePath, targetPath);
    console.log(`✅ 移动音频文件: ${audioFile}`);
  }
  
  return { folderPath, folderName: fileName };
}

/**
 * 生成封面图片（使用占位符）
 */
function generateCoverImage(folderPath, title) {
  const coverPath = path.join(folderPath, 'cover.jpg');
  
  // 创建一个简单的SVG封面
  const svgContent = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="300" height="300" fill="url(#grad1)"/>
    <text x="150" y="150" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${title}</text>
    <text x="150" y="180" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">🎵</text>
  </svg>`;
  
  // 注意：这里只是创建SVG，实际项目中可能需要转换为JPG
  const svgPath = path.join(folderPath, 'cover.svg');
  fs.writeFileSync(svgPath, svgContent, 'utf8');
  console.log(`✅ 创建封面文件: cover.svg`);
  
  return 'cover.svg';
}

/**
 * 生成完整的音乐元数据
 */
function generateMetadata(folderName, audioFile, coverFile) {
  const info = extractInfoFromFileName(audioFile);
  
  const metadata = {
    title: info.title,
    artist: info.artist,
    album: '未知专辑',
    year: new Date().getFullYear().toString(),
    genre: '未分类',
    duration: '未知',
    durationSeconds: 0,
    language: '中文',
    tags: [],
    description: `自动生成的音乐文件: ${info.title}`,
    created: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
  
  const metadataPath = path.join(MUSIC_LIST_DIR, folderName, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  console.log(`✅ 创建元数据文件: metadata.json`);
  
  return metadata;
}

/**
 * 生成时间戳文件
 */
function generateTimestamps(folderPath) {
  const timestamps = {
    structure: {
      intro: { start: 0, end: 15, label: "前奏" },
      verse1: { start: 15, end: 45, label: "第一段" },
      chorus: { start: 45, end: 75, label: "副歌" },
      verse2: { start: 75, end: 105, label: "第二段" },
      chorus2: { start: 105, end: 135, label: "副歌" },
      outro: { start: 135, end: 150, label: "尾奏" }
    },
    highlights: [],
    notes: "请根据实际歌曲调整时间戳"
  };
  
  const timestampsPath = path.join(folderPath, 'timestamps.json');
  fs.writeFileSync(timestampsPath, JSON.stringify(timestamps, null, 2), 'utf8');
  console.log(`✅ 创建时间戳文件: timestamps.json`);
}

/**
 * 更新音乐列表
 */
function updateMusicList() {
  const musicList = [];
  let musicId = 1;

  try {
    const folders = fs.readdirSync(MUSIC_LIST_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    folders.forEach(folderName => {
      const folderPath = path.join(MUSIC_LIST_DIR, folderName);
      const files = fs.readdirSync(folderPath);

      // 查找音频文件
      const audioFile = files.find(file => 
        AUDIO_EXTENSIONS.includes(path.extname(file).toLowerCase())
      );

      if (!audioFile) {
        console.log(`⚠️  ${folderName}: 未找到音频文件，跳过`);
        return;
      }

      // 查找封面图片
      const coverFile = files.find(file => 
        IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase())
      );

      // 读取metadata
      const metadataPath = path.join(folderPath, 'metadata.json');
      let metadata = {
        title: folderName,
        artist: '未知艺术家',
        album: '未知专辑',
        year: new Date().getFullYear().toString(),
        genre: '未分类',
        duration: '未知'
      };

      if (fs.existsSync(metadataPath)) {
        try {
          metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        } catch (error) {
          console.log(`⚠️  ${folderName}: metadata.json 格式错误，使用默认值`);
        }
      }

      // 检查歌词文件
      const lyricsFile = files.find(file => file.endsWith('.lrc'));
      const hasLyrics = !!lyricsFile;

      // 检查时间戳文件
      const timestampsFile = files.find(file => file === 'timestamps.json');
      const hasTimestamps = !!timestampsFile;

      // 构建音乐条目
      const musicEntry = {
        id: musicId++,
        folderName: folderName,
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album,
        duration: metadata.duration,
        genre: metadata.genre,
        year: metadata.year,
        audioFile: `/music/music list/${folderName}/${audioFile}`,
        coverFile: coverFile ? `/music/music list/${folderName}/${coverFile}` : null,
        lyricsFile: `/music/music list/${folderName}/lyrics.lrc`,
        metadataFile: `/music/music list/${folderName}/metadata.json`,
        timestampsFile: `/music/music list/${folderName}/timestamps.json`,
        cover: coverFile 
          ? `/music/music list/${folderName}/${coverFile}` 
          : 'https://via.placeholder.com/300x300/6366f1/ffffff?text=🎵',
        file: `/music/music list/${folderName}/${audioFile}`,
        liked: false,
        hasLyrics: hasLyrics,
        hasCover: !!coverFile,
        hasTimestamps: hasTimestamps
      };

      musicList.push(musicEntry);
      console.log(`✅ ${folderName}: 添加到音乐列表`);
    });

    // 保存 musicList.json
    fs.writeFileSync(MUSIC_LIST_JSON, JSON.stringify(musicList, null, 2), 'utf8');
    console.log(`\n✅ 成功更新 musicList.json (${musicList.length} 首音乐)\n`);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    throw error;
  }
}

/**
 * 为新添加的音乐文件创建完整的文件夹结构
 */
async function setupNewMusic(audioFileName) {
  console.log(`\n🎵 设置新音乐: ${audioFileName}\n`);
  
  try {
    // 1. 创建文件夹并移动音频文件
    const { folderPath, folderName } = await createMusicFolder(audioFileName);
    
    // 2. 生成封面图片
    const coverFile = generateCoverImage(folderPath, folderName);
    
    // 3. 生成元数据
    const metadata = generateMetadata(folderName, audioFileName, coverFile);
    
    // 4. 生成时间戳文件
    generateTimestamps(folderPath);
    
    // 5. 生成歌词文件
    console.log(`🔍 为 ${folderName} 生成歌词...`);
    await generateLyricsForNewMusic(folderName);
    
    // 6. 更新音乐列表
    updateMusicList();
    
    console.log(`\n✅ ${audioFileName} 设置完成！`);
    console.log(`📁 文件夹: ${folderName}`);
    console.log(`🎵 音频: ${audioFileName}`);
    console.log(`🖼️  封面: ${coverFile}`);
    console.log(`📝 歌词: lyrics.lrc`);
    console.log(`📊 元数据: metadata.json`);
    console.log(`⏱️  时间戳: timestamps.json`);
    
    return folderName;
    
  } catch (error) {
    console.error(`❌ 设置失败: ${error.message}`);
    throw error;
  }
}

/**
 * 扫描并处理所有未处理的音乐文件
 */
async function processAllNewMusic() {
  console.log('\n=================================');
  console.log('  智能音乐管理器');
  console.log('=================================\n');
  console.log(`扫描目录: ${MUSIC_LIST_DIR}\n`);

  if (!fs.existsSync(MUSIC_LIST_DIR)) {
    console.error(`❌ 错误: 目录不存在: ${MUSIC_LIST_DIR}`);
    process.exit(1);
  }

  try {
    const files = fs.readdirSync(MUSIC_LIST_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name);

    // 查找所有音频文件
    const audioFiles = files.filter(file => 
      AUDIO_EXTENSIONS.includes(path.extname(file).toLowerCase())
    );

    if (audioFiles.length === 0) {
      console.log('✅ 没有发现新的音乐文件需要处理');
      return;
    }

    console.log(`发现 ${audioFiles.length} 个新的音乐文件:\n`);
    audioFiles.forEach(file => console.log(`  - ${file}`));
    console.log('');

    // 处理每个音频文件
    for (const audioFile of audioFiles) {
      await setupNewMusic(audioFile);
      console.log('');
    }

    console.log('=================================');
    console.log('  所有音乐文件处理完成！');
    console.log('=================================\n');
    console.log('下一步操作:');
    console.log('1. 检查生成的歌词文件，编辑完善');
    console.log('2. 替换封面图片（可选）');
    console.log('3. 编辑元数据信息');
    console.log('4. 刷新浏览器页面查看效果\n');

  } catch (error) {
    console.error('❌ 处理失败:', error.message);
    process.exit(1);
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // 处理指定的音乐文件
    const audioFileName = args[0];
    await setupNewMusic(audioFileName);
  } else {
    // 处理所有新的音乐文件
    await processAllNewMusic();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  setupNewMusic,
  processAllNewMusic,
  updateMusicList,
  generateMetadata,
  generateTimestamps,
  generateCoverImage
};
