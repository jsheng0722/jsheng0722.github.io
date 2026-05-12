# 📝 笔记页面文件示例

这是一个演示如何在笔记页面存储文件的示例。

## 📁 笔记文件存储位置

```
public/files/documents/markdown/
├── notes/           # 笔记内容
└── guide/           # 指南文档
```

## ✅ 支持的文件类型

| 类型 | 扩展名 | 说明 |
|------|--------|------|
| Markdown | .md | 笔记内容 |
| PDF | .pdf | 文档附件 |
| 图片 | .jpg, .png | 插图 |

## 📌 使用示例

### 基本格式

```markdown
# 笔记标题

正文内容...

## 子标题

- 列表项
- 列表项

**粗体** *斜体* `代码`
```

### 代码块

```javascript
function hello() {
  console.log('Hello World');
}
```

### 表格

| 功能 | 状态 |
|------|------|
| 笔记编辑 | ✅ |
| 分类管理 | ✅ |
| 搜索功能 | ✅ |

---

**提示**: 笔记文件应使用 `.md` 扩展名，存储在 `/files/documents/markdown/notes/` 目录下。
