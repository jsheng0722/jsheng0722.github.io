# 可视化工具包 (Visualization Toolkit)

## 概述

解析 Python 风格代码中的 class/def 与顶层调用，在 ReactFlow 画布上展示：结构卡片、参数输入、数据流连线、按算法模式选择的动态可视化，以及**右侧调用树侧边栏**与**点击定位到指定调用**。

## 功能概览

| 功能 | 说明 |
|------|------|
| 结构解析 | `codeParser` 解析 class/def、body 缩进、顶层 `print(fn(...))` 调用 |
| 数据流 | 解析 `print(solution(...))` 等调用链，连线显示返回值 → 参数 |
| 多组调用 | 多次 `print(solution(...))` 按「调用 1、调用 2…」分组展示步骤 |
| 调用树侧边栏 | 右侧树形菜单列出所有顶层调用（如 print → solution），按先后顺序标号 |
| 定位聚焦 | 点击侧边栏某项：画布视口对准对应定义或「调用 N」块，缩放上限 0.9 避免过大 |

## 算法模式与组件

根据方法体自动选择可视化组件：

| 代码结构 | 模式 | 组件 |
|----------|------|------|
| 赋值中含 sorted/min/max/sum/len/float | `step_execution` | StepByStepViz |
| 嵌套双循环（内层缩进大于外层） | `double_loop` | DoubleLoopViz |
| 单循环 + if/elif/else | `loop_with_condition` | LoopWithConditionViz |
| 单循环 | `single_loop` | SingleLoopViz |
| 仅条件（if/elif/else，无循环） | `condition_only` | LoopWithConditionViz |
| 其他 | `generic` | GenericFallback |

**通用约定**：上述组件均执行方法体（algorithmSteps 支持 if/elif/else 分支）并上报 return（onReturnValue + 显示 return 块），供「内层先算、再赋给外层」数据流使用。

- **algorithmPatterns.js**：根据 `method.body`（含缩进）检测模式。
- **VizComponents/**：通用组件目录，可扩展更多算法。

## 文件职责

| 文件 | 职责 |
|------|------|
| `codeParser.js` | 解析代码：`parseCodeStructure`、`parsePrintExpressions`；产出 structure（含 callSiteArgs、topLevelPrintCalls、callTree）、dataFlow |
| `algorithmPatterns.js` | 检测算法模式 → step_execution / double_loop / loop_with_condition / single_loop / condition_only / generic |
| `algorithmSteps.js` | 步骤执行：执行方法体、产出 loop_enter/assign/return 等步骤（供 StepByStepViz） |
| `expressionEvaluator.js` | 表达式求值（range、min、max、sorted 等），供 algorithmSteps 使用 |
| `VisualizationToolkit.js` | ReactFlow 画布、单节点、传入 data（structure、code、scrollToMethodKey、onCenterView）、右侧 CallTreeSidebar |
| `CodeStructureNode.js` | 渲染 class/def 卡片、参数输入、数据流连线、print 输出；处理 scrollToMethodKey#runIndex 定位与 onCenterView |
| `CallTreeSidebar.js` | 右侧调用树：树形展示顶层调用，点击传 scrollKey#callIndex 用于定位 |
| `DynamicMethodVisualization.js` | 按 pattern 分发到 VizComponents（含 StepByStepViz 的 scrollToRunIndex、onCenterView） |
| `VizComponents/` | StepByStepViz、SingleLoopViz、DoubleLoopViz、LoopWithConditionViz、GenericFallback；共享：formatValue、EmptyVizMessage、ListItemCard、parseParams |

## 使用

- **独立页面**：如 `/visualization`，左侧代码、右侧画布 + 调用树侧边栏。
- **内嵌**：将 `VisualizationToolkitWithReactFlow` 作为子组件，传入 `initialCode`。
