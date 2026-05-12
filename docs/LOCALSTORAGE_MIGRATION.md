# LocalStorage 迁移工具使用说明

## 功能概述

这个迁移工具可以将浏览器 localStorage 中存储的动态数据导出为静态文件，便于版本控制、备份和长期保存。

## 已创建的文件

### 1. 核心迁移工具
- **`src/utils/localStorageMigrator.js`** - 核心迁移逻辑
  - `executeMigration()` - 执行完整迁移
  - `downloadMigratedFiles(files)` - 下载所有迁移的文件
  - `generateMigrationReport(result)` - 生成迁移报告

### 2. React 组件
- **`src/components/MigrationTool/MigrationTool.js`** - 可视化迁移界面
  - 一键执行迁移
  - 显示迁移统计
  - 下载迁移文件

### 3. 文件索引生成器
- **`scripts/generate-file-index.js`** - Node.js 脚本
  - 扫描 `public/files/` 目录
  - 生成 `public/metadata/file-index.json`
  - 支持 Markdown frontmatter 解析

### 4. 文档
- **`docs/MIGRATION_GUIDE.md`** - 完整迁移指南

## 使用方式

### 方式一：在浏览器中运行（推荐）

1. 启动应用：
```bash
npm start
```

2. 在应用中集成 MigrationTool 组件（例如在设置页面或文件管理页面）

3. 点击"开始迁移"按钮

4. 下载生成的文件包

### 方式二：在控制台直接运行

打开浏览器开发者工具（F12），在 Console 中运行：

```javascript
// 假设你已经导入了 migrator
const result = executeMigration();
console.log('迁移完成:', result);

// 下载文件
downloadMigratedFiles(result.files);

// 下载报告
const report = generateMigrationReport(result);
console.log(report);
```

## 数据映射

| localStorage Key | 导出目录 | 文件格式 |
|-----------------|---------|---------|
| userNotes | `/files/notes/` | Markdown (.md) |
| userMusic | `/files/music/` | JSON (.json) |
| userDiagrams | `/files/diagrams/` | JSON (.json) |
| userVideos | `/files/videos/` | JSON (.json) |
| userProducts | `/files/products/` | JSON (.json) |
| blogPosts | `/files/posts/` | Markdown (.md) |
| inspirationLyrics | `/files/lyrics/` | Markdown (.md) |
| quickLyricsInspirations | `/files/lyrics/` | Markdown (.md) |

## 文件格式示例

### Markdown 文件（笔记、动态、歌词）

```markdown
---
title: "标题"
id: "unique-id"
createdAt: "2025-01-15T10:00:00Z"
updatedAt: "2025-01-15T10:00:00Z"
tags: ["标签 1", "标签 2"]
---

内容...
```

### JSON 文件（音乐、图形、视频、商品、产品）

```json
{
  "id": "unique-id",
  "title": "标题",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z",
  ...
}
```

## 构建时生成索引

在 `package.json` 中已经配置好：

```json
{
  "scripts": {
    "build": "npm run generate-file-index && react-scripts build",
    "generate-file-index": "node scripts/generate-file-index.js"
  }
}
```

每次构建时会自动扫描 `public/files/` 目录并生成索引。

## 手动运行索引生成

```bash
npm run generate-file-index
```

## 迁移后的目录结构

```
public/files/
├── notes/          # 笔记（Markdown 格式）
├── music/          # 音乐信息（JSON 格式）
├── diagrams/       # 图形数据（JSON 格式）
├── videos/         # 视频信息（JSON 格式）
├── products/       # 商品信息（JSON 格式）
├── posts/          # 动态（Markdown 格式）
└── lyrics/         # 灵感歌词（Markdown 格式）
```

## 注意事项

1. **浏览器安全限制**: 无法直接写入文件系统，需要手动下载文件
2. **数据保留**: 迁移不会删除原始 localStorage 数据
3. **文件命名**: 使用时间戳确保文件名唯一性
4. **元数据保留**: 所有原始数据的元数据（ID、时间戳等）都会保留

## 清理 localStorage

确认迁移成功后，可以选择清理：

```javascript
// 在 Console 中运行
localStorage.removeItem('userNotes');
localStorage.removeItem('userMusic');
localStorage.removeItem('userDiagrams');
localStorage.removeItem('userVideos');
localStorage.removeItem('userProducts');
localStorage.removeItem('blogPosts');
localStorage.removeItem('inspirationLyrics');
localStorage.removeItem('quickLyricsInspirations');
```

## 故障排除

### 问题：迁移后看不到文件
- 检查是否下载了文件
- 确认文件放置到正确的目录
- 运行 `npm run generate-file-index` 更新索引
- 访问 `/universal-files` 查看

### 问题：文件索引为空
- 确认 `public/files/` 目录存在且有文件
- 检查控制台是否有错误信息
- 查看生成的 `file-index.json` 内容

### 问题：Markdown 文件 frontmatter 解析失败
- 确保 frontmatter 格式正确（以 `---` 开始和结束）
- 检查 YAML 语法是否正确
