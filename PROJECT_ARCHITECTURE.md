# 项目架构文档

## 项目概览

- **部署**: GitHub Pages（示例 URL 以仓库 Settings 为准）
- **构建**: `react-scripts` + **Tailwind CSS**
- **路由**: React Router DOM（`BrowserRouter`，basename = `PUBLIC_URL`）
- **状态**: `ThemeContext`、`I18nContext`、`SessionContext`

## 路由一览（与 `App.js` 一致）

共 **约 24～25** 条路由记录（含 `*`；以 `npm run generate-architecture` 输出为准）。

### 首页
| 路径 | 组件 |
|------|------|
| `/` `/home` | NewHome |
| `/classic` | ClassicHome |

### 学习记录
| 路径 | 组件 |
|------|------|
| `/notes` | NoteHome |
| `/notes/editor` | NoteEditor |
| `/notes/view/:id` | NoteView |
| `/notes/old` | Note |
| `/vocabulary` | VocabularyPage |
| `/learning-materials` | LearningMaterialsPage |

### 内容
| 路径 | 组件 |
|------|------|
| `/music` | Music |
| `/music/simple-recorder` | SimpleTextRecorder |
| `/files` | FileManagerPage |
| `/blog` | BlogHome |
| `/video` | VideoPlayer |
| `/shop` | ShopHome |
| `/shop/add` | AddProduct |

### 展示
| 路径 | 组件 |
|------|------|
| `/portfolio` | Portfolio |
| `/products` | Products |

### 工具
| 路径 | 组件 |
|------|------|
| `/accounting` | AccountingPage |
| `/pdf` | PdfPage |
| `/pdf/editor` | PdfEditorPage |
| `/visualization` | VisualizationPage |
| `/architecture` | ArchitecturePage |
| `/image-lab` | ImageLabPage |

### 系统
| 路径 | 组件 |
|------|------|
| `*` | NotFoundPage |

## 目录结构（精简）

```
src/
├── App.js
├── components/
│   ├── UI/                 # ★ 通用 UI（统一从 UI/index 引用）
│   ├── Layout/             # Header、Footer、Navbar、PageLayout
│   ├── Weather、Calendar、MusicPlayer、FileManager、DiagramEditor …
│   ├── AlgorithmVisualizer、WelcomeBanner、Showcase …
│   └── CodeBlock.js        # Markdown 代码块（根级单文件）
├── pages/                  # 按功能分目录，每页一个或多个 .js
├── context/                # Theme、I18n、Session
└── utils/
```

## 架构 JSON

- 路径：`public/data/architecture.json`
- 生成：`npm run generate-architecture`（扫描 `App.js` 路由 + `components` / `pages` / `context` / `utils` 树）
- 部署：`predeploy` 会先执行生成再 `build`

## 相关文档

- [docs/COMPONENTS.md](docs/COMPONENTS.md) — 通用组件约定
- [README.md](README.md) — **唯一项目说明与追踪**
- [docs/DOCS_INDEX.md](docs/DOCS_INDEX.md) — 专题文档索引

---
**文档更新**: 与仓库当前结构同步；大改目录后请执行 `npm run generate-architecture` 并核对本文件路由表。
