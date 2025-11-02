/**
 * 音频歌词自动识别生成器
 * 使用Web Speech API识别音频中的歌词并生成LRC格式文件
 */

class AudioLyricsGenerator {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.startTime = null;
    this.lyricsData = [];
    this.audioElement = null;
    this.isSupported = false;
    
    this.initializeSpeechRecognition();
  }

  /**
   * 初始化语音识别
   */
  initializeSpeechRecognition() {
    // 检查浏览器支持
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      // 配置语音识别
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'zh-CN'; // 中文识别
      this.recognition.maxAlternatives = 1;
      
      // 绑定事件
      this.recognition.onstart = this.onRecognitionStart.bind(this);
      this.recognition.onresult = this.onRecognitionResult.bind(this);
      this.recognition.onerror = this.onRecognitionError.bind(this);
      this.recognition.onend = this.onRecognitionEnd.bind(this);
      
      this.isSupported = true;
      console.log('✅ 语音识别已初始化');
    } else {
      console.error('❌ 浏览器不支持语音识别');
      this.isSupported = false;
    }
  }

  /**
   * 开始识别音频中的歌词
   */
  async startLyricsRecognition(audioFile, options = {}) {
    if (!this.isSupported) {
      throw new Error('浏览器不支持语音识别功能');
    }

    return new Promise((resolve, reject) => {
      this.lyricsData = [];
      this.startTime = Date.now();
      
      // 创建音频元素
      this.audioElement = new Audio();
      this.audioElement.src = audioFile;
      this.audioElement.controls = true;
      
      // 设置音频事件
      this.audioElement.onloadstart = () => {
        console.log('🎵 开始加载音频文件');
      };
      
      this.audioElement.oncanplay = () => {
        console.log('🎵 音频可以播放，开始识别');
        this.startRecognition();
      };
      
      this.audioElement.onended = () => {
        console.log('🎵 音频播放结束');
        this.stopRecognition();
        const lrcContent = this.generateLRC(options);
        resolve(lrcContent);
      };
      
      this.audioElement.onerror = (error) => {
        console.error('❌ 音频加载失败:', error);
        reject(error);
      };
      
      // 开始加载音频
      this.audioElement.load();
    });
  }

  /**
   * 开始语音识别
   */
  startRecognition() {
    if (this.isRecording) {
      console.log('⚠️ 语音识别已在进行中');
      return;
    }

    try {
      this.isRecording = true;
      this.recognition.start();
      console.log('🎤 开始语音识别...');
    } catch (error) {
      console.error('❌ 启动语音识别失败:', error);
      this.isRecording = false;
    }
  }

  /**
   * 停止语音识别
   */
  stopRecognition() {
    if (this.isRecording && this.recognition) {
      this.recognition.stop();
      this.isRecording = false;
      console.log('🛑 停止语音识别');
    }
  }

  /**
   * 语音识别开始事件
   */
  onRecognitionStart() {
    console.log('🎤 语音识别已开始');
    // 同时开始播放音频
    if (this.audioElement) {
      this.audioElement.play().catch(error => {
        console.error('❌ 音频播放失败:', error);
      });
    }
  }

  /**
   * 语音识别结果事件
   */
  onRecognitionResult(event) {
    const currentTime = Date.now();
    const elapsedTime = (currentTime - this.startTime) / 1000; // 转换为秒

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript.trim();
      const confidence = result[0].confidence;
      
      // 只处理最终结果，忽略中间结果
      if (result.isFinal && transcript.length > 0) {
        console.log(`📝 [${this.formatTime(elapsedTime)}] ${transcript} (置信度: ${(confidence * 100).toFixed(1)}%)`);
        
        this.lyricsData.push({
          time: elapsedTime,
          text: transcript,
          confidence: confidence
        });
      }
    }
  }

  /**
   * 语音识别错误事件
   */
  onRecognitionError(event) {
    console.error('❌ 语音识别错误:', event.error);
    
    // 根据错误类型决定是否重试
    if (event.error === 'network') {
      console.log('🔄 网络错误，尝试重新开始识别');
      setTimeout(() => {
        if (this.isRecording) {
          this.startRecognition();
        }
      }, 1000);
    }
  }

  /**
   * 语音识别结束事件
   */
  onRecognitionEnd() {
    console.log('🏁 语音识别结束');
    this.isRecording = false;
    
    // 如果音频还在播放，继续识别
    if (this.audioElement && !this.audioElement.ended) {
      setTimeout(() => {
        this.startRecognition();
      }, 100);
    }
  }

  /**
   * 格式化时间为LRC格式
   */
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const centisecs = Math.floor((seconds % 1) * 100);
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centisecs.toString().padStart(2, '0')}`;
  }

  /**
   * 生成LRC格式的歌词
   */
  generateLRC(options = {}) {
    const title = options.title || '自动识别';
    const artist = options.artist || '未知艺术家';
    const album = options.album || '未知专辑';
    
    let lrcContent = `[ti:${title}]\n`;
    lrcContent += `[ar:${artist}]\n`;
    lrcContent += `[al:${album}]\n`;
    lrcContent += `[by:语音识别生成]\n`;
    lrcContent += `[00:00.00]${title} - ${artist}\n`;
    lrcContent += `\n`;
    
    // 添加识别到的歌词
    this.lyricsData.forEach(item => {
      const timeTag = `[${this.formatTime(item.time)}]`;
      lrcContent += `${timeTag}${item.text}\n`;
    });
    
    // 添加结束标记
    if (this.audioElement) {
      const duration = this.audioElement.duration;
      if (duration && !isNaN(duration)) {
        lrcContent += `\n[${this.formatTime(duration)}]`;
      }
    }
    
    return lrcContent;
  }

  /**
   * 获取识别统计信息
   */
  getRecognitionStats() {
    const totalWords = this.lyricsData.reduce((sum, item) => sum + item.text.length, 0);
    const avgConfidence = this.lyricsData.length > 0 
      ? this.lyricsData.reduce((sum, item) => sum + item.confidence, 0) / this.lyricsData.length
      : 0;
    
    return {
      totalSegments: this.lyricsData.length,
      totalWords: totalWords,
      averageConfidence: avgConfidence,
      duration: this.audioElement ? this.audioElement.duration : 0
    };
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.stopRecognition();
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
    this.lyricsData = [];
  }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioLyricsGenerator;
} else {
  window.AudioLyricsGenerator = AudioLyricsGenerator;
}
