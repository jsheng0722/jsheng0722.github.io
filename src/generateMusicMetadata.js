const fs = require('fs');
const path = require('path');

/**
 * 音乐元数据自动生成工具
 * 扫描 public/music/music list/ 文件夹中的音乐文件
 * 自动生成或更新 musicList.json 和各个歌曲的 metadata.json
 */

const MUSIC_LIST_DIR = path.join(__dirname, '../public/music/music list');
const MUSIC_LIST_JSON = path.join(__dirname, '../public/music/musicList.json');

// 支持的音频格式
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.flac'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

/**
 * 扫描音乐文件夹
 */
function scanMusicFolders() {
  const musicList = [];
  let musicId = 1;

  try {
    const folders = fs.readdirSync(MUSIC_LIST_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`\n找到 ${folders.length} 个音乐文件夹\n`);

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

      // 查找或创建 metadata.json
      const metadataPath = path.join(folderPath, 'metadata.json');
      let metadata = {
        title: folderName,
        artist: '未知艺术家',
        album: '未知专辑',
        year: new Date().getFullYear().toString(),
        genre: '未分类',
        duration: '未知',
        durationSeconds: 0,
        language: '中文',
        tags: [],
        description: ''
      };

      if (fs.existsSync(metadataPath)) {
        try {
          const existingMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          metadata = { ...metadata, ...existingMetadata };
        } catch (error) {
          console.log(`⚠️  ${folderName}: metadata.json 格式错误，使用默认值`);
        }
      } else {
        // 创建 metadata.json
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
        console.log(`✅ ${folderName}: 创建 metadata.json`);
      }

      // 检查歌词文件
      const lyricsFile = files.find(file => file.endsWith('.lrc'));
      const hasLyrics = !!lyricsFile;

      // 检查时间戳文件
      const timestampsFile = files.find(file => file === 'timestamps.json');
      const hasTimestamps = !!timestampsFile;

      // 创建默认的 lyrics.lrc 文件（如果不存在）
      const lyricsPath = path.join(folderPath, 'lyrics.lrc');
      if (!hasLyrics) {
        const defaultLyrics = `[ti:${metadata.title}]
[ar:${metadata.artist}]
[al:${metadata.album}]
[by:自动生成]
[00:00.00]${metadata.title} - ${metadata.artist}
[00:05.00]
[00:10.00]请添加歌词内容
[00:15.00]格式: [时间]歌词文本
[00:20.00]
`;
        fs.writeFileSync(lyricsPath, defaultLyrics, 'utf8');
        console.log(`✅ ${folderName}: 创建 lyrics.lrc 模板`);
      }

      // 创建默认的 timestamps.json 文件（如果不存在）
      const timestampsPath = path.join(folderPath, 'timestamps.json');
      if (!hasTimestamps) {
        const defaultTimestamps = {
          structure: {
            intro: { start: 0, end: 15, label: "前奏" },
            verse1: { start: 15, end: 45, label: "第一段" },
            chorus: { start: 45, end: 75, label: "副歌" },
            outro: { start: 135, end: 150, label: "尾奏" }
          },
          highlights: []
        };
        fs.writeFileSync(timestampsPath, JSON.stringify(defaultTimestamps, null, 2), 'utf8');
        console.log(`✅ ${folderName}: 创建 timestamps.json 模板`);
      }

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
        hasLyrics: hasLyrics || true,
        hasCover: !!coverFile,
        hasTimestamps: hasTimestamps || true
      };

      musicList.push(musicEntry);
      console.log(`✅ ${folderName}: 添加到音乐列表`);
      console.log(`   音频: ${audioFile}`);
      console.log(`   封面: ${coverFile || '无（使用默认）'}`);
      console.log(`   歌词: ${hasLyrics ? lyricsFile : 'lyrics.lrc (已创建模板)'}`);
      console.log('');
    });

    // 保存 musicList.json
    fs.writeFileSync(MUSIC_LIST_JSON, JSON.stringify(musicList, null, 2), 'utf8');
    console.log(`\n✅ 成功生成 musicList.json (${musicList.length} 首音乐)\n`);
    console.log(`输出路径: ${MUSIC_LIST_JSON}\n`);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('\n=================================');
  console.log('  音乐元数据自动生成工具');
  console.log('=================================\n');
  console.log(`扫描目录: ${MUSIC_LIST_DIR}\n`);

  if (!fs.existsSync(MUSIC_LIST_DIR)) {
    console.error(`❌ 错误: 目录不存在: ${MUSIC_LIST_DIR}`);
    process.exit(1);
  }

  scanMusicFolders();

  console.log('=================================');
  console.log('  处理完成！');
  console.log('=================================\n');
  console.log('下一步操作:');
  console.log('1. 检查生成的 musicList.json 文件');
  console.log('2. 编辑各个歌曲的 metadata.json 完善信息');
  console.log('3. 编辑 lyrics.lrc 添加歌词内容');
  console.log('4. 刷新浏览器页面查看效果\n');
}

// 运行脚本
main();
