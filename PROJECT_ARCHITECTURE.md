# 项目架构文档

## 📋 项目概览

这是一个基于 React 的静态网站项目，部署在 GitHub Pages 上。

- **部署URL**: https://jsheng0722.github.io
- **构建工具**: react-scripts
- **样式框架**: Tailwind CSS
- **路由**: React Router DOM

## 🗺️ 路由配置 (20个路由)

### 主要页面 (4个)
- `/` - 首页（NewHome）
- `/home` - 首页（重定向）
- `/classic` - 经典首页（ClassicHome）
- `/desktop` - 桌面（DesktopPage）

### 笔记系统 (4个)
- `/notes` - 笔记首页（NoteHome）
- `/notes/editor` - 笔记编辑器（NoteEditor）
- `/notes/view/:id` - 笔记查看（NoteView）
- `/notes/old` - 旧版笔记（Note）

### 内容管理 (6个)
- `/music` - 音乐库（Music）
- `/music/simple-recorder` - 简单文本记录（SimpleTextRecorder）
- `/files` - 文件管理（FileManagerPage）
- `/blog` - 动态（BlogHome）
- `/video` - 视频（VideoPlayer）
- `/shop` - 收藏（ShopHome）
- `/shop/add` - 添加商品（AddProduct）

### 展示页面 (2个)
- `/portfolio` - 作品集（Portfolio）
- `/products` - 产品（Products）

### 工具页面 (2个)
- `/visualization` - 算法可视化（VisualizationPage）
- `/architecture` - 项目架构（ArchitecturePage）

### 系统页面 (1个)
- `*` - 404页面（NotFoundPage）

## 🧩 组件结构

### 布局组件 (src/components/Layout/)
- `Header` - 顶部导航栏
- `Footer` - 底部信息
- `Layout` - 布局容器
- `Navbar` - 导航菜单
- `Sidebar` - 侧边栏
- `CollapsibleSidebar` - 可折叠侧边栏
- `Searchbar` - 搜索栏
- `MenuSearchbar` - 菜单搜索栏
- `Main` - 主内容区

### UI组件库 (src/components/UI/)
- `Button` - 按钮
- `Card` - 卡片
- `Input` - 输入框
- `Textarea` - 文本域
- `Modal` - 模态框
- `Dialog` - 对话框
- `ConfirmDialog` - 确认对话框
- `Badge` - 徽章
- `Tooltip` - 提示
- `Loading` - 加载
- `EmptyState` - 空状态
- `FloatingButton` - 浮动按钮
- `FloatingToolbar` - 浮动工具栏
- `FloatingCodeVisualizer` - 代码可视化悬浮面板
- `Collapsible` - 可折叠
- `Navigation` - 导航
- `FileList` - 文件列表
- `Form` - 表单

### 功能组件
- `Weather` - 天气系统
- `Calendar` - 日历
- `MusicPlayer` - 音乐播放器
- `FileManager` - 文件管理器
- `DiagramEditor` - 流程图编辑器
- `CodeBlock` - 代码块
- `AlgorithmVisualizer` - 算法可视化
- `VisualizationToolkit` - 可视化工具包
- `Showcase` - 展示窗
- `WelcomeBanner` - 欢迎横幅

### 算法可视化组件
- `ArrayVisualizer` - 数组可视化
- `LinkedListVisualizer` - 链表可视化
- `TreeVisualizer` - 树可视化
- `SortVisualizer` - 排序可视化
- `FunctionBlock` - 函数块
- `ListTool` - 列表工具
- `LoopTool` - 循环工具
- `VariableTool` - 变量工具
- `OperationNode` - 操作节点

### 上下文 (src/context/)
- `ThemeContext` - 主题管理（明亮/暗黑）
- `I18nContext` - 国际化（中文/英文）

## 🛠️ 工具函数 (src/utils/)
- `lrcParser.js` - 歌词解析器
- `WeatherAPI.js` - 天气API

## 📁 目录结构

```
react-basic/
├── public/                 # 静态资源
│   ├── content/           # 笔记内容
│   ├── music/             # 音乐文件
│   ├── images/            # 图片资源
│   └── ...
├── src/
│   ├── components/        # 组件
│   │   ├── Layout/        # 布局组件
│   │   ├── UI/            # UI组件库
│   │   ├── Weather/       # 天气组件
│   │   ├── Calendar/      # 日历组件
│   │   ├── MusicPlayer/   # 音乐播放器
│   │   ├── FileManager/   # 文件管理器
│   │   ├── DiagramEditor/ # 流程图编辑器
│   │   ├── AlgorithmVisualizer/ # 算法可视化
│   │   └── ...
│   ├── pages/             # 页面
│   │   ├── Home/          # 首页
│   │   ├── Note/          # 笔记系统
│   │   ├── Music/         # 音乐页面
│   │   ├── Portfolio/     # 作品集
│   │   ├── Products/      # 产品
│   │   ├── FileManager/   # 文件管理
│   │   ├── Desktop/       # 桌面
│   │   ├── Blog/          # 动态
│   │   ├── Video/         # 视频
│   │   ├── Shop/          # 收藏
│   │   ├── Visualization/ # 可视化
│   │   └── Architecture/  # 架构展示
│   ├── context/           # 上下文
│   ├── utils/             # 工具函数
│   ├── App.js             # 主应用
│   └── index.js           # 入口文件
├── scripts/                # 工具脚本
├── package.json            # 项目配置
├── tailwind.config.js      # Tailwind配置
└── README.md              # 项目文档
```

## 🚀 部署信息

- **平台**: GitHub Pages
- **URL**: https://jsheng0722.github.io
- **构建命令**: `npm run build`
- **部署命令**: `npm run deploy`
- **构建目录**: `build/`
- **部署分支**: `gh-pages`
- **Jekyll**: 已禁用 (.nojekyll)
- **路由模式**: BrowserRouter (客户端路由)

## 📊 项目统计

- **路由总数**: 20
- **页面组件**: 20+
- **UI组件**: 18
- **功能组件**: 10+
- **工具函数**: 2
- **页面分类**: 5

## 🔗 访问架构页面

访问 `/architecture` 路由可以查看交互式的项目架构展示页面，包括：
- 所有路由的详细列表
- 组件结构树
- 部署信息
- 项目统计

---

**最后更新**: 2025-01-25
