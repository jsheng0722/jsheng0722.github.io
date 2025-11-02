# 快速开始 - 添加新歌曲

## 🎵 步骤1：创建歌曲文件夹

在 `music list/` 目录下创建一个新文件夹，建议使用歌曲ID或拼音作为文件夹名：

```
music list/
└── 你的歌曲名称/
```

## 📁 步骤2：放置文件

将以下文件放入歌曲文件夹：

### 必需文件：
- **audio.mp3** - 音频文件（或保持原文件名）

### 推荐文件：
- **metadata.json** - 歌曲信息（从模板复制）
- **cover.jpg** - 封面图片（300x300或更大）

### 可选文件：
- **lyrics.lrc** - 歌词文件
- **timestamps.json** - 时间戳标记

## 📝 步骤3：编辑metadata.json

复制并修改以下模板：

```json
{
  "title": "歌曲名称",
  "artist": "艺术家",
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

## 🔧 步骤4：更新musicList.json

在 `public/music/musicList.json` 中添加新歌曲条目：

```json
{
  "id": 2,
  "folderName": "你的歌曲名称",
  "title": "歌曲标题",
  "artist": "艺术家",
  "album": "专辑名称",
  "duration": "3:45",
  "genre": "流行",
  "year": "2024",
  "audioFile": "/music/music list/你的歌曲名称/audio.mp3",
  "coverFile": "/music/music list/你的歌曲名称/cover.jpg",
  "lyricsFile": "/music/music list/你的歌曲名称/lyrics.lrc",
  "metadataFile": "/music/music list/你的歌曲名称/metadata.json",
  "timestampsFile": "/music/music list/你的歌曲名称/timestamps.json",
  "cover": "https://via.placeholder.com/300x300/6366f1/ffffff?text=🎵",
  "file": "/music/music list/你的歌曲名称/audio.mp3",
  "liked": false,
  "hasLyrics": true,
  "hasCover": true,
  "hasTimestamps": false
}
```

## 🔄 步骤5：刷新列表

在音乐页面点击"刷新列表"按钮或刷新浏览器页面。

## 📋 文件夹结构示例

```
music list/
└── 告白气球/
    ├── audio.mp3           # 音频文件
    ├── cover.jpg           # 封面图片 (300x300)
    ├── lyrics.lrc          # 歌词文件
    ├── metadata.json       # 元数据
    └── timestamps.json     # 时间戳（可选）
```

## 💡 提示

1. **文件夹命名**: 使用英文或拼音，避免特殊字符
2. **音频文件**: 可以命名为 `audio.mp3` 或保持原名
3. **封面图片**: 正方形图片效果最好
4. **歌词格式**: 使用标准LRC格式，包含时间戳
5. **测试播放**: 添加后先测试播放是否正常

## ⚠️ 常见问题

### 音乐无法播放
- 检查音频文件路径是否正确
- 确认文件格式是否支持（MP3推荐）
- 查看浏览器控制台错误信息

### 封面不显示
- 确认图片文件存在
- 检查文件路径拼写
- 尝试使用绝对路径

### 歌词不显示
- 检查LRC文件格式是否正确
- 确认时间戳格式 [mm:ss.xx]
- 验证文件编码为UTF-8

## 🔗 相关文档

- [完整文件夹结构说明](../FOLDER_STRUCTURE.md)
- [歌词LRC格式说明](./LYRICS_FORMAT.md)
- [元数据字段说明](./METADATA_FIELDS.md)
