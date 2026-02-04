/**
 * PDF 编辑页常量
 * 画布尺寸、文本框布局、画笔与光标、保存嵌入倍数等
 */

// 画布尺寸（与预览一致）
export const CANVAS_W = 850;
export const CANVAS_H = 1150;

// 文本框布局
export const CONTENT_LINES = 1;
export const DRAG_BAR_H = 20;
export const BOTTOM_BAR_H = 20;
export const CONTENT_BORDER = 1;
export const CONTENT_PAD = 6;
export const FIRST_LINE_INSET_LEFT = CONTENT_BORDER + CONTENT_PAD;
export const FIRST_LINE_INSET_TOP = CONTENT_BORDER + CONTENT_PAD;
export const FIRST_LINE_LEADING_RATIO = 0.28;
export const SIGNATURE_ASCENT_RATIO = 0.8;
export const TEXT_LINE_HEIGHT = 1.35;
export const CONTENT_PADDING_V = 12;

// 文本框尺寸
export const MIN_BOX_W = 60;
export const MIN_BOX_H = 66;
export const MAX_BOX_W = 520;
export const MAX_BOX_H = 280;
export const DEFAULT_BOX_W = 120;
export const DEFAULT_BOX_H = 72;
export const SIGNATURE_FONT = '"Dancing Script", cursive';

// 高亮与马赛克
export const HIGHLIGHT_BRUSH_SIZE = 18;
export const MOSAIC_BRUSH_PADDING = 12;
export const MOSAIC_CELL_SIZE = 8;
export const HIGHLIGHT_ALPHA = 0.45;
/** 保存时嵌入整页图的分辨率倍数，避免画质模糊 */
export const EMBED_PAGE_SCALE = 2;

// 高亮笔光标：竖向条，热点在中心
export const CURSOR_HIGHLIGHT =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect x='13' y='2' width='6' height='28' rx='2' ry='2' fill='%23fef08a' stroke='%239ca3af' stroke-width='1'/%3E%3C/svg%3E\") 16 16, crosshair";
// 马赛克笔光标：竖向条带网格线，热点在中心
export const CURSOR_MOSAIC =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect x='13' y='2' width='6' height='28' rx='2' ry='2' fill='%23e5e7eb' stroke='%236b7280' stroke-width='1'/%3E%3Cline x1='13' y1='10' x2='19' y2='10' stroke='%236b7280' stroke-width='0.8'/%3E%3Cline x1='13' y1='16' x2='19' y2='16' stroke='%236b7280' stroke-width='0.8'/%3E%3Cline x1='13' y1='22' x2='19' y2='22' stroke='%236b7280' stroke-width='0.8'/%3E%3C/svg%3E\") 16 16, crosshair";
