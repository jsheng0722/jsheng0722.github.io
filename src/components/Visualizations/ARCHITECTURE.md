# 代码可视化架构

## 数据流

```
左侧代码 (code)
    ↓
codeParser.parseCodeStructure(code)
    → structure: { classes, functions, dataFlow, dataFlowWarnings, callSiteArgs, topLevelPrintCalls, callTree }
    → method.body 每项带 indent
    ↓
VisualizationToolkit 把 structure、code、scrollToMethodKey、onCenterView 传给 CodeStructureNode (data)
    ↓
CodeStructureNode 渲染 class/def、参数输入、数据流连线、print 输出
    → getParam(methodKey, paramName, runIndex)：userEditedParamValues ?? callSiteArgs[runIndex] ?? ''
    → getRuns(methodKey)：callSiteArgs[methodKey] 转为数组（支持多组调用）
    → getParamEffective：若参数被数据流连线，显示上游返回值；否则 getParam
    ↓
DynamicMethodVisualization: detectAlgorithmPattern(body) → pattern
    → 按 pattern 分发到 VizComponents（含 StepByStepViz 的 scrollToRunIndex、onCenterView）
```

## 调用树与定位

- **callTree**：`buildCallTreeFromCode(code, structure)` 解析顶层调用（如 `print(solution(...))`），构建树形结构；每节点含 `key`、`displayName`、`scrollKey`（如 `fn.solution`）、`callIndex`（第几次顶层调用）。
- **侧边栏**：CallTreeSidebar 展示 callTree，点击传 `scrollKey#callIndex`（如 `fn.solution#1`）给 `onSelectMethod`。
- **定位**：CodeStructureNode 解析 `scrollToMethodKey` 为 (methodKey, runIndex)。若无 runIndex：滚动到方法卡片并 `onCenterView(卡片 el)`；若有 runIndex：只做卡片内 scrollIntoView，由 StepByStepViz 对「调用 N」块做 scrollIntoView + `onCenterView(块 el)`。VisualizationToolkit 的 `onCenterView(el)` 用 `screenToFlowPosition` + `setCenter` 将画布中心对准 el，并限制 zoom ≤ 0.9。

## 涉及文件

| 文件 | 职责 |
|------|------|
| `codeParser.js` | parseCodeStructure（body 带 indent）、parsePrintExpressions、callSiteArgs、topLevelPrintCalls、callTree、dataFlow、dataFlowWarnings。 |
| `algorithmPatterns.js` | 根据 body 检测模式：step_execution、double_loop、loop_with_condition、single_loop、condition_only、generic。 |
| `algorithmSteps.js` | 执行方法体、产出步骤（loop_enter/loop_iter/assign/return 等），供 StepByStepViz。 |
| `expressionEvaluator.js` | 表达式求值（range、min、max、sorted 等）。 |
| `VisualizationToolkit.js` | ReactFlow 画布、单节点、onCenterView（setCenter + screenToFlowPosition + zoom 上限）、CallTreeSidebar。 |
| `CodeStructureNode.js` | 渲染 class/def、参数、数据流连线、print 输出；scrollToMethodKey#runIndex 解析与 onCenterView 传递。 |
| `CallTreeSidebar.js` | 调用树 UI，点击传 scrollKey#callIndex。 |
| `DynamicMethodVisualization.js` | 按 pattern 分发到 VizComponents。 |
| `VizComponents/` | 各算法组件；StepByStepViz 支持 multiRun、scrollToRunIndex、onCenterView(runBlock)。 |

## 可选功能

- **dataFlow + returnValues + SVG 连线**：当代码为 `print(solution(...))` 时，把 solution 的返回值显示到 print 的参数/输出。
- **dataFlowWarnings**：解析不到调用目标时的提示。
- **parsePrintExpressions**：根据方法体中的 `print(...)` 动态显示 print 输出。

## 已移除

- ConnectionSystem、VisualizationModal、VisualizationFloatingMenu、VisualizationCodeContext 已删除。
