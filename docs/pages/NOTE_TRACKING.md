# 笔记功能追踪

> 用于记录笔记模块的当前实现状态，便于后续维护与扩展其他功能时参考。

---

## 当前状态总览

| 模块         | 状态     | 说明 |
|--------------|----------|------|
| 笔记列表     | ✅ 完成   | 卡片/紧凑双布局、分类筛选、搜索、统计 |
| 笔记详情     | ✅ 完成   | 查看、缩放、编辑/删除入口 |
| 笔记编辑     | ✅ 完成   | 新建/编辑、保存到 localStorage |
| 删除         | ✅ 完成   | 标题确认删除，支持 JSON 与 userNotes |
| 可视化跳转   | ✅ 完成   | 从详情跳可视化、返回笔记（含 state 与 URL 兜底） |
| 通用组件     | ✅ 完成   | NoteCard、NoteListItemCompact、noteCategoryUtils |

---

## 路由与页面

| 路径               | 组件       | 说明 |
|--------------------|------------|------|
| `/notes`           | NoteHome   | 笔记首页：列表、搜索、分类、布局切换 |
| `/notes/view/:id`  | NoteView   | 笔记详情：查看、编辑/删除、内容缩放、跳可视化 |
| `/notes/editor`    | NoteEditor | 笔记编辑：新建/编辑、保存 |

---

## 数据来源

- **用户笔记**：`localStorage.userNotes`（数组），新建/编辑保存到此。
- **内置笔记**：`/content/noteList_s.json`，与 userNotes 合并后展示。
- **已删除 ID**：`localStorage.notesDeletedIds`（字符串数组），删除时写入；列表加载时过滤掉这些 id，使 JSON 与 userNotes 中的笔记都能从列表“消失”。

---

## 列表页（NoteHome）

- **布局**：卡片视图（默认）/ 紧凑视图，偏好存 `localStorage.notesLayoutView`。
- **紧凑视图**：单行展示，左侧笔记名+分类，右侧作者与日期；窗口变窄时右侧整块换行。
- **主区域**：`PageLayout` 使用 `w-full max-w-7xl mx-auto`，保证 main 不因内容变窄而缩小。
- **通用组件**：`NoteCard`、`NoteListItemCompact` 来自 `src/components/Note/`。

---

## 详情页（NoteView）

- **笔记来源**：优先 `location.state.note`；若无则按 URL `id` 从 `userNotes` 查找。
- **删除**：输入完整标题确认后，从 userNotes 中移除（`String(n.id) !== String(note.id)` 比较），并将 `note.id` 加入 `notesDeletedIds`，再跳回 `/notes`。
- **返回可视化**：从可视化页返回时依赖 state 或 sessionStorage 的 note/returnPath；NoteView 无 state 时用 URL id 从 userNotes 加载。

---

## 通用组件（src/components/Note/）

| 文件/导出                | 用途 |
|--------------------------|------|
| `noteCategoryUtils.js`   | 分类条颜色、图标样式、图标组件、难度 Badge 样式 |
| `NoteListItemCompact.js`| 紧凑视图单行：左标题+分类，右作者/日期 |
| `NoteCard.js`           | 卡片视图单条：顶条、分类、标题、摘要、元信息、标签、难度 |
| `index.js`               | 导出上述组件与工具函数 |

---

## 相关文档

- [笔记功能指南](./NOTE_FEATURES.md) - 缩放等使用说明
- [笔记系统完整指南](./FINAL_GUIDE.md)
- [编辑删除指南](./EDIT_DELETE_GUIDE.md)
- [永久保存指南](./PERMANENT_SAVE_GUIDE.md)

---

**最后更新**：按当前笔记功能完成状态更新  
**维护说明**：后续更新其他功能时，若改动笔记模块，请同步更新本文档。
