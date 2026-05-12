# 音乐文件夹结构设计

## 📁 新的文件夹结构

```
public/music/
├── README.md                    # 总体说明文档
├── musicList.json              # 音乐列表配置文件
└── music list/                 # 音乐库根目录
    ├── [歌曲1]/                # 每首歌一个独立文件夹
    │   ├── audio.mp3           # 音频文件（主文件）
    │   ├── cover.jpg           # 封面图片
    │   ├── lyrics.lrc          # 歌词文件（LRC格式）
    │   ├── metadata.json       # 元数据信息
    │   └── timestamps.json     # 时间戳信息
    ├── [歌曲2]/
    │   ├── audio.mp3
    │   ├── cover.jpg
    │   ├── lyrics.lrc
    │   ├── metadata.json
    │   └── timestamps.json
    └── ...
```

## 📝 文件说明

### 1. audio.mp3 (必需)
- **用途**: 音频文件
- **格式**: MP3, WAV, OGG, AAC
- **命名**: 固定为 `audio.mp3` 或对应格式名
- **大小**: 建议不超过 10MB

### 2. cover.jpg (可选)
- **用途**: 歌曲封面图片
- **格式**: JPG, PNG, WEBP
- **尺寸**: 建议 300x300 或更大
- **命名**: 固定为 `cover.jpg`

### 3. lyrics.lrc (可选)
- **用途**: 歌词文件
- **格式**: LRC（歌词时间轴格式）
- **示例**:
```lrc
[00:00.00]歌曲名 - 艺术家
[00:15.50]第一句歌词
[00:20.00]第二句歌词
```

### 4. metadata.json (必需)
- **用途**: 歌曲元数据信息
- **内容**:
```json
{
  "title": "歌曲标题",
  "artist": "艺术家名称",
  "album": "专辑名称",
  "year": "2024",
  "genre": "流行",
  "duration": "3:45",
  "durationSeconds": 225,
  "language": "中文",
  "tags": ["流行", "抒情"],
  "description": "歌曲描述"
}
```

### 5. timestamps.json (可选)
- **用途**: 歌曲特殊时间点标记
- **内容**:
```json
{
  "intro": { "start": 0, "end": 15 },
  "verse1": { "start": 15, "end": 45 },
  "chorus": { "start": 45, "end": 75 },
  "verse2": { "start": 75, "end": 105 },
  "bridge": { "start": 105, "end": 135 },
  "outro": { "start": 135, "end": 150 },
  "highlights": [
    { "time": 45, "label": "副歌开始" },
    { "time": 105, "label": "高潮部分" }
  ]
}
```

## 🎵 示例歌曲文件夹

### 示例：M500001ASMC447Mslm

```
music list/M500001ASMC447Mslm/
├── audio.mp3           # 音频文件
├── cover.jpg           # 封面（如果有）
├── lyrics.lrc          # 歌词（如果有）
├── metadata.json       # 元数据
└── timestamps.json     # 时间戳（可选）
```

## 📋 musicList.json 配置

```json
[
  {
    "id": 1,
    "folderName": "M500001ASMC447Mslm",
    "title": "歌曲标题",
    "artist": "艺术家",
    "album": "专辑",
    "year": "2024",
    "genre": "流行",
    "duration": "3:45",
    "audioFile": "/music/music list/M500001ASMC447Mslm/audio.mp3",
    "coverFile": "/music/music list/M500001ASMC447Mslm/cover.jpg",
    "lyricsFile": "/music/music list/M500001ASMC447Mslm/lyrics.lrc",
    "metadataFile": "/music/music list/M500001ASMC447Mslm/metadata.json",
    "timestampsFile": "/music/music list/M500001ASMC447Mslm/timestamps.json",
    "liked": false
  }
]
```

## 🔧 优势

1. **组织清晰**: 每首歌的所有资源都在一个文件夹中
2. **易于管理**: 添加/删除歌曲只需操作对应文件夹
3. **可扩展性**: 方便添加新的元数据文件
4. **备份友好**: 整个文件夹即为完整的歌曲数据
5. **支持更多功能**: 歌词显示、时间戳跳转等

## 📱 功能扩展

### 歌词显示
- 读取 `lyrics.lrc` 文件
- 实时滚动显示当前歌词
- 点击歌词跳转到对应时间

### 封面显示
- 优先使用本地 `cover.jpg`
- 如果没有则使用占位符
- 支持全屏封面显示

### 时间戳跳转
- 读取 `timestamps.json` 文件
- 快速跳转到歌曲特定部分
- 标记重要片段

### 元数据展示
- 显示完整的歌曲信息
- 标签筛选和搜索
- 支持多语言歌曲
