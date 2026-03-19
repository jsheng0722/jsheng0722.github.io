# 通用组件说明

项目路由与变更追踪见根目录 **README.md**（唯一维护入口）。

## 原则

- **可复用 UI**（按钮、卡片、弹窗、输入框、分页、空状态等）一律从 **`src/components/UI/`** 引入。
- 统一入口：`import { Button, Modal, ConfirmDialog, ... } from '../components/UI'`（按页面深度调整路径）。
- 完整导出列表见 **`src/components/UI/index.js`**。

## 新增通用组件的流程（强制）

**若新组件具备通用性（可在多个页面或模块中复用），必须按以下顺序进行：**

1. **先加入通用组件库**：在 `src/components/UI/` 下新建组件目录（如 `NewWidget/NewWidget.js`），实现组件并保证支持主题/无障碍等约定。
2. **再在入口导出**：在 `src/components/UI/index.js` 中增加 `export { default as NewWidget } from './NewWidget/NewWidget';`。
3. **最后在业务中调用**：在页面或其它组件中通过 `import { NewWidget } from '../../components/UI'` 使用。

**禁止**：在某个页面或业务目录下先写一个「通用级」组件，再被多处引用。应先入 UI 再调用。

## UI 组件清单（index.js）

| 导出名 | 用途 |
|--------|------|
| `Button` | 主按钮（variant: primary / ghost / danger 等） |
| `Card` | 卡片容器 |
| `Collapsible` | 折叠区块 |
| `Dialog` / `ConfirmDialog` | 对话框与确认框 |
| `FloatingButton` / `FloatingToolbar` | 浮动按钮与笔记浮动工具栏 |
| `Form` / `Input` / `Textarea` | 表单与输入 |
| `Modal` | 全屏/居中模态 |
| `Badge` / `Tooltip` / `Loading` / `EmptyState` | 辅助展示 |
| `Navigation` | 导航菜单（ClassicHome 等） |
| `FileList` / `FileViewer` | 文件列表与查看 |
| `SearchBox` / `Pagination` / `StatCard` | 搜索、分页、统计卡片 |
| `ColorPicker` / `IconToggleButton` | 颜色与图标开关 |
| `DataExportImport` | 数据导入导出 |

## 布局与页面壳

- **`PageLayout`**：`src/components/Layout/PageLayout.js` — 带 Header/Footer 的标准页面壳。
- **`Header` / `Footer` / `Navbar`**：`src/components/Layout/`。

## 勿重复造轮子

以下路径**已删除**或不应再新增同类实现：

- ~~`components/FloatingToolbar.js`（根目录）~~ → 使用 `UI/FloatingToolbar`
- ~~`components/Dialog/ConfirmationDialog.js`~~ → 使用 `UI/Dialog/ConfirmDialog`
- ~~`components/FloatingActionButton.js`~~ → 按需使用 `UI/FloatingButton` 或页面内按钮

## 功能型组件（非通用 UI）

天气、日历、音乐条、流程图、算法可视化等仍在各自目录（如 `Weather/`、`DiagramEditor/`），与业务强相关，不强制并入 UI。
