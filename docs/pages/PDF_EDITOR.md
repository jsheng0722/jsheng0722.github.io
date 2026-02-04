# PDF 编辑功能说明

## 概述

PDF 模块提供本地 PDF 列表、上传、预览与编辑能力。编辑页基于 Canvas 渲染（pdfjs-dist），支持添加文字/签名、高亮、马赛克，并可将修改保存回 PDF（pdf-lib + IndexedDB）。

## 目录结构

```
src/pages/Pdf/
├── PdfEditorPage.js   # 编辑页：画布、工具栏、文本框、画笔叠加层
├── PdfPage.js         # 列表页：上传、列表、下载、删除、进入编辑
├── pdfStorage.js      # IndexedDB 存取（getAll / add / getById / update / remove）
├── pdfConstants.js    # 画布/文本框/画笔/光标等常量
└── pdfUtils.js        # 工具函数：颜色、像素化、字号、签名渲染
```

## 功能列表

| 功能 | 说明 |
|------|------|
| 列表与上传 | 从列表选择文件进入编辑；支持多选上传，同名自动加 (1)、(2) 等后缀 |
| 预览 | 使用 pdfjs-dist 在固定尺寸画布（850×1150）上渲染当前页 |
| 缩放 | 工具栏缩放 50%～300%，画布整体 scale 显示 |
| 页码 | 多页时上一页/下一页，显示 当前页/总页数 |
| 添加文字 | 在画布上拖拽放置文本框，支持多行；可切换为「签名字体」 |
| 高亮 | 画笔模式：竖向高亮笔光标，可调颜色，笔画半透明叠加 |
| 马赛克 | 画笔模式：竖向网格光标，拖拽区域做像素块打码 |
| 保存 | 有文字/签名或高亮/马赛克时显示「保存修改」；保存后写入 PDF 并清空叠加层 |

## 常量与工具（通用化）

- **pdfConstants.js**：`CANVAS_W/H`、文本框布局（`DRAG_BAR_H`、`FIRST_LINE_*` 等）、文本框尺寸（`MIN_BOX_W/H`、`DEFAULT_BOX_*`）、画笔（`HIGHLIGHT_BRUSH_SIZE`、`MOSAIC_*`）、光标（`CURSOR_HIGHLIGHT`、`CURSOR_MOSAIC`）、`EMBED_PAGE_SCALE`。
- **pdfUtils.js**：`hexToRgba`、`pixelateImageData`、`fontSizePxFromBox`、`contentRectHeightPx`、`renderSignatureToPng`、`HIGHLIGHT_ALPHA`。签名渲染依赖 `SIGNATURE_FONT` 等常量（从 pdfConstants 引入）。

## 通用 UI 组件（PDF 相关用法）

以下组件在 `src/components/UI` 中，可供其他页面复用：

| 组件 | 用途 |
|------|------|
| **ColorPicker** | 高亮颜色选择，基于 `input[type="color"]`，支持 `value`/`onChange`、`title`、`size`。 |
| **IconToggleButton** | 仅图标的切换按钮，`active` + `onClick(nextActive)`，取消选中时自动失焦；用于高亮/马赛克工具切换。 |
| **Button** | 返回、缩放、页码、添加文字、保存等。 |

## 编辑页数据流简述

1. **文件与 PDF 文档**：`fileId` 来自路由 state → `pdfStorage.getById` 取文件 → `file.blob` 用 pdfjs 打开得到 `pdfDoc`，渲染当前页到 `canvasRef`。
2. **文本框**：`pendingItems` 存待写入项（含 position、size、mode、page）；`textBoxOpen` 时显示可拖拽/缩放的输入框，确认后推入 `pendingItems`。
3. **高亮/马赛克**：`highlightStrokes` / `mosaicStrokes` 按页码存笔画数组；`currentStroke` 为当前正在画的一笔；叠加层在 `overlayRef` 的 canvas 上绘制，并读取主画布做马赛克。
4. **保存**：有 `pendingItems` 或任意页有笔画即 `hasEdits`。保存时：对「有笔画」的页用 pdfjs 渲染 → 画高亮/马赛克 → 若有该页的 pending 文字/签名也画到同一画布 → 仅取「页面内容矩形」生成 PNG 以 `EMBED_PAGE_SCALE` 倍分辨率嵌入 pdf-lib 对应页；其余页仅处理 pending 文字/签名；最后 `pdfStorage.update`、清空 `pendingItems` 与笔画。

## 保存与画质

- 只嵌入「实际页面区域」（fitOffset + viewport），避免每次保存累积上下左右空白。
- 嵌入图分辨率为页面尺寸的 `EMBED_PAGE_SCALE` 倍（默认 2），减轻模糊。

## 路由与入口

- 列表：`/pdf`（PdfPage）。
- 编辑：`/pdf/editor`，需通过 `navigate('/pdf/editor', { state: { fileId } })` 传入 `fileId`。

## 依赖

- `pdfjs-dist`：渲染 PDF 到 Canvas。
- `pdf-lib`：加载/修改 PDF、写入文字与嵌入图片。
- 无后端：文件与 blob 存于浏览器 IndexedDB（pdfStorage）。
