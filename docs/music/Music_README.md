# 音乐文件管理说明

## 文件夹结构

```
public/music/
├── README.md           # 说明文档
├── musicList.json      # 音乐列表数据
└── music list/         # 音乐文件存储文件夹
    ├── sample1.mp3    # 示例音乐文件1
    ├── sample2.mp3    # 示例音乐文件2
    ├── sample3.mp3    # 示例音乐文件3
    ├── sample4.mp3    # 示例音乐文件4
    ├── sample5.mp3    # 示例音乐文件5
    └── sample6.mp3    # 示例音乐文件6
```

## 添加新音乐文件

### 1. 放置音乐文件
将您的MP3文件直接复制到 `public/music/music list/` 文件夹中。

### 2. 更新音乐列表
编辑 `musicList.json` 文件，添加新音乐的元数据：

```json
{
  "id": 7,
  "title": "您的音乐标题",
  "artist": "艺术家名称",
  "album": "专辑名称",
  "duration": "3:45",
  "genre": "音乐类型",
  "file": "/music/music list/您的文件名.mp3",
  "cover": "https://via.placeholder.com/300x300/颜色代码/ffffff?text=🎵",
  "year": "2024",
  "liked": false
}
```

### 3. 刷新页面
保存文件后刷新浏览器页面，新音乐将出现在音乐库中。

## 音乐文件要求

- **格式**: 推荐使用 MP3 格式
- **大小**: 建议单个文件不超过 10MB（用于网页加载速度）
- **命名**: 使用英文字符和数字，避免特殊字符
- **路径**: 文件路径必须以 `/music/` 开头

## 支持的音频格式

- MP3 (.mp3) - 推荐
- WAV (.wav)
- OGG (.ogg)
- AAC (.aac)

## 封面图片

可以使用以下方式设置封面：

1. **占位符图片**（推荐用于演示）:
   ```json
   "cover": "https://via.placeholder.com/300x300/6366f1/ffffff?text=🎵"
   ```

2. **本地图片**: 将图片放在 `public/images/` 文件夹中
   ```json
   "cover": "/images/album-cover.jpg"
   ```

3. **外部链接**: 使用在线图片链接
   ```json
   "cover": "https://example.com/cover.jpg"
   ```

## 示例音乐数据

当前包含6首示例音乐：
- Lo-Fi Chill Beats (Lo-Fi)
- Ambient Dreams (Ambient)
- Jazz Fusion (Jazz)
- Classical Symphony (Classical)
- Electronic Beat (Electronic)
- Acoustic Guitar (Folk)

## 注意事项

1. **静态网站**: 这是一个静态网站，不支持动态文件上传
2. **文件同步**: 添加音乐文件后需要手动更新 `musicList.json`
3. **浏览器缓存**: 如果音乐不显示，请清除浏览器缓存
4. **文件大小**: 大文件会影响网页加载速度，建议压缩音频文件

## 故障排除

### 音乐无法播放
1. 检查文件路径是否正确
2. 确认文件格式是否支持
3. 检查浏览器控制台是否有错误

### 音乐不显示
1. 确认 `musicList.json` 格式正确
2. 检查文件是否存在于 `public/music/` 文件夹
3. 刷新浏览器页面

### 封面不显示
1. 检查封面图片链接是否有效
2. 确认图片格式支持（JPG, PNG, GIF）
3. 检查网络连接（如果使用外部链接）
