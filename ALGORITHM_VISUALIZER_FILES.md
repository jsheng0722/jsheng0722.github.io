# 算法可视化系统文件位置说明

## 📁 主要文件位置

算法可视化系统的所有文件都位于：

```
src/components/AlgorithmVisualizer/
```

## 📂 文件结构

### 核心文件

1. **`AlgorithmVisualizer.js`** - 主组件
   - 算法可视化的入口组件
   - 管理播放控制、步骤跟踪、函数选择等
   - 位置：`src/components/AlgorithmVisualizer/AlgorithmVisualizer.js`

2. **`codeExecutor.js`** - 代码执行器 ⭐ **主要执行逻辑**
   - 执行 JavaScript 和 Python 代码
   - 跟踪每一步的状态变化
   - 捕获数组访问、比较、交换等操作
   - 位置：`src/components/AlgorithmVisualizer/codeExecutor.js`
   - **这是你准备更新的核心文件**

3. **`codeParser.js`** - 代码解析器
   - 解析代码结构
   - 提取函数定义

4. **`languageDetector.js`** - 语言检测器
   - 自动检测代码语言（JavaScript/Python）

5. **`parameterExtractor.js`** - 参数提取器
   - 从代码中提取函数参数
   - 支持 JavaScript 和 Python

### 可视化器组件

位于 `src/components/AlgorithmVisualizer/visualizers/` 文件夹：

1. **`ArrayVisualizer.js`** - 数组可视化
   - 显示数组操作的可视化
   - 高亮当前操作的元素

2. **`SortVisualizer.js`** - 排序可视化
   - 排序算法的可视化展示
   - 显示比较、交换、已排序区域

3. **`TreeVisualizer.js`** - 树结构可视化
   - 二叉树、BST 等树结构的可视化

4. **`LinkedListVisualizer.js`** - 链表可视化
   - 链表结构的可视化展示

5. **`FunctionBlock.js`** - 函数块组件
   - 显示函数调用的可视化

## 🎯 准备更新的文件

根据你的需求，主要需要关注的文件是：

### 核心执行逻辑
- **`src/components/AlgorithmVisualizer/codeExecutor.js`** (850行)
  - 这是代码执行和步骤跟踪的核心文件
  - 包含执行逻辑、状态跟踪、步骤生成等

### 主组件
- **`src/components/AlgorithmVisualizer/AlgorithmVisualizer.js`**
  - 如果需要修改 UI 或交互逻辑，更新这个文件

### 可视化器
- **`src/components/AlgorithmVisualizer/visualizers/`** 下的各个文件
  - 如果需要修改可视化效果，更新对应的可视化器

## 📚 相关文档

- `src/components/AlgorithmVisualizer/README.md` - 使用说明
- `src/components/AlgorithmVisualizer/REQUIREMENTS.md` - 需求文档
- `src/components/AlgorithmVisualizer/IMPLEMENTATION_PLAN.md` - 实现计划

## 💡 使用建议

1. **更新执行逻辑**：主要修改 `codeExecutor.js`
2. **更新可视化效果**：修改对应的可视化器文件
3. **更新 UI 交互**：修改 `AlgorithmVisualizer.js`
4. **添加新的可视化类型**：在 `visualizers/` 文件夹中创建新文件

## 🔗 相关组件

- `src/components/StayingFunVisualization/` - StayingFun 可视化组件（外部链接嵌入）

