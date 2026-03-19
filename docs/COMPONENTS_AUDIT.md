# 通用组件审查报告

> 审查时间：按当前代码库状态；项目说明与追踪见根目录 **README.md**。

## 一、已做好的部分

### 1. 统一入口与导出

- **唯一入口**：`src/components/UI/index.js` 统一导出 20+ 个通用组件（Button、Card、Modal、ConfirmDialog、Pagination、EmptyState、SearchBox、FileViewer、DataExportImport 等）。
- **无重复实现**：此前重复的 `FloatingToolbar.js`（根目录）、`Dialog/ConfirmationDialog.js`、`FloatingActionButton.js` 已删除，仅保留 UI 库内实现。

### 2. 已使用 UI 组件的页面/模块

| 模块 | 使用的 UI 组件 |
|------|----------------|
| 笔记 | NoteHome、NoteView、NoteEditor → Button, Card, Badge, EmptyState, SearchBox, Dialog, Input, **FloatingToolbar** |
| 单词本 | VocabularyPage → Button, Card, Badge, EmptyState, SearchBox, Input, Textarea, Collapsible |
| 学习资料 | LearningMaterialsPage → Button, Card, EmptyState, Input, SearchBox, Textarea, Badge |
| 记账 | AccountingPage → Card, Pagination, StatCard, EmptyState, Loading, **DataExportImport** |
| PDF | PdfPage, PdfEditorPage → Card, Button, ColorPicker, IconToggleButton |
| 图像实验室 | ImageLabPage → Button, Modal |
| 博客 | BlogHome → **ConfirmDialog** |
| 评论 | Comment → **ConfirmDialog** |
| 文件管理 | FileManager → Button, Card, Dialog, Badge |
| 音乐 | Music, SimpleTextRecorder → Card, Button, Collapsible, Textarea, EmptyState |
| 经典首页 | ClassicHome → Navigation, FileList |
| 算法可视化 | AlgorithmVisualizer → Card |
| 笔记卡片 | NoteCard, NoteListItemCompact → Card, Badge |
| 会话 | SessionContext → Modal |

以上均从 `components/UI` 或 `../UI` 引入，**通用组件已归总并大量使用**。

---

## 二、可优化项（非必须）

### 1. 仍使用原生 `<button` 的位置

以下为**样式/交互自管**的 `<button`，若希望全站按钮风格统一，可逐步改为 `import { Button } from '.../UI'`：

| 文件 | 说明 |
|------|------|
| `pages/Portfolio/Portfolio.js` | 多处 tab/操作按钮 |
| `pages/Shop/ShopHome.js` | 收藏、筛选等按钮 |
| `pages/Products/ProductCard.js` | 卡片内操作按钮 |
| `pages/Blog/BlogHome.js` | 发布、删除图片/标签等小按钮 |
| `pages/Note/Layout/Sidebar/NoteSidebar.js` | 「写笔记」按钮 |
| `components/Comment/CommentSend/CommentSend.js` | 发送按钮 |
| `components/Comment/CommentList/CommentList.js` | 点赞/踩/删除 |
| `components/Showcase/Showcase.js` | 轮播/查看详情 |
| `pages/ImageLab/ImageLabPage.js` | 历史记录卡片上一处 `type="button"`（其余已用 UI Button） |
| `components/UserRelated/SideMenu/LeftSideMenu.js` | 菜单开关 |
| `components/Visualizations/CallTreeSidebar.js` | 展开/收起 |
| `components/UI/FileList/FileList.js` | 列表内链接样式按钮 |
| `pages/Folder/Sidebar.js` | 文件名点击 |

**建议**：优先把 **Portfolio、Shop、Blog** 的主操作按钮改为 UI `Button`，其余可按迭代逐步替换。

### 2. 与 UI 同名的局部组件（保留无妨）

| 位置 | 说明 |
|------|------|
| `pages/Portfolio/Components/Card.js` | 作品集**业务卡片**（教育/项目展示），与 UI 的通用 Card 不同，保留合理。 |
| `pages/Folder/FileViewer.js` | 仅负责按 `filePath` fetch 并展示文本，路径与 UI FileViewer 不同，可保留。 |
| `pages/Products/FileViewer.js` | 同上，且支持 HTML 渲染，与 UI 的「选择文件 + 空状态」用途不同，可保留。 |

无需强制合并到 UI，避免破坏现有业务逻辑。

### 3. UI 库内未导出但被 README 提过的

- **FloatingCodeVisualizer**：曾在旧文档中出现，当前 `UI/index.js` 未导出；若项目中无引用，可视为历史功能，不影响本次「通用组件归总」结论。

---

## 三、结论与建议

- **通用组件已归总并优化**：单一入口（`UI/index.js`）、无重复实现、主要页面（笔记、单词本、学习资料、记账、PDF、图像实验室、博客、文件管理、音乐等）均已使用 UI 组件。
- **可选后续**：将 Portfolio / Shop / Blog 等处的原生 `<button` 逐步替换为 UI `Button`，以进一步统一风格与无障碍；其余原生按钮可按需分批替换。
- **文档**：通用组件约定见 **docs/COMPONENTS.md**，API 与示例见 **docs/UI_COMPONENTS_API.md**；本审查结论可随大版本更新时刷新。
