/**
 * 图像处理工具：翻转、旋转、马赛克等（Canvas 实现）
 */

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = typeof src === 'string' ? src : URL.createObjectURL(src);
  });
}

/**
 * 翻转/旋转：horizontal, vertical 为 boolean；rotate 为 0|90|180|270
 */
export function applyFlipRotate(imageSource, options = {}) {
  const { horizontal = false, vertical = false, rotate = 0 } = options;
  return loadImage(imageSource).then((img) => {
    const deg = Number(rotate) || 0;
    const w = deg === 90 || deg === 270 ? img.height : img.width;
    const h = deg === 90 || deg === 270 ? img.width : img.height;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.translate(w / 2, h / 2);
    ctx.rotate((deg * Math.PI) / 180);
    ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
    ctx.translate(-img.width / 2, -img.height / 2);
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/png');
  });
}

/**
 * 马赛克：region 为 { x, y, w, h } 比例 0-1 或像素；pixelSize 马赛克块大小
 */
export function applyMosaic(imageSource, region, pixelSize = 8) {
  return loadImage(imageSource).then((img) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const iw = img.width;
    const ih = img.height;
    let x = region.x != null ? (region.x <= 1 ? region.x * iw : region.x) : 0;
    let y = region.y != null ? (region.y <= 1 ? region.y * ih : region.y) : 0;
    let w = region.w != null ? (region.w <= 1 ? region.w * iw : region.w) : iw;
    let h = region.h != null ? (region.h <= 1 ? region.h * ih : region.h) : ih;
    x = Math.max(0, Math.floor(x));
    y = Math.max(0, Math.floor(y));
    w = Math.min(iw - x, Math.ceil(w));
    h = Math.min(ih - y, Math.ceil(h));
    const block = Math.max(2, Math.min(pixelSize, Math.min(w, h)));
    const imageData = ctx.getImageData(x, y, w, h);
    const data = imageData.data;
    for (let py = 0; py < h; py += block) {
      for (let px = 0; px < w; px += block) {
        const idx = (py * w + px) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];
        for (let by = 0; by < block && py + by < h; by++) {
          for (let bx = 0; bx < block && px + bx < w; bx++) {
            const i = ((py + by) * w + (px + bx)) * 4;
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
            data[i + 3] = a;
          }
        }
      }
    }
    ctx.putImageData(imageData, x, y);
    return canvas.toDataURL('image/png');
  });
}

/**
 * 在已有 Canvas 2D 上下文的矩形区域内做马赛克（笔刷涂抹用）
 */
export function pixelateRectOnContext(ctx, x, y, w, h, pixelSize = 8) {
  const canvas = ctx.canvas;
  const cw = canvas.width;
  const ch = canvas.height;
  x = Math.max(0, Math.floor(x));
  y = Math.max(0, Math.floor(y));
  w = Math.min(cw - x, Math.ceil(w));
  h = Math.min(ch - y, Math.ceil(h));
  if (w <= 0 || h <= 0) return;
  const block = Math.max(2, Math.min(pixelSize, Math.min(w, h)));
  const imageData = ctx.getImageData(x, y, w, h);
  const data = imageData.data;
  for (let py = 0; py < h; py += block) {
    for (let px = 0; px < w; px += block) {
      const idx = (py * w + px) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      for (let by = 0; by < block && py + by < h; by++) {
        for (let bx = 0; bx < block && px + bx < w; bx++) {
          const i = ((py + by) * w + (px + bx)) * 4;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = a;
        }
      }
    }
  }
  ctx.putImageData(imageData, x, y);
}

/**
 * 将图片绘制到指定最大边长的 canvas，返回 { canvas }（用于笔刷编辑）
 */
export function createCanvasFromImageUrl(imageUrl, maxEdge = 1400) {
  return loadImage(imageUrl).then((img) => {
    let w = img.naturalWidth || img.width;
    let h = img.naturalHeight || img.height;
    const scale = Math.min(1, maxEdge / Math.max(w, h));
    w = Math.round(w * scale);
    h = Math.round(h * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    return canvas;
  });
}

/**
 * 去水印占位：当前为对区域模糊（简单方框模糊），后续可接入 AI
 */
export function applyRemoveWatermark(imageSource, region) {
  return loadImage(imageSource).then((img) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const iw = img.width;
    const ih = img.height;
    let x = region.x != null ? (region.x <= 1 ? region.x * iw : region.x) : 0;
    let y = region.y != null ? (region.y <= 1 ? region.y * ih : region.y) : 0;
    let w = region.w != null ? (region.w <= 1 ? region.w * iw : region.w) : iw * 0.2;
    let h = region.h != null ? (region.h <= 1 ? region.h * ih : region.h) : ih * 0.1;
    x = Math.max(0, Math.floor(x));
    y = Math.max(0, Math.floor(y));
    w = Math.min(iw - x, Math.ceil(w));
    h = Math.min(ih - y, Math.ceil(h));
    const imageData = ctx.getImageData(x, y, w, h);
    const data = imageData.data;
    const radius = 4;
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        let r = 0, g = 0, b = 0, n = 0;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const ny = Math.max(0, Math.min(h - 1, py + dy));
            const nx = Math.max(0, Math.min(w - 1, px + dx));
            const i = (ny * w + nx) * 4;
            r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
          }
        }
        const i = (py * w + px) * 4;
        data[i] = r / n;
        data[i + 1] = g / n;
        data[i + 2] = b / n;
      }
    }
    ctx.putImageData(imageData, x, y);
    return canvas.toDataURL('image/png');
  });
}
