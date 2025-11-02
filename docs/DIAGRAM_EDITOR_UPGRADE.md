# 图形编辑器升级说明

## 📊 升级概述

已将原有的"流程图/思维导图编辑器"升级为"自由图形编辑器"，实现了类似 draw.io、Excalidraw 等专业绘图工具的功能。

---

## 🔄 核心变化对比

### 旧版本（流程图/思维导图模式）

**界面布局：**
- 标题：流程图编辑器 / 思维导图编辑器
- 工具栏：两个模式切换按钮 + 添加节点按钮
- 节点样式：预设固定（蓝色方形 vs 紫色圆形）

**操作流程：**
1. 选择模式（流程图 or 思维导图）
2. 点击"添加节点"
3. 节点样式由当前模式决定
4. 无法自由选择形状和颜色

**限制：**
- ❌ 只能在两种预设样式间切换
- ❌ 无法混用不同形状
- ❌ 颜色固定，不可更改
- ❌ 缺少基本绘图工具的灵活性

---

### 新版本（自由图形编辑器）

**界面布局：**
- 标题：图形编辑器
- 工具栏：
  - 形状选择器（6种图形）
  - 颜色选择器（7种颜色）
  - 连接线提示
- 简化的状态栏

**操作流程：**
1. 选择想要的图形类型
2. （可选）选择颜色
3. 点击图形按钮添加
4. 自由组合各种形状和颜色

**优势：**
- ✅ 6种基本图形可选
- ✅ 7种颜色可自定义
- ✅ 自由组合图形和颜色
- ✅ 工具栏直观，操作简便
- ✅ 更像专业绘图工具

---

## 🎨 新增功能详解

### 1. 多样化图形

| 图形 | 图标 | 用途 | 实现方式 |
|------|------|------|----------|
| 矩形 | 🟦 | 流程步骤、文本框 | CSS 圆角矩形 |
| 圆形 | ⚪ | 开始/结束节点 | SVG Circle |
| 菱形 | 🔷 | 决策点 | SVG Polygon |
| 三角形 | 🔺 | 方向指示 | SVG Polygon |
| 星形 | ⭐ | 重点标记 | SVG Polygon |
| 文本 | 📝 | 纯文本标签 | 无背景 Div |

### 2. 颜色系统

```javascript
const colors = [
  蓝色: #60a5fa / #3b82f6
  紫色: #a78bfa / #7c3aed
  绿色: #34d399 / #10b981
  红色: #f87171 / #ef4444
  黄色: #fbbf24 / #f59e0b
  粉色: #f472b6 / #ec4899
  灰色: #9ca3af / #6b7280
]
```

每种颜色包含：
- `bg`: 填充颜色
- `border`: 边框颜色（也用于连接线）

### 3. 自定义节点组件

创建了 6 个专门的节点组件：
- `RectangleNode` - 矩形节点
- `CircleNode` - 圆形节点
- `DiamondNode` - 菱形节点
- `TriangleNode` - 三角形节点
- `StarNode` - 星形节点
- `TextNode` - 文本节点

**技术亮点：**
- 使用 SVG 精确绘制复杂形状
- 统一的连接点（Handle）系统
- 支持文字居中显示
- 颜色通过 props 动态传递

---

## 📝 代码结构变化

### 文件组织

**新增文件：**
```
src/components/DiagramEditor/
├── CustomNodes.js              ← 新增：自定义节点组件
├── DiagramEditor.js            ← 重构：主编辑器
├── DiagramViewer.js            ← 更新：查看器
└── SHAPE_EDITOR_GUIDE.md      ← 新增：使用指南
```

### 关键代码改动

#### 1. DiagramEditor.js

**移除：**
- `diagramType` 状态（flowchart/mindmap）
- `switchToFlowchart()` 函数
- `switchToMindmap()` 函数
- 复杂的 `shapeStyles` 配置

**新增：**
- `selectedColor` 状态
- `showColorPicker` 状态
- 简化的 `addShape(shapeType)` 函数
- 导入 `nodeTypes` 自定义组件

**重构：**
```javascript
// 旧版
const addNode = () => {
  // 根据 diagramType 决定样式
  style: {
    background: diagramType === 'mindmap' ? '#8b5cf6' : '#60a5fa',
    borderRadius: diagramType === 'mindmap' ? '50%' : '8px',
    // ...更多固定样式
  }
}

// 新版
const addShape = (shapeType) => {
  const newNode = {
    type: shapeType,  // 直接使用图形类型
    data: { 
      color: selectedColor.bg,
      borderColor: selectedColor.border,
    }
  }
}
```

#### 2. CustomNodes.js（全新文件）

```javascript
// 每个图形都是独立的 React 组件
export function CircleNode({ data, isConnectable }) {
  return (
    <div>
      <Handle type="target" position={Position.Top} />
      <svg width="120" height="120">
        <circle
          cx="60" cy="60" r="50"
          fill={data.color}
          stroke={data.borderColor}
        />
        <text>{data.label}</text>
      </svg>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

#### 3. DiagramViewer.js

**更新：**
```javascript
// 添加 nodeTypes 支持
import { nodeTypes } from './CustomNodes';

<ReactFlow
  nodeTypes={nodeTypes}  // ← 新增
  // ...其他props
/>
```

---

## 🎯 用户体验改进

### 操作步骤对比

**旧版流程（5步）：**
1. 打开编辑器
2. 选择模式（流程图/思维导图）
3. 点击"添加节点"
4. （如果需要不同样式）切换模式
5. 再次添加节点

**新版流程（3步）：**
1. 打开编辑器
2. 选择图形 + 颜色
3. 点击添加

**效率提升：** ~40%

### 界面优化

**旧版：**
- 工具按钮分散
- 模式切换不直观
- 底部有冗余的帮助信息

**新版：**
- 工具栏集中在顶部
- 图形按钮带悬停提示
- 颜色选择器可视化
- 简洁的状态栏显示统计信息

---

## 🔧 技术实现细节

### 1. SVG 图形绘制

**圆形：**
```jsx
<circle cx="60" cy="60" r="50" fill={color} />
```

**菱形：**
```jsx
<polygon points="60,10 110,60 60,110 10,60" fill={color} />
```

**三角形：**
```jsx
<polygon points="50,10 90,90 10,90" fill={color} />
```

**星形：**
```jsx
<polygon points="60,10 73,45 110,45 80,68 93,103 60,82 27,103 40,68 10,45 47,45" />
```

### 2. ReactFlow 集成

```javascript
// 注册自定义节点类型
const nodeTypes = {
  rectangle: RectangleNode,
  circle: CircleNode,
  diamond: DiamondNode,
  triangle: TriangleNode,
  star: StarNode,
  text: TextNode,
};

// 使用
<ReactFlow nodeTypes={nodeTypes} />
```

### 3. 数据结构

```javascript
// 节点数据结构
{
  id: "node_1234567890",
  type: "circle",  // 图形类型
  data: {
    label: "双击编辑",
    color: "#60a5fa",
    borderColor: "#3b82f6"
  },
  position: { x: 250, y: 150 }
}

// 边数据结构
{
  id: "edge_xxx",
  source: "node_1",
  target: "node_2",
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { 
    stroke: "#3b82f6", 
    strokeWidth: 2 
  }
}
```

---

## 📊 功能完整性检查

| 功能 | 旧版 | 新版 | 状态 |
|------|------|------|------|
| 添加节点 | ✅ | ✅ | 保持 |
| 编辑文字 | ✅ | ✅ | 保持 |
| 连接节点 | ✅ | ✅ | 保持 |
| 移动节点 | ✅ | ✅ | 保持 |
| 删除元素 | ✅ | ✅ | 保持 |
| 缩放画布 | ✅ | ✅ | 保持 |
| 保存/加载 | ✅ | ✅ | 保持 |
| 多种图形 | ❌ | ✅ | **新增** |
| 自定义颜色 | ❌ | ✅ | **新增** |
| 模式切换 | ✅ | ➖ | 移除（不再需要） |

---

## 🚀 性能优化

1. **减少重渲染：** 使用 `useCallback` 优化连接函数
2. **简化状态：** 移除 `diagramType`，减少状态复杂度
3. **SVG 性能：** 使用原生 SVG，无额外依赖
4. **自定义节点：** 仅渲染必要的 DOM 元素

---

## ✅ 测试检查清单

- [x] 所有图形都能正常添加
- [x] 颜色选择器工作正常
- [x] 连接线能正确创建
- [x] 文字编辑功能正常
- [x] 保存和加载功能正常
- [x] DiagramViewer 能正确显示
- [x] 无 Linter 错误
- [x] 响应式布局正常
- [x] 暗色模式兼容

---

## 📚 相关文档

- `SHAPE_EDITOR_GUIDE.md` - 使用指南
- `图形编辑器使用说明.md` - 详细说明
- `DiagramEditor/CustomNodes.js` - 技术文档（代码注释）

---

## 🎉 总结

通过这次升级，图形编辑器从"预设模式"转变为"自由绘图工具"，大大提升了灵活性和易用性。用户现在可以：

1. 🎨 自由选择6种图形
2. 🌈 自定义7种颜色
3. 🔗 灵活组合元素
4. ✏️ 快速创建图表

**这是一个从"模式驱动"到"工具驱动"的重大改进！**

