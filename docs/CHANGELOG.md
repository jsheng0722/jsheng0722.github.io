# 更新日志

## [3.0.0] - 2024-10-13

### ✨ 重大新增功能

#### 🎨 流程图/思维导图系统
- ✅ 添加React Flow库支持
- ✅ 创建DiagramEditor组件（全屏流程图编辑器）
- ✅ 创建DiagramViewer组件（只读查看器）
- ✅ 支持两种模式：
  - 流程图模式（蓝色矩形节点）
  - 思维导图模式（紫色圆形节点）
- ✅ 完整的节点操作：
  - 添加节点
  - 拖动移动节点
  - 双击编辑节点文字
  - 删除节点（Delete键）
  - 节点连线（拖动边缘圆点）
- ✅ 画布控制：
  - 小地图导航
  - 缩放控制器
  - 平移和缩放
  - 背景网格
- ✅ 图表嵌入笔记
- ✅ 数据保存到localStorage

#### 🎯 浮动工具栏
- ✅ 创建FloatingToolbar组件
- ✅ 可自定义位置：
  - 左侧
  - 右侧（默认）
  - 底部
- ✅ 集成多个快捷功能：
  - 📊 添加/编辑图表
  - </> 插入代码块
  - 📊 插入表格
  - ≡ 插入列表
  - " 插入引用
- ✅ 动画效果：
  - 展开/收起动画
  - 悬停放大效果
  - 按钮依次弹出
- ✅ 徽章标记（已添加图表时显示✓）
- ✅ 悬停提示标签

#### 💻 代码高亮增强
- ✅ 安装react-syntax-highlighter
- ✅ 创建CodeBlock组件
- ✅ 使用oneDark主题（深色背景，清晰文字）
- ✅ 代码复制功能：
  - 悬停显示复制按钮
  - 点击复制到剪贴板
  - 复制反馈提示（"已复制"）
  - 2秒后恢复默认状态
- ✅ 支持100+种编程语言
- ✅ 语法高亮效果
- ✅ 圆角边框和美化样式

#### 📏 字体大小调整
- ✅ 5种字体级别：
  - 小 (prose-sm)
  - 默认 (prose-base)
  - 中 (prose-lg)
  - 大 (prose-xl)
  - 特大 (prose-2xl)
- ✅ 实时调整功能
- ✅ 笔记查看页面支持
- ✅ 编辑器预览模式支持
- ✅ 智能禁用（达到极限时）
- ✅ 图标和文字提示
- ✅ 灰色圆角控制器

### 🔧 技术改进

#### 新增依赖
- reactflow - 流程图和思维导图库
- react-syntax-highlighter - 代码高亮库
- @tailwindcss/typography - 文本排版插件

#### 新增组件
- `src/components/DiagramEditor/DiagramEditor.js` - 流程图编辑器
- `src/components/DiagramEditor/DiagramViewer.js` - 流程图查看器
- `src/components/FloatingToolbar.js` - 浮动工具栏
- `src/components/FloatingActionButton.js` - 浮动按钮
- `src/components/CodeBlock.js` - 代码块组件

#### 新增工具函数
- `src/utils/lrcParser.js` - LRC歌词解析器

#### 组件更新
- `src/pages/Note/NoteEditor.js` - 集成流程图、浮动工具栏、字体调整
- `src/pages/Note/NoteView.js` - 集成流程图显示、代码复制、字体调整
- `tailwind.config.js` - 添加typography插件

### 📚 文档新增
- `FLOATING_TOOLBAR_GUIDE.md` - 浮动工具栏完整指南
- `FONT_SIZE_FEATURE.md` - 字体大小调整说明
- `DIAGRAM_FEATURE_QUICKSTART.md` - 流程图快速开始
- `CODE_BLOCK_FEATURE.md` - 代码块功能说明
- `HOW_TO_FIND_FEATURES.md` - 功能位置指南
- `FIND_DIAGRAM_BUTTON_GUIDE.md` - 图表按钮查找指南
- `TEST_BUTTON_VISIBILITY.html` - 按钮位置可视化测试页面
- `src/components/DiagramEditor/README.md` - 流程图组件文档

### 🎨 用户体验改进
- ✅ 添加图表按钮现在有3个位置（顶部、浮动工具栏、可自定义）
- ✅ 代码块文字清晰可见（oneDark主题）
- ✅ 一键复制代码功能
- ✅ 字体大小可调整，适应不同阅读场景
- ✅ 流程图可视化思维过程
- ✅ 浮动工具栏不遮挡内容
- ✅ 动画效果提升交互体验

### 🐛 问题修复
- ✅ 修复代码块灰色背景+白色文字看不清的问题
- ✅ 修复图表按钮位置不明显的问题
- ✅ 修复字体大小无法调整的问题
- ✅ 修复模板字符串未正确关闭的语法错误

---

## [2.0.0] - 2024-10-12

### ✨ 新增功能

#### 笔记系统
- ✅ 全新笔记系统设计
- ✅ 三大分类（生活、随笔、LeetCode）
- ✅ Markdown编辑器和实时预览
- ✅ 标签管理系统
- ✅ 搜索和筛选功能
- ✅ LocalStorage即时保存

#### 音乐系统
- ✅ 固定侧边栏播放器
- ✅ LRC歌词同步显示
- ✅ 音乐库管理页面
- ✅ 结构化音乐文件夹
- ✅ 自动化元数据生成工具

#### 首页重构
- ✅ 天气系统（2/3宽度）
- ✅ 紧凑日历（1/3宽度）
- ✅ 展示窗轮播

#### 主题系统
- ✅ Context API状态管理
- ✅ 明亮/暗黑主题切换
- ✅ 国际化支持（中/英）

---

## [1.0.0] - 初始版本

### ✨ 基础功能
- ✅ React项目初始化
- ✅ 路由系统
- ✅ 基础页面布局
- ✅ Tailwind CSS集成
- ✅ 响应式设计

---

## 版本说明

### 版本号规则
- **主版本号** - 重大功能变更
- **次版本号** - 新功能添加
- **修订号** - Bug修复和小改进

### 当前版本：3.0.0
- 笔记系统全面升级
- 流程图/思维导图功能
- 浮动工具栏系统
- 代码高亮增强
- 字体调整功能

### 下一步计划（v3.1.0）
- [ ] 笔记导出功能（PDF/Markdown）
- [ ] 更多图表类型（UML、时序图）
- [ ] 快捷键支持
- [ ] 笔记标签云
- [ ] 笔记归档功能
