# React-Basic 个人作品集网站

一个功能完整、设计精美的个人作品集网站，集成了天气、日历、音乐播放器、笔记管理等多个实用模块。

## 🚀 项目概述

这是一个基于React构建的现代化个人网站，采用**静态网站架构**，无需后端支持即可部署到GitHub Pages等静态托管服务。网站集成了多个实用功能模块，提供优秀的用户体验和响应式布局。

## ✨ 核心功能

### 1. 🏠 智能首页
- **天气系统**（2/3宽度）
  - 当前天气、体感温度
  - 24小时逐小时预报
  - 未来5天天气预报
  - 空气质量指数
  - 日出日落时间
  - 生活指数建议
  - 城市切换功能
- **日历管理**（1/3宽度，紧凑版）
  - 月历显示
  - 事件管理
  - 今日提醒
  - 快速添加
- **展示窗**
  - 内容轮播
  - 快速访问

### 2. 📝 笔记系统（全新升级）⭐
- **笔记首页** (`/notes`)
  - 三大分类：生活、随笔、算法
  - 彩色统计卡片
  - 搜索和筛选功能
  - 美观的卡片网格
  - 标签系统
- **笔记编辑器** (`/notes/editor`)
  - Markdown编辑器 + 实时预览
  - 分类选择 + 标签管理
  - 算法专属字段（题号、难度、复杂度）
  - **🎨 流程图/思维导图绘制**（新功能）
    - 流程图模式（蓝色矩形节点）
    - 思维导图模式（紫色圆形节点）
    - 拖拽式节点编辑
    - 节点连线功能
    - 小地图导航
    - 缩放和平移控制
  - **🎯 浮动工具栏**（新功能）
    - 可自定义位置（左/右/底部）
    - 快速插入代码块
    - 快速插入表格
    - 快速插入列表
    - 快速插入引用
  - **📏 字体大小调整**（新功能）
    - 5种字体级别（小/默认/中/大/特大）
    - 实时调整预览
  - LocalStorage即时保存
- **笔记查看** (`/notes/view/:id`)
  - 完整Markdown渲染
  - **💻 代码高亮 + 一键复制**（新功能）
    - oneDark主题
    - 悬停显示复制按钮
    - 复制反馈提示
  - **📊 流程图/思维导图显示**（新功能）
    - 可交互查看
    - 缩放和平移
  - **📏 字体大小调整**（新功能）
    - 适应不同阅读场景
  - 分类颜色标识
  - 优雅的排版

### 3. 🎵 音乐系统
- **固定侧边栏播放器**
  - 右侧固定位置
  - 播放/暂停/进度/音量控制
  - 封面显示（完整和最小化状态）
  - 歌词显示按钮
- **音乐页面** (`/music`)
  - 提供“简单文本记录”入口（`/music/simple-recorder`）
  - 播放器为占位卡片（后续迭代加入）
- **歌词系统**
  - LRC格式歌词解析
  - 同步滚动显示
  - 完整歌词查看
  - 展开/收起功能
- **文件夹结构**（每首歌一个文件夹）
  ```
  music list/
  └── [歌曲名]/
      ├── audio.mp3         # 音频文件
      ├── cover.jpg         # 封面图片
      ├── lyrics.lrc        # 歌词
      ├── metadata.json     # 元数据
      └── timestamps.json   # 时间戳
  ```

### 4. 💼 作品集系统
- 项目展示
- 技能介绍
- 教育背景
- 个人简介

### 5. 🛍️ 产品系统
- 产品展示
- 筛选搜索
- 文件浏览器功能

### 6. 🎓 学习系统
- 编程语言教程
- 代码示例
- 多语言支持

## 🛠️ 技术栈

### 前端核心
- **React 18.2.0** - UI框架
- **React Router DOM 6.23.0** - 路由管理
- **Tailwind CSS 3.4.3** - 样式框架
- **React Icons 5.2.1** - 图标库
- **React Markdown 9.0.1** - Markdown渲染
- **React Flow** - 流程图和思维导图（新增）⭐
- **React Syntax Highlighter** - 代码高亮（新增）⭐

### 特色技术
- **Context API** - 全局状态管理（主题、语言）
- **LocalStorage** - 本地数据持久化
- **React Hooks** - 现代React开发
- **Tailwind Typography** - 优雅的文本排版
- **LRC Parser** - 歌词解析工具（新增）⭐
- **Prism.js** - 代码语法高亮（新增）⭐

### 通用UI组件库（新增）
- 位置：`src/components/UI/`
- 统一的样式与交互，支持明暗主题和响应式
- 组件：`Button`、`Card`、`Collapsible`、`Dialog`、`FloatingButton`、`FloatingToolbar`、`Form`、`Input`、`Textarea`、`Modal`、`Badge`、`Tooltip`、`Loading`、`EmptyState`
- 使用文档：`src/components/UI/README.md`

## 📁 核心目录结构

```
react-basic/
├── public/
│   ├── content/              # 笔记内容
│   │   ├── noteList_s.json
│   │   └── *.html
│   └── music/                # 音乐文件
│       ├── musicList.json
│       └── music list/
├── src/
│   ├── components/
│   │   ├── Weather/          # 天气组件
│   │   ├── Calendar/         # 日历组件
│   │   ├── MusicPlayer/      # 音乐播放器
│   │   ├── DiagramEditor/    # 流程图编辑器（新增）⭐
│   │   ├── CodeBlock.js      # 代码块组件（新增）⭐
│   │   ├── FloatingToolbar.js # 浮动工具栏（新增）⭐
│   │   ├── Showcase/         # 展示窗
│   │   ├── Layout/           # 布局组件
│   │   └── UI/               # 通用UI组件库（新增）⭐
│   ├── pages/
│   │   ├── Home/             # 首页
│   │   ├── Note/             # 笔记系统
│   │   │   ├── NoteHome.js   # 笔记首页
│   │   │   ├── NoteEditor.js # 笔记编辑器
│   │   │   └── NoteView.js   # 笔记查看
│   │   ├── Music/            # 音乐页面
│   │   ├── Portfolio/        # 作品集
│   │   └── Products/         # 产品
│   ├── context/              # 全局状态
│   │   ├── ThemeContext.js   # 主题管理
│   │   └── I18nContext.js    # 国际化
│   ├── utils/                # 工具函数
│   │   └── lrcParser.js      # 歌词解析器（新增）⭐
│   └── App.js                # 主应用
└── package.json
```

## 🎯 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 天气 + 日历 + 展示窗 |
| `/notes` | 笔记首页 | 笔记列表和分类 |
| `/notes/editor` | 笔记编辑器 | 创建新笔记 |
| `/notes/view/:id` | 笔记查看 | 查看笔记详情 |
| `/music` | 音乐库 | 音乐管理和播放 |
| `/portfolio` | 作品集 | 项目和技能展示 |
| `/products` | 产品 | 产品展示 |
| `/classic` | 经典首页 | 学习教程 |

## 📝 笔记系统使用

### 创建笔记
```
1. 访问 /notes
2. 点击"写笔记"按钮
3. 选择分类（生活/随笔/算法）
4. 使用Markdown语法编写内容
5. 点击"保存笔记"
6. 笔记立即显示在首页（保存到localStorage）
```

### Markdown语法支持
- `# 标题` - 各级标题
- `**粗体**` `*斜体*` - 文本样式
- ` ``` 代码块 ``` ` - 代码高亮
- `- 列表` - 有序/无序列表
- `> 引用` - 引用块
- `[链接](url)` - 链接

### 永久保存（可选）
复制弹窗中的JSON数据，添加到 `public/content/noteList_s.json` 文件中。

## 🎵 音乐系统使用

### 添加音乐

#### 方式1: 自动生成（推荐）
```bash
# 1. 创建歌曲文件夹
mkdir "public/music/music list/歌曲名"

# 2. 放置音频文件和封面
# 将MP3文件和jpg封面放入文件夹

# 3. 运行自动生成工具
npm run generate-music-metadata

# 完成！所有配置文件自动生成
```

#### 方式2: 手动配置
1. 在 `music list/` 下创建歌曲文件夹
2. 放置音频、封面、歌词等文件
3. 手动编辑 `musicList.json` 和 `metadata.json`

### 文件夹结构
```
music list/童话镇/
├── 童话镇.mp3       # 音频文件（必需）
├── cover.jpg        # 封面图片（可选）
├── lyrics.lrc       # 歌词（可选）
├── metadata.json    # 元数据（自动生成）
└── timestamps.json  # 时间戳（自动生成）
```

## 🌤️ 天气系统

- 当前使用模拟数据
- 支持城市切换（6个城市）
- 可集成真实天气API（参见 `src/components/Weather/API_INTEGRATION_GUIDE.md`）

## 🎨 主题和国际化

### 主题切换
- 明亮主题 / 暗黑主题
- 自动保存偏好设置
- 全站响应主题变化

### 多语言支持
- 中文 / English
- 导航栏语言切换
- 本地存储语言偏好

## 💻 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 生产构建
npm run build

# 工具脚本
npm run generate-music-metadata  # 生成音乐元数据
npm run generate-file-structure  # 生成文件结构
npm run generate-home-content    # 生成首页内容

# 部署到GitHub Pages
npm run deploy
```

## 🎯 特色功能详解

### 音乐播放器
- ✅ 专业文件夹结构
- ✅ 完整元数据支持
- ✅ LRC歌词同步显示
- ✅ 封面图片显示
- ✅ 自动化配置工具
- ✅ 最小化时显示封面

### 笔记系统
- ✅ 三大笔记分类
- ✅ Markdown完整渲染
- ✅ LocalStorage即时保存
- ✅ 代码高亮 + 一键复制（新增）⭐
- ✅ 流程图/思维导图绘制（新增）⭐
- ✅ 浮动工具栏（可自定义位置）（新增）⭐
- ✅ 字体大小调整（5种级别）（新增）⭐
- ✅ 搜索筛选功能
- ✅ 标签管理系统
- ✅ 编辑和删除功能

### 天气系统
- ✅ 完整天气信息
- ✅ 24小时预报
- ✅ 5天预报
- ✅ 生活指数
- ✅ 空气质量
- ✅ 日出日落

## 📱 响应式设计

### 桌面端（≥1024px）
- 天气系统：2/3 宽度
- 日历系统：1/3 宽度
- 笔记网格：3列
- 音乐卡片：4列

### 移动端（<1024px）
- 垂直堆叠布局
- 全宽显示
- 触摸优化

## 🎊 项目亮点

### 设计
- 🎨 现代化UI设计
- 🌈 丰富的颜色系统
- ✨ 流畅的过渡动画
- 🌙 完整的暗黑模式

### 功能
- 🎵 专业级音乐系统
- 📝 实用的笔记系统
- 🌤️ 实时天气显示
- 📅 便捷的日历管理

### 技术
- ⚡ React最佳实践
- 🎯 组件化设计
- 🧩 统一通用组件库（UI Library）
- 📱 完美响应式
- 🌐 国际化支持

## 🚀 快速开始

```bash
# 克隆项目
git clone [repository-url]

# 进入目录
cd react-basic

# 安装依赖
npm install

# 启动开发服务器
npm start

# 访问
http://localhost:3000
```

## 📚 文档

### 笔记系统
- `FLOATING_TOOLBAR_GUIDE.md` - 浮动工具栏使用指南（新增）⭐
- `FONT_SIZE_FEATURE.md` - 字体大小调整说明（新增）⭐
- `DIAGRAM_FEATURE_QUICKSTART.md` - 流程图快速开始（新增）⭐
- `src/components/DiagramEditor/README.md` - 流程图组件文档（新增）⭐
- `CODE_BLOCK_FEATURE.md` - 代码块功能说明（新增）⭐
- `src/pages/Note/FINAL_GUIDE.md` - 笔记系统完整指南

### 音乐系统
- `public/music/QUICK_ADD_MUSIC.md` - 音乐快速添加指南
- `src/utils/lrcParser.js` - 歌词解析器

### 其他
- `src/components/Weather/README.md` - 天气系统说明
- `PROJECT_SUMMARY.md` - 项目完整总结
- `HOW_TO_FIND_FEATURES.md` - 功能位置指南（新增）⭐

## 🌟 静态网站特性

- ✅ 无需后端服务器
- ✅ 可部署到GitHub Pages
- ✅ 数据通过JSON管理
- ✅ LocalStorage本地存储
- ✅ 完全静态化

## 🎯 未来扩展

- 🔄 集成真实天气API
- 🔄 笔记云同步
- 🔄 音乐在线源
- 🔄 评论系统集成
- 🔄 更多主题选项

## 📝 License

MIT License

## 👨‍💻 作者

Jihui

## 🎉 最新更新（v3.0.0）

### 笔记系统重大升级
- ✨ **流程图/思维导图绘制** - 可视化你的想法
  - 流程图模式（蓝色矩形）
  - 思维导图模式（紫色圆形）
  - 拖拽式编辑，所见即所得
  - 小地图导航，控制器工具
  
- ✨ **浮动工具栏** - 随时随地快速操作
  - 可自定义位置（左/右/底部）
  - 一键添加图表
  - 快速插入代码/表格/列表/引用
  - 悬停提示，动画效果
  
- ✨ **代码高亮增强** - 专业的代码展示
  - oneDark主题，深色背景
  - 悬停显示复制按钮
  - 一键复制代码
  - 支持100+种编程语言
  
- ✨ **字体大小调整** - 个性化阅读体验
  - 5种字体级别（小/默认/中/大/特大）
  - 实时调整，即时生效
  - 查看和编辑模式均支持

---

**最后更新**: 2024-10-13  
**版本**: 3.0.0  
**状态**: ✅ 生产就绪 - 笔记系统全面升级

## 📝 变更追踪（v3.1.0）

### 通用UI组件库落地与页面统一
- 新增 `src/components/UI/` 组件库，并补充 `UI/README.md`
- 统一替换以下页面/组件，使用通用组件：
  - `src/pages/Note/NoteHome.js`（操作栏、分类标签、统计卡片、笔记卡片、空状态）
  - `src/pages/Note/NoteView.js`（返回/缩放/编辑/删除按钮、内容卡片、分类徽章）
  - `src/pages/Music/Music.js`（功能卡片与占位卡片）
  - `src/pages/Music/SimpleTextRecorder.js`（按钮、卡片、文本域、伸缩预览、空状态）
  - `src/components/FileManager/FileManager.js`（容器卡片、工具栏按钮）

### 音乐模块当前形态
- 保留“简单文本记录”主流程（下载到单一TXT）
- 去除AI与本地存储依赖，播放器暂为占位

### 目录结构更新
- 在 README 的目录结构中新增 `src/components/UI/`

---

最后更新: 2025-10-30  
版本: 3.1.0  
状态: ✅ 通用组件库落地，主要页面完成替换
