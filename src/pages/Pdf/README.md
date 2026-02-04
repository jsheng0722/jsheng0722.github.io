# PDF 模块

- **PdfPage.js**：列表、上传（同名自动加 (1)/(2)）、下载、删除、进入编辑。
- **PdfEditorPage.js**：画布预览、缩放/页码、文字/签名、高亮/马赛克、保存。
- **pdfStorage.js**：IndexedDB 存取（getAll / add / getById / update / remove）。
- **pdfConstants.js**：画布尺寸、文本框、画笔、光标、嵌入倍数等常量。
- **pdfUtils.js**：hexToRgba、pixelateImageData、fontSizePxFromBox、contentRectHeightPx、renderSignatureToPng。

通用 UI：`ColorPicker`、`IconToggleButton` 见 `src/components/UI`。  
详细说明见 `docs/pages/PDF_EDITOR.md`。
