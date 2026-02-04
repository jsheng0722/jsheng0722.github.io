/**
 * PDF 编辑页工具函数
 * 颜色、像素化、字号与内容区高度、签名渲染等
 */

import {
  DRAG_BAR_H,
  BOTTOM_BAR_H,
  CONTENT_LINES,
  TEXT_LINE_HEIGHT,
  CONTENT_PADDING_V,
  SIGNATURE_FONT,
  MOSAIC_CELL_SIZE,
} from './pdfConstants';

export const HIGHLIGHT_ALPHA = 0.45;

/** hex 转 rgba 字符串 */
export function hexToRgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return `rgba(${r},${g},${b},${alpha})`;
}

/** 对 ImageData 做马赛克（按 cellSize 块取色） */
export function pixelateImageData(imageData, cellSize = MOSAIC_CELL_SIZE) {
  const { data, width, height } = imageData;
  for (let y = 0; y < height; y += cellSize) {
    for (let x = 0; x < width; x += cellSize) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      for (let dy = 0; dy < cellSize && y + dy < height; dy++) {
        for (let dx = 0; dx < cellSize && x + dx < width; dx++) {
          const i = ((y + dy) * width + (x + dx)) * 4;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = a;
        }
      }
    }
  }
}

/** 根据文本框高度计算字号（px） */
export function fontSizePxFromBox(boxH) {
  const midH = Math.max(20, boxH - DRAG_BAR_H - BOTTOM_BAR_H);
  return Math.max(10, Math.min(56, Math.round(midH * 0.32)));
}

/** 根据文本框高度计算内容区高度（px） */
export function contentRectHeightPx(boxH) {
  return Math.round(fontSizePxFromBox(boxH) * TEXT_LINE_HEIGHT * CONTENT_LINES) + CONTENT_PADDING_V;
}

/** 将签名字符串渲染为 PNG 的 Uint8Array */
export async function renderSignatureToPng(text, fontSizePx) {
  const fontSpec = `${Math.max(12, fontSizePx)}px ${SIGNATURE_FONT}`;
  try {
    await Promise.race([
      document.fonts.load(fontSpec),
      new Promise((_, reject) => setTimeout(() => reject(new Error('font load timeout')), 3000)),
    ]);
  } catch (e) {
    console.warn('签名字体加载超时或失败，使用备用渲染', e);
  }
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontSizePx}px ${SIGNATURE_FONT}`;
  const metrics = ctx.measureText(text);
  const padding = fontSizePx * 0.5;
  const w = Math.ceil(metrics.width + padding * 2) || 100;
  const h = Math.ceil(fontSizePx * 1.5 + padding * 2) || 50;
  canvas.width = w;
  canvas.height = h;
  ctx.font = `${fontSizePx}px ${SIGNATURE_FONT}`;
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, padding, h / 2);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('toBlob failed'));
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => resolve(new Uint8Array(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(blob);
      },
      'image/png',
      1
    );
  });
}
