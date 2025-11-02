# 快速添加音乐指南

## 🎵 最简单的方式

### 三步添加新音乐

#### 1️⃣ 创建文件夹并放置MP3
```bash
public/music/music list/
└── [新歌曲名称]/
    └── 歌曲.mp3
```

#### 2️⃣ 运行自动生成命令
```bash
npm run generate-music-metadata
```

#### 3️⃣ 刷新页面
在音乐页面点击"刷新列表"或刷新浏览器

## ✨ 自动完成的事情

脚本会自动为您：

1. ✅ 扫描所有音乐文件夹
2. ✅ 创建 `metadata.json` 文件
3. ✅ 创建 `lyrics.lrc` 歌词模板
4. ✅ 创建 `timestamps.json` 时间戳模板
5. ✅ 更新 `musicList.json` 配置
6. ✅ 配置正确的文件路径

## 🎨 可选：添加更多内容

### 添加封面图片
将封面图片（jpg/png）放入歌曲文件夹：
```bash
歌曲文件夹/
├── 歌曲.mp3
└── cover.jpg    # 添加封面
```

再次运行脚本，封面会自动关联。

### 添加歌词
编辑自动生成的 `lyrics.lrc` 文件：
```lrc
[ti:歌曲名]
[ar:艺术家]
[00:00.00]第一句歌词
[00:15.00]第二句歌词
```

### 完善元数据
编辑 `metadata.json` 文件：
```json
{
  "title": "歌曲真实名称",
  "artist": "真实艺术家",
  "album": "专辑名称",
  "year": "发行年份",
  "genre": "音乐类型",
  "duration": "3:45"
}
```

## 📋 完整示例

### 添加"告白气球"

1. **准备文件**：
   ```bash
   mkdir "public/music/music list/告白气球"
   # 将告白气球.mp3复制到该文件夹
   # 将cover.jpg复制到该文件夹（可选）
   ```

2. **运行脚本**：
   ```bash
   npm run generate-music-metadata
   ```

3. **查看生成结果**：
   ```bash
   告白气球/
   ├── 告白气球.mp3
   ├── cover.jpg
   ├── metadata.json      # ✅ 已生成
   ├── lyrics.lrc         # ✅ 已生成
   └── timestamps.json    # ✅ 已生成
   ```

4. **编辑metadata.json**：
   ```json
   {
     "title": "告白气球",
     "artist": "周杰伦",
     "album": "周杰伦的床边故事",
     "year": "2016",
     "genre": "流行",
     "language": "中文",
     "tags": ["流行", "抒情", "周杰伦"]
   }
   ```

5. **添加歌词**（可选）：
   从歌词网站下载LRC文件，替换自动生成的 `lyrics.lrc`

6. **刷新页面**：
   音乐立即显示！

## 🎯 脚本输出说明

### 成功信息
```
✅ 歌曲名称: 添加到音乐列表
   音频: 文件名.mp3
   封面: cover.jpg
   歌词: lyrics.lrc
```

### 警告信息
```
⚠️  歌曲名称: 未找到音频文件，跳过
```
→ 确保文件夹中有MP3文件

```
⚠️  歌曲名称: metadata.json 格式错误，使用默认值
```
→ 检查JSON文件格式

## 🔄 更新现有音乐

如果已有 `metadata.json`，脚本会：
- ✅ 保留已填写的信息
- ✅ 只更新缺失的字段
- ✅ 不会覆盖您的编辑

## 💡 高级技巧

### 批量重命名
如果文件夹名就是歌曲名，脚本会自动使用文件夹名作为标题。

### 统一格式
建议文件夹命名格式：
- `歌曲名` （推荐）
- `艺术家 - 歌曲名`
- `ID_歌曲名`

### 封面优化
- 建议尺寸：300x300 或更大
- 建议格式：JPG
- 建议大小：< 500KB

## 📚 相关命令

```bash
# 生成音乐元数据
npm run generate-music-metadata

# 生成文件结构
npm run generate-file-structure

# 生成首页内容
npm run generate-home-content

# 生成语言内容
npm run generate-language-content
```

## 🎊 总结

### 传统方式 vs 自动生成

**传统方式**：
1. 创建文件夹
2. 放置MP3文件
3. 手动创建 metadata.json
4. 手动创建 lyrics.lrc
5. 手动创建 timestamps.json
6. 手动编辑 musicList.json
7. 配置所有文件路径

**自动生成方式**：
1. 创建文件夹
2. 放置MP3文件
3. 运行一条命令 ✅

节省时间：90% 以上！

## 🚀 现在就试试！

```bash
# 创建新歌曲文件夹
mkdir "public/music/music list/我的新歌"

# 放置MP3文件到该文件夹

# 运行自动生成
npm run generate-music-metadata

# 完成！
```

简单、快速、高效！🎵✨
