# 音乐元数据自动生成指南

## 🚀 快速开始

### 简单三步，完成音乐配置！

#### 步骤1: 放置音乐文件
```bash
public/music/music list/
└── [创建歌曲文件夹]/
    └── 音乐文件.mp3
```

例如：
```bash
public/music/music list/
└── 童话镇/
    └── 童话镇.mp3
```

#### 步骤2: 运行自动生成脚本
```bash
npm run generate-music-metadata
```

#### 步骤3: 完善信息
编辑自动生成的 `metadata.json` 文件，填写正确的歌曲信息。

## 🎯 自动生成工具功能

### 自动扫描
- ✅ 扫描 `music list/` 目录下的所有文件夹
- ✅ 识别音频文件（MP3, WAV, OGG, AAC等）
- ✅ 识别封面图片（JPG, PNG, WEBP等）
- ✅ 检查歌词和时间戳文件

### 自动创建
- ✅ **metadata.json** - 元数据模板
- ✅ **lyrics.lrc** - 歌词文件模板
- ✅ **timestamps.json** - 时间戳模板
- ✅ **musicList.json** - 音乐列表配置

### 自动配置
- ✅ 正确的文件路径
- ✅ 封面图片链接
- ✅ 歌词文件关联
- ✅ 默认元数据值

## 📝 详细使用说明

### 添加单首歌曲

1. **创建文件夹**：
   ```bash
   mkdir "public/music/music list/歌曲名称"
   ```

2. **放置文件**：
   - 音频文件（必需）：任意MP3文件
   - 封面图片（可选）：cover.jpg 或其他图片
   
3. **运行脚本**：
   ```bash
   npm run generate-music-metadata
   ```

4. **完善信息**：
   编辑生成的 `metadata.json` 文件

### 批量添加歌曲

1. **创建多个文件夹**：
   ```bash
   music list/
   ├── 歌曲1/
   │   └── 歌曲1.mp3
   ├── 歌曲2/
   │   ├── 歌曲2.mp3
   │   └── cover.jpg
   └── 歌曲3/
       └── 歌曲3.mp3
   ```

2. **运行脚本**：
   ```bash
   npm run generate-music-metadata
   ```

3. **批量编辑**：
   逐个编辑各文件夹中的 `metadata.json`

## 🔧 生成的文件

### metadata.json (每个歌曲文件夹)
```json
{
  "title": "歌曲名称",
  "artist": "未知艺术家",
  "album": "未知专辑",
  "year": "2024",
  "genre": "未分类",
  "duration": "未知",
  "durationSeconds": 0,
  "language": "中文",
  "tags": [],
  "description": ""
}
```

### lyrics.lrc (每个歌曲文件夹)
```lrc
[ti:歌曲名称]
[ar:未知艺术家]
[al:未知专辑]
[by:自动生成]
[00:00.00]歌曲名称 - 未知艺术家
[00:05.00]
[00:10.00]请添加歌词内容
```

### timestamps.json (每个歌曲文件夹)
```json
{
  "structure": {
    "intro": { "start": 0, "end": 15, "label": "前奏" },
    "verse1": { "start": 15, "end": 45, "label": "第一段" },
    "chorus": { "start": 45, "end": 75, "label": "副歌" }
  },
  "highlights": []
}
```

### musicList.json (根目录)
自动生成完整的音乐列表配置文件。

## 💡 工作流程示例

### 场景：添加新歌曲"告白气球"

1. **创建文件夹**：
   ```bash
   mkdir "public/music/music list/告白气球"
   ```

2. **放置文件**：
   ```bash
   public/music/music list/告白气球/
   ├── 告白气球.mp3     # 从音乐库复制
   └── cover.jpg        # 从网上下载的封面
   ```

3. **运行生成脚本**：
   ```bash
   npm run generate-music-metadata
   ```

4. **查看结果**：
   ```bash
   public/music/music list/告白气球/
   ├── 告白气球.mp3
   ├── cover.jpg
   ├── metadata.json      # ✅ 自动生成
   ├── lyrics.lrc         # ✅ 自动生成
   └── timestamps.json    # ✅ 自动生成
   ```

5. **完善信息**：
   编辑 `metadata.json`：
   ```json
   {
     "title": "告白气球",
     "artist": "周杰伦",
     "album": "周杰伦的床边故事",
     "year": "2016",
     "genre": "流行",
     ...
   }
   ```

6. **添加歌词**：
   编辑 `lyrics.lrc`，从歌词网站复制LRC歌词

7. **刷新页面**：
   在音乐页面点击"刷新列表"或刷新浏览器

## 🎵 脚本输出示例

```
=================================
  音乐元数据自动生成工具
=================================

扫描目录: C:\...\public\music\music list

找到 2 个音乐文件夹

✅ M500001ASMC447Mslm: 添加到音乐列表
   音频: M500001ASMC447Mslm.mp3
   封面: th.jpg
   歌词: lyrics.lrc

✅ 告白气球: 添加到音乐列表
   音频: 告白气球.mp3
   封面: cover.jpg
   歌词: lyrics.lrc (已创建模板)

✅ 成功生成 musicList.json (2 首音乐)

=================================
  处理完成！
=================================

下一步操作:
1. 检查生成的 musicList.json 文件
2. 编辑各个歌曲的 metadata.json 完善信息
3. 编辑 lyrics.lrc 添加歌词内容
4. 刷新浏览器页面查看效果
```

## 📋 支持的文件格式

### 音频文件
- .mp3 (推荐)
- .wav
- .ogg
- .aac
- .m4a
- .flac

### 封面图片
- .jpg / .jpeg (推荐)
- .png
- .webp
- .gif

## ⚙️ 高级选项

### 保留现有数据
如果 `metadata.json` 已存在，脚本会保留已填写的信息，只更新缺失的字段。

### 自定义文件夹名
文件夹名可以是：
- 歌曲名（推荐）
- 歌曲ID
- 拼音
- 英文名

### 批量处理
可以一次性处理多个歌曲文件夹。

## 🔍 故障排除

### 脚本运行失败
1. 确认 Node.js 已安装
2. 检查路径是否正确
3. 确认有文件读写权限

### 找不到音频文件
1. 确认文件扩展名正确
2. 检查文件是否在文件夹中
3. 验证文件格式是否支持

### 生成的数据不正确
1. 手动编辑 metadata.json
2. 重新运行脚本
3. 检查文件夹结构

## 💡 最佳实践

1. **先放文件，再运行脚本**
2. **使用有意义的文件夹名**
3. **封面图片使用正方形**
4. **运行后立即完善元数据**
5. **添加准确的歌词时间戳**

## 🎊 总结

使用自动生成工具，您只需要：
1. ✅ 创建文件夹
2. ✅ 放置MP3文件
3. ✅ 运行一条命令

所有配置文件自动生成！大大简化了添加音乐的流程！🎵✨
