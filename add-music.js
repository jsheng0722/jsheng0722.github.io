#!/usr/bin/env node

/**
 * 添加音乐脚本
 * 使用方法:
 * node add-music.js [音频文件名]
 * 
 * 示例:
 * node add-music.js "新歌曲.mp3"
 * node add-music.js  # 处理所有未处理的音频文件
 */

const { setupNewMusic, processAllNewMusic } = require('./src/smartMusicManager');

async function main() {
  const args = process.argv.slice(2);
  
  console.log('\n🎵 智能音乐添加工具');
  console.log('================================\n');
  
  if (args.length > 0) {
    // 处理指定的音乐文件
    const audioFileName = args[0];
    
    if (!audioFileName) {
      console.error('❌ 请提供音频文件名');
      console.log('使用方法: node add-music.js "歌曲名.mp3"');
      process.exit(1);
    }
    
    try {
      await setupNewMusic(audioFileName);
      console.log('\n🎉 音乐添加成功！');
    } catch (error) {
      console.error('\n❌ 添加失败:', error.message);
      process.exit(1);
    }
  } else {
    // 处理所有新的音乐文件
    try {
      await processAllNewMusic();
      console.log('\n🎉 所有音乐处理完成！');
    } catch (error) {
      console.error('\n❌ 处理失败:', error.message);
      process.exit(1);
    }
  }
  
  console.log('\n💡 提示:');
  console.log('- 检查生成的歌词文件，根据需要编辑');
  console.log('- 可以替换自动生成的封面图片');
  console.log('- 编辑 metadata.json 完善歌曲信息');
  console.log('- 刷新浏览器页面查看效果\n');
}

main().catch(console.error);
