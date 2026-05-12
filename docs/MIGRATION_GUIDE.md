# 数据迁移指南

## 概述

本指南说明如何将 localStorage 中的动态数据迁移为静态文件，以便版本控制和长期保存。

## 迁移步骤

### 1. 使用迁移工具导出数据

在浏览器中访问网站后，打开开发者工具（F12），在 Console 中运行：

```javascript
// 导入迁移工具
import { executeMigration, downloadMigratedFiles } from './utils/localStorageMigrator.js';

// 执行迁移
const result = executeMigration();
console.log('迁移结果:', result);

// 下载所有文件
downloadMigratedFiles(result.files);
```

或者在应用中集成 `MigrationTool` 组件来执行迁移。

### 2. 将文件放置到正确目录

下载的文件会被自动整理到对应的文件夹中，需要手动将它们移动到 `public/files/` 目录下：

```
public/files/
├── notes/      # 笔记文件 (.md)
├── music/      # 音乐数据 (.json)
├── diagrams/   # 图形数据 (.json)
├── videos/     # 视频数据 (.json)
├── products/   # 商品数据 (.json)
├── posts/      # 动态文件 (.md)
└── lyrics/     # 歌词文件 (.md)
```

### 3. 生成文件索引

运行以下命令生成文件索引：

```bash
npm run generate-file-index
```

这会自动扫描 `public/files/` 目录并生成 `public/metadata/file-index.json`。

### 4. 验证迁移结果

构建并运行项目，访问 `/universal-files` 页面查看迁移后的文件。

```bash
npm start
```

## 数据格式说明

### 笔记（Markdown 格式）

```markdown
---
title: "笔记标题"
id: "note-123"
createdAt: "2025-01-15T10:00:00Z"
updatedAt: "2025-01-15T10:00:00Z"
tags: ["标签 1", "标签 2"]
category: "分类"
---

笔记内容...
```

### 动态（Markdown 格式）

```markdown
---
title: "动态标题"
date: "2025-01-15"
time: "10:00"
tags: ["标签 1"]
mood: "happy"
---

动态内容...
```

### 数据文件（JSON 格式）

音乐、图形、视频、商品等数据以 JSON 格式存储，保留所有原始字段。

## 自动化迁移（可选）

如果你想在构建时自动迁移 localStorage 数据，可以创建一个浏览器扩展或用户脚本，在页面加载时自动执行迁移。

## 清理 localStorage

确认迁移成功后，可以选择清理 localStorage 中的数据：

```javascript
// 谨慎操作：这会删除所有 localStorage 数据
localStorage.clear();

// 或者删除特定数据
localStorage.removeItem('userNotes');
localStorage.removeItem('userMusic');
// ...
```

## 常见问题

### Q: 为什么不能自动写入文件系统？
A: 由于浏览器的安全限制，网页无法直接写入用户的文件系统。需要手动下载并放置文件。

### Q: 迁移后原来的数据还在吗？
A: 是的，迁移工具只是读取并导出数据，不会删除原始数据。需要手动清理 localStorage。

### Q: 如何验证迁移是否成功？
A: 访问 `/universal-files` 页面，应该能看到所有迁移后的文件。

## 技术支持

如有问题，请查看控制台日志或联系开发者。
