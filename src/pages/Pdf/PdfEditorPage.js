import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PDFDocument, StandardFonts } from 'pdf-lib/dist/pdf-lib.esm.js';
import * as pdfjsLib from 'pdfjs-dist';
import PageLayout from '../../components/Layout/PageLayout';
import { Button, ColorPicker, IconToggleButton } from '../../components/UI';
import { FaArrowLeft, FaSearchMinus, FaSearchPlus, FaFont, FaSignature, FaCheck, FaTimes, FaSave, FaChevronLeft, FaChevronRight, FaHighlighter, FaThLarge } from 'react-icons/fa';
import * as pdfStorage from './pdfStorage';
import {
  CANVAS_W,
  CANVAS_H,
  DRAG_BAR_H,
  BOTTOM_BAR_H,
  CONTENT_PAD,
  CONTENT_BORDER,
  FIRST_LINE_INSET_LEFT,
  FIRST_LINE_INSET_TOP,
  FIRST_LINE_LEADING_RATIO,
  SIGNATURE_ASCENT_RATIO,
  TEXT_LINE_HEIGHT,
  SIGNATURE_FONT,
  MIN_BOX_W,
  MIN_BOX_H,
  MAX_BOX_W,
  MAX_BOX_H,
  DEFAULT_BOX_W,
  DEFAULT_BOX_H,
  HIGHLIGHT_BRUSH_SIZE,
  MOSAIC_BRUSH_PADDING,
  MOSAIC_CELL_SIZE,
  EMBED_PAGE_SCALE,
  CURSOR_HIGHLIGHT,
  CURSOR_MOSAIC,
} from './pdfConstants';
import {
  hexToRgba,
  pixelateImageData,
  fontSizePxFromBox,
  contentRectHeightPx,
  renderSignatureToPng,
  HIGHLIGHT_ALPHA,
} from './pdfUtils';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

function PdfEditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileId = location.state?.fileId;
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [textBoxOpen, setTextBoxOpen] = useState(false);
  const [textBoxPosition, setTextBoxPosition] = useState({ x: 0.5, y: 0.5 });
  const [textBoxSize, setTextBoxSize] = useState({ width: DEFAULT_BOX_W, height: DEFAULT_BOX_H });
  const [textBoxValue, setTextBoxValue] = useState('');
  const [textBoxContent, setTextBoxContent] = useState('text');
  const [textBoxPage, setTextBoxPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [pendingItems, setPendingItems] = useState([]);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [canvasLoading, setCanvasLoading] = useState(false);
  const [canvasError, setCanvasError] = useState(null);
  const nextPendingIdRef = useRef(0);
  const editedBlobRef = useRef(null);
  const placeContainerRef = useRef(null);
  const scrollWrapRef = useRef(null);
  const canvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [scrollWrapSize, setScrollWrapSize] = useState({ w: 0, h: 0 });
  const [brushMode, setBrushMode] = useState(null);
  const [highlightColor, setHighlightColor] = useState('#FFEB3B');
  const [highlightStrokes, setHighlightStrokes] = useState({});
  const [mosaicStrokes, setMosaicStrokes] = useState({});
  const [currentStroke, setCurrentStroke] = useState(null);
  const [pdfRenderedAt, setPdfRenderedAt] = useState(0);
  const overlayRef = useRef(null);
  const highlightStrokesRef = useRef({});
  const mosaicStrokesRef = useRef({});
  const drawingRef = useRef(null);
  const drawingStrokeRef = useRef(null);
  const dragStartRef = useRef(null);
  const resizeStartRef = useRef(null);
  const textBoxSizeRef = useRef(textBoxSize);
  const textBoxPositionRef = useRef(textBoxPosition);
  highlightStrokesRef.current = highlightStrokes;
  mosaicStrokesRef.current = mosaicStrokes;
  textBoxSizeRef.current = textBoxSize;
  textBoxPositionRef.current = textBoxPosition;

  useEffect(() => {
    if (!textBoxOpen) return;
    const halfW = (textBoxSize.width / CANVAS_W) / 2;
    const halfH = (textBoxSize.height / CANVAS_H) / 2;
    const minX = halfW;
    const maxX = 1 - halfW;
    const minY = halfH;
    const maxY = 1 - halfH;
    setTextBoxPosition((prev) => {
      const x = clamp(minX, maxX, prev.x);
      const y = clamp(minY, maxY, prev.y);
      if (x !== prev.x || y !== prev.y) return { x, y };
      return prev;
    });
  }, [textBoxOpen, textBoxSize.width, textBoxSize.height]);

  useEffect(() => {
    if (!fileId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    pdfStorage
      .getById(fileId)
      .then((row) => {
        if (cancelled) return;
        if (!row) {
          setFile(null);
          return;
        }
        setFile({ ...row });
        editedBlobRef.current = row.blob || null;
        setPendingItems([]);
      })
      .catch(() => {
        if (!cancelled) setFile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [fileId]);

  useEffect(() => {
    if (!file?.blob) {
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy?.();
        pdfDocRef.current = null;
      }
      setPdfDoc(null);
      setNumPages(0);
      setCurrentPage(1);
      setCanvasError(null);
      return;
    }
    let cancelled = false;
    setCanvasLoading(true);
    setCanvasError(null);
    file.blob
      .arrayBuffer()
      .then((arrayBuffer) => pdfjsLib.getDocument({ data: arrayBuffer }).promise)
      .then((doc) => {
        if (cancelled) {
          doc.destroy?.();
          return;
        }
        if (pdfDocRef.current) {
          pdfDocRef.current.destroy?.();
        }
        pdfDocRef.current = doc;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setCurrentPage(1);
      })
      .catch((err) => {
        if (!cancelled) setCanvasError(err?.message || 'PDF 加载失败');
      })
      .finally(() => {
        if (!cancelled) setCanvasLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [file?.blob]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pdfDoc || currentPage < 1 || currentPage > numPages) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = async () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
      try {
        const page = await pdfDoc.getPage(currentPage);
        const v = page.getViewport({ scale: 1 });
        const pageW = v.width;
        const pageH = v.height;
        const fitScale = Math.min(CANVAS_W / pageW, CANVAS_H / pageH);
        const viewport = page.getViewport({ scale: fitScale });
        const offsetX = (CANVAS_W - viewport.width) / 2;
        const offsetY = (CANVAS_H - viewport.height) / 2;

        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.save();
        ctx.translate(offsetX, offsetY);
        const task = page.render({
          canvasContext: ctx,
          viewport,
          background: 'rgb(255,255,255)',
        });
        renderTaskRef.current = task;
        await task.promise;
        renderTaskRef.current = null;
        setPdfRenderedAt((n) => n + 1);
      } catch (e) {
        if (e?.name !== 'RenderingCancelledException') {
          setCanvasError(e?.message || '渲染失败');
        }
      } finally {
        ctx.restore();
      }
    };
    render();
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, currentPage, numPages]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const pdfCanvas = canvasRef.current;
    if (!overlay || !pdfCanvas) return;
    const ctx = overlay.getContext('2d');
    const pdfCtx = pdfCanvas.getContext('2d');
    if (!ctx || !pdfCtx) return;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    const hStrokes = highlightStrokesRef.current[currentPage] || [];
    ctx.strokeStyle = hexToRgba(highlightColor, HIGHLIGHT_ALPHA);
    ctx.lineWidth = HIGHLIGHT_BRUSH_SIZE;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const stroke of hStrokes) {
      if (stroke.points.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      ctx.stroke();
    }
    if (currentStroke?.mode === 'highlight' && currentStroke.points.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(currentStroke.points[0].x, currentStroke.points[0].y);
      for (let i = 1; i < currentStroke.points.length; i++) ctx.lineTo(currentStroke.points[i].x, currentStroke.points[i].y);
      ctx.stroke();
    }
    const mStrokes = mosaicStrokesRef.current[currentPage] || [];
    for (const stroke of mStrokes) {
      if (stroke.points.length < 2) continue;
      const xs = stroke.points.map((p) => p.x);
      const ys = stroke.points.map((p) => p.y);
      const minX = Math.max(0, Math.floor(Math.min(...xs)) - MOSAIC_BRUSH_PADDING);
      const minY = Math.max(0, Math.floor(Math.min(...ys)) - MOSAIC_BRUSH_PADDING);
      const maxX = Math.min(CANVAS_W, Math.ceil(Math.max(...xs)) + MOSAIC_BRUSH_PADDING);
      const maxY = Math.min(CANVAS_H, Math.ceil(Math.max(...ys)) + MOSAIC_BRUSH_PADDING);
      const w = maxX - minX;
      const h = maxY - minY;
      if (w <= 0 || h <= 0) continue;
      try {
        const imageData = pdfCtx.getImageData(minX, minY, w, h);
        pixelateImageData(imageData, MOSAIC_CELL_SIZE);
        ctx.putImageData(imageData, minX, minY);
      } catch (_) {}
    }
    if (currentStroke?.mode === 'mosaic' && currentStroke.points.length >= 2) {
      const xs = currentStroke.points.map((p) => p.x);
      const ys = currentStroke.points.map((p) => p.y);
      const minX = Math.max(0, Math.floor(Math.min(...xs)) - MOSAIC_BRUSH_PADDING);
      const minY = Math.max(0, Math.floor(Math.min(...ys)) - MOSAIC_BRUSH_PADDING);
      const maxX = Math.min(CANVAS_W, Math.ceil(Math.max(...xs)) + MOSAIC_BRUSH_PADDING);
      const maxY = Math.min(CANVAS_H, Math.ceil(Math.max(...ys)) + MOSAIC_BRUSH_PADDING);
      const w = maxX - minX;
      const h = maxY - minY;
      if (w > 0 && h > 0) {
        try {
          const imageData = pdfCtx.getImageData(minX, minY, w, h);
          pixelateImageData(imageData, MOSAIC_CELL_SIZE);
          ctx.putImageData(imageData, minX, minY);
        } catch (_) {}
      }
    }
  }, [currentPage, highlightStrokes, mosaicStrokes, currentStroke, highlightColor, pdfRenderedAt]);

  const getCanvasCoords = useCallback((e) => {
    const el = overlayRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null || rect.width <= 0 || rect.height <= 0) return null;
    return {
      x: ((clientX - rect.left) * CANVAS_W) / rect.width,
      y: ((clientY - rect.top) * CANVAS_H) / rect.height,
    };
  }, []);

  const startBrushStroke = useCallback(
    (e) => {
      if (!brushMode || textBoxOpen) return;
      e.preventDefault();
      const pt = getCanvasCoords(e);
      if (!pt) return;
      drawingRef.current = true;
      drawingStrokeRef.current = { mode: brushMode, points: [pt] };
      setCurrentStroke({ mode: brushMode, points: [pt] });
    },
    [brushMode, textBoxOpen, getCanvasCoords]
  );

  const moveBrushStroke = useCallback(
    (e) => {
      if (!drawingRef.current) return;
      const pt = getCanvasCoords(e);
      if (!pt) return;
      e.preventDefault();
      const stroke = drawingStrokeRef.current;
      if (!stroke) return;
      stroke.points.push(pt);
      setCurrentStroke({ mode: stroke.mode, points: [...stroke.points] });
    },
    [getCanvasCoords]
  );

  const endBrushStroke = useCallback(() => {
    if (!drawingRef.current) return;
    const stroke = drawingStrokeRef.current;
    drawingRef.current = null;
    drawingStrokeRef.current = null;
    setCurrentStroke(null);
    if (!stroke || stroke.points.length < 2) return;
    const page = currentPage;
    const points = stroke.points;
    if (stroke.mode === 'highlight') {
      setHighlightStrokes((s) => ({ ...s, [page]: [...(s[page] || []), { points }] }));
    } else {
      setMosaicStrokes((s) => ({ ...s, [page]: [...(s[page] || []), { points }] }));
    }
  }, [currentPage]);

  useEffect(() => {
    if (!brushMode || !currentStroke) return;
    const handleMove = (e) => moveBrushStroke(e);
    const handleEnd = () => endBrushStroke();
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [brushMode, currentStroke, moveBrushStroke, endBrushStroke]);

  const updateFileBlob = (newBlob) => {
    if (!file) return;
    setFile((prev) => (prev ? { ...prev, blob: newBlob } : null));
  };

  const openTextBox = useCallback(() => {
    setTextBoxOpen(true);
    setTextBoxPage(currentPage);
    setTextBoxPosition({ x: 0.5, y: 0.5 });
    setTextBoxSize({ width: DEFAULT_BOX_W, height: DEFAULT_BOX_H });
    setTextBoxValue('');
    setTextBoxContent('text');
  }, [currentPage]);

  const closeTextBox = useCallback(() => {
    setTextBoxOpen(false);
  }, []);

  const clamp = (min, max, v) => Math.max(min, Math.min(max, v));

  const startDrag = useCallback((e) => {
    if (resizeStartRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    dragStartRef.current = {
      startClientX: e.clientX ?? e.touches?.[0]?.clientX,
      startClientY: e.clientY ?? e.touches?.[0]?.clientY,
      startPosX: textBoxPosition.x,
      startPosY: textBoxPosition.y,
    };
  }, [textBoxPosition]);

  const startResize = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    resizeStartRef.current = {
      startClientX: e.clientX ?? e.touches?.[0]?.clientX,
      startClientY: e.clientY ?? e.touches?.[0]?.clientY,
      startW: textBoxSize.width,
      startH: textBoxSize.height,
    };
  }, [textBoxSize]);

  const onPointerMove = useCallback((e) => {
    e.preventDefault();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX == null) return;
    const el = placeContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    if (resizeStartRef.current) {
      const r = resizeStartRef.current;
      const dw = (clientX - r.startClientX) / rect.width * CANVAS_W;
      const dh = (clientY - r.startClientY) / rect.height * CANVAS_H;
      setTextBoxSize(() => ({
        width: clamp(MIN_BOX_W, MAX_BOX_W, r.startW + dw),
        height: clamp(MIN_BOX_H, MAX_BOX_H, r.startH + dh),
      }));
      return;
    }
    const d = dragStartRef.current;
    if (!d) return;
    const dx = (clientX - d.startClientX) / rect.width;
    const dy = (clientY - d.startClientY) / rect.height;
    const sz = textBoxSizeRef.current;
    const halfW = (sz.width / CANVAS_W) / 2;
    const halfH = (sz.height / CANVAS_H) / 2;
    const minX = halfW;
    const maxX = 1 - halfW;
    const minY = halfH;
    const maxY = 1 - halfH;
    setTextBoxPosition(() => ({
      x: clamp(minX, maxX, d.startPosX + dx),
      y: clamp(minY, maxY, d.startPosY + dy),
    }));
  }, []);

  const onPointerEnd = useCallback(() => {
    dragStartRef.current = null;
    resizeStartRef.current = null;
  }, []);

  useEffect(() => {
    if (!textBoxOpen) return;
    const handleMove = (e) => onPointerMove(e);
    const handleEnd = () => {
      onPointerEnd();
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [textBoxOpen, onPointerMove, onPointerEnd]);

  useEffect(() => {
    const el = scrollWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setScrollWrapSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [file]);

  const handleConfirm = () => {
    const text = (textBoxValue || '').trim();
    if (!text) return;
    const pos = textBoxPositionRef.current;
    const sz = textBoxSizeRef.current;
    const id = nextPendingIdRef.current++;
    setPendingItems((prev) => [
      ...prev,
      { id, text, position: { x: pos.x, y: pos.y }, size: { width: sz.width, height: sz.height }, mode: textBoxContent, page: textBoxPage },
    ]);
    closeTextBox();
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));

  const hasBrushEdits =
    Object.keys(highlightStrokes).some((p) => (highlightStrokes[p]?.length || 0) > 0) ||
    Object.keys(mosaicStrokes).some((p) => (mosaicStrokes[p]?.length || 0) > 0);
  const hasEdits = pendingItems.length > 0 || hasBrushEdits;

  const handleSave = async () => {
    const sourceBlob = editedBlobRef.current ?? file?.blob;
    if (!sourceBlob || !fileId || !hasEdits) return;
    setSaving(true);
    try {
      const arrayBuffer = await sourceBlob.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);
      const pages = doc.getPages();
      const contentW = CANVAS_W;
      const contentH = CANVAS_H;

      const brushPages = new Set();
      Object.keys(highlightStrokes).forEach((p) => {
        if ((highlightStrokes[p]?.length || 0) > 0) brushPages.add(Number(p));
      });
      Object.keys(mosaicStrokes).forEach((p) => {
        if ((mosaicStrokes[p]?.length || 0) > 0) brushPages.add(Number(p));
      });

      if (brushPages.size > 0) {
        const pdfjsDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 0; i < pages.length; i++) {
          const pageNum = i + 1;
          if (!brushPages.has(pageNum)) continue;
          const page = pages[i];
          const pw = page.getWidth();
          const ph = page.getHeight();
          const fitScale = Math.min(contentW / pw, contentH / ph);
          const fitOffsetX = (contentW - pw * fitScale) / 2;
          const fitOffsetY = (contentH - ph * fitScale) / 2;

          const pdfPage = await pdfjsDoc.getPage(pageNum);
          const viewport = pdfPage.getViewport({ scale: fitScale });
          const cvs = document.createElement('canvas');
          cvs.width = contentW;
          cvs.height = contentH;
          const cctx = cvs.getContext('2d');
          cctx.fillStyle = 'rgb(255,255,255)';
          cctx.fillRect(0, 0, contentW, contentH);
          cctx.save();
          cctx.translate(fitOffsetX, fitOffsetY);
          await pdfPage.render({ canvasContext: cctx, viewport, background: 'rgb(255,255,255)' }).promise;
          cctx.restore();

          const hStrokes = highlightStrokes[pageNum] || [];
          cctx.strokeStyle = hexToRgba(highlightColor, HIGHLIGHT_ALPHA);
          cctx.lineWidth = HIGHLIGHT_BRUSH_SIZE;
          cctx.lineCap = 'round';
          cctx.lineJoin = 'round';
          for (const stroke of hStrokes) {
            if (stroke.points.length < 2) continue;
            cctx.beginPath();
            cctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let k = 1; k < stroke.points.length; k++) cctx.lineTo(stroke.points[k].x, stroke.points[k].y);
            cctx.stroke();
          }
          const mStrokes = mosaicStrokes[pageNum] || [];
          for (const stroke of mStrokes) {
            if (stroke.points.length < 2) continue;
            const xs = stroke.points.map((p) => p.x);
            const ys = stroke.points.map((p) => p.y);
            const minX = Math.max(0, Math.floor(Math.min(...xs)) - MOSAIC_BRUSH_PADDING);
            const minY = Math.max(0, Math.floor(Math.min(...ys)) - MOSAIC_BRUSH_PADDING);
            const maxX = Math.min(contentW, Math.ceil(Math.max(...xs)) + MOSAIC_BRUSH_PADDING);
            const maxY = Math.min(contentH, Math.ceil(Math.max(...ys)) + MOSAIC_BRUSH_PADDING);
            const w = maxX - minX;
            const h = maxY - minY;
            if (w <= 0 || h <= 0) continue;
            try {
              const imageData = cctx.getImageData(minX, minY, w, h);
              pixelateImageData(imageData, MOSAIC_CELL_SIZE);
              cctx.putImageData(imageData, minX, minY);
            } catch (_) {}
          }

          const pagePendingItems = pendingItems.filter((item) => item.page === pageNum);
          for (const item of pagePendingItems) {
            const pos = item.position;
            const sz = item.size;
            const firstLineLeftPx = pos.x * CANVAS_W - sz.width / 2 + FIRST_LINE_INSET_LEFT;
            const contentBoxTopPx = pos.y * CANVAS_H - sz.height / 2 + DRAG_BAR_H + FIRST_LINE_INSET_TOP;
            const fontSizePx = fontSizePxFromBox(sz.height);
            const firstLineVisibleTopPx = contentBoxTopPx + fontSizePx * FIRST_LINE_LEADING_RATIO;
            if (item.mode === 'text') {
              cctx.fillStyle = '#000000';
              cctx.font = `${fontSizePx}px Helvetica`;
              cctx.textBaseline = 'alphabetic';
              const ascentPx = fontSizePx * 0.73;
              const lineHeightPx = fontSizePx * TEXT_LINE_HEIGHT;
              const lines = (item.text || '').split(/\r?\n/);
              (lines.length ? lines : ['']).forEach((line, j) => {
                cctx.fillText(line, firstLineLeftPx, firstLineVisibleTopPx + ascentPx + j * lineHeightPx);
              });
            } else {
              try {
                const pngBytes = await renderSignatureToPng(item.text, fontSizePx);
                const blob = new Blob([pngBytes], { type: 'image/png' });
                const url = URL.createObjectURL(blob);
                const img = await new Promise((resolve, reject) => {
                  const im = new Image();
                  im.onload = () => {
                    URL.revokeObjectURL(url);
                    resolve(im);
                  };
                  im.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error('signature image load failed'));
                  };
                  im.src = url;
                });
                const sigRectW = sz.width - FIRST_LINE_INSET_LEFT * 2;
                const sigRectH = contentRectHeightPx(sz.height);
                const scale = Math.min(sigRectW / img.width, sigRectH / img.height, 1);
                const drawW = img.width * scale;
                const drawH = img.height * scale;
                const ascentPx = fontSizePx * SIGNATURE_ASCENT_RATIO;
                const sigTop = firstLineVisibleTopPx - drawH / 2 + ascentPx;
                const pad = Math.round(fontSizePx / 2);
                cctx.drawImage(img, firstLineLeftPx - pad, sigTop, drawW, drawH);
              } catch (_) {}
            }
          }

          const imgCanvas = document.createElement('canvas');
          const embedW = Math.round(pw * EMBED_PAGE_SCALE);
          const embedH = Math.round(ph * EMBED_PAGE_SCALE);
          imgCanvas.width = embedW;
          imgCanvas.height = embedH;
          const imgCtx = imgCanvas.getContext('2d');
          // 只嵌入实际页面区域（不含画布四周留白），避免每次保存累积空白
          imgCtx.drawImage(
            cvs,
            fitOffsetX,
            fitOffsetY,
            viewport.width,
            viewport.height,
            0,
            0,
            embedW,
            embedH
          );
          const pngBlob = await new Promise((res) => imgCanvas.toBlob((blob) => res(blob), 'image/png'));
          const pngBuf = await pngBlob.arrayBuffer();
          const pngImage = await doc.embedPng(new Uint8Array(pngBuf));
          page.drawImage(pngImage, { x: 0, y: 0, width: pw, height: ph });
        }
      }

      for (const item of pendingItems) {
        if (brushPages.has(item.page)) continue;
        const pageIndex = Math.max(0, Math.min(item.page - 1, pages.length - 1));
        const page = pages[pageIndex];
        const pw = page.getWidth();
        const ph = page.getHeight();
        const fitScale = Math.min(contentW / pw, contentH / ph);
        const fitOffsetX = (contentW - pw * fitScale) / 2;
        const fitOffsetY = (contentH - ph * fitScale) / 2;

        const pos = item.position;
        const sz = item.size;
        const firstLineLeftPx = pos.x * CANVAS_W - sz.width / 2 + FIRST_LINE_INSET_LEFT;
        const contentBoxTopPx = pos.y * CANVAS_H - sz.height / 2 + DRAG_BAR_H + FIRST_LINE_INSET_TOP;
        const textLeftPdf = Math.round((firstLineLeftPx - fitOffsetX) / fitScale);

        const pxToPdfTop = (px) => Math.round((px - fitOffsetY) / fitScale);

        if (item.mode === 'text') {
          const fontSizePx = fontSizePxFromBox(sz.height);
          const fontSizePdf = Math.round((fontSizePx * ph) / contentH);
          const firstLineVisibleTopPx = contentBoxTopPx + fontSizePx * FIRST_LINE_LEADING_RATIO;
          const textTopFromTopPdf = pxToPdfTop(firstLineVisibleTopPx);
          const font = doc.embedStandardFont(StandardFonts.Helvetica);
          const ascentPdf = font.heightAtSize(fontSizePdf, { descender: false });
          const lineHeightPdf = fontSizePdf * TEXT_LINE_HEIGHT;
          const lines = (item.text || '').split(/\r?\n/);
          const linesToDraw = lines.length ? lines : [''];
          linesToDraw.forEach((line, i) => {
            const lineTopFromTopPdf = textTopFromTopPdf + i * lineHeightPdf;
            const pdfYBaseline = ph - lineTopFromTopPdf - ascentPdf;
            page.drawText(line, {
              x: textLeftPdf,
              y: pdfYBaseline,
              size: fontSizePdf,
              font,
              color: { type: 'RGB', red: 0, green: 0, blue: 0 },
            });
          });
        } else {
          const fontSizePx = fontSizePxFromBox(sz.height);
          const firstLineVisibleTopPx = contentBoxTopPx + fontSizePx * FIRST_LINE_LEADING_RATIO;
          const textTopFromTopPdfSig = pxToPdfTop(firstLineVisibleTopPx);
          let pngBytes;
          try {
            pngBytes = await renderSignatureToPng(item.text, fontSizePx);
          } catch (err) {
            console.error('签名渲染失败', err);
            continue;
          }
          const image = await doc.embedPng(pngBytes);
          const boxW = Math.round((sz.width * pw) / contentW);
          const sigRectH = Math.round((contentRectHeightPx(sz.height) * ph) / contentH);
          const sigRectW = boxW - Math.round((FIRST_LINE_INSET_LEFT * 2 * pw) / contentW);
          const sigH = Math.max(10, sigRectH);
          const sigW = Math.max(10, sigRectW);
          const scaleNumW = Math.round((sigW * 1000) / image.width);
          const scaleNumH = Math.round((sigH * 1000) / image.height);
          const scaleNum = Math.min(scaleNumW, scaleNumH);
          const drawW = Math.round((image.width * scaleNum) / 1000);
          const drawH = Math.round((image.height * scaleNum) / 1000);
          const fontSizePdfSig = Math.round((fontSizePx * ph) / contentH);
          const ascentPdfSig = fontSizePdfSig * SIGNATURE_ASCENT_RATIO;
          const sigVisibleTopFromImageTop = drawH / 2 - ascentPdfSig;
          const pdfY = ph - textTopFromTopPdfSig - drawH + sigVisibleTopFromImageTop;
          const canvasLeftPaddingPx = Math.round(fontSizePx / 2);
          const signatureLeftPdf = textLeftPdf - (drawW > 0 ? Math.round((canvasLeftPaddingPx * drawW) / image.width) : 0);
          page.drawImage(image, { x: signatureLeftPdf, y: pdfY, width: drawW, height: drawH });
        }
      }

      const pdfBytes = await doc.save();
      const newBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      await pdfStorage.update(fileId, { blob: newBlob });
      updateFileBlob(newBlob);
      editedBlobRef.current = newBlob;
      setPendingItems([]);
      setHighlightStrokes({});
      setMosaicStrokes({});
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!fileId) {
    return (
      <PageLayout className="w-full max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-500 dark:text-gray-400 mb-4">请从 PDF 列表选择要编辑的文件</p>
        <Button onClick={() => navigate('/pdf')} icon={<FaArrowLeft />} iconPosition="left">
          返回 PDF 列表
        </Button>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout className="w-full max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-500 dark:text-gray-400">加载中…</p>
      </PageLayout>
    );
  }

  if (!file) {
    return (
      <PageLayout className="w-full max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-500 dark:text-gray-400 mb-4">未找到该 PDF</p>
        <Button onClick={() => navigate('/pdf')} icon={<FaArrowLeft />} iconPosition="left">
          返回 PDF 列表
        </Button>
      </PageLayout>
    );
  }

  const scaledW = Math.round(CANVAS_W * scale);
  const scaledH = Math.round(CANVAS_H * scale);
  const fits =
    (scrollWrapSize.w === 0 && scrollWrapSize.h === 0) ||
    (scrollWrapSize.w >= 32 && scrollWrapSize.h >= 32 && scaledW <= scrollWrapSize.w - 32 && scaledH <= scrollWrapSize.h - 32);

  return (
    <PageLayout className="flex flex-col w-full h-[calc(100vh-8rem)] max-w-7xl mx-auto px-4 py-4">
      <div className="sticky top-0 z-10 shrink-0 flex items-center gap-2 py-2 border-b border-gray-200 dark:border-gray-700 mb-4 flex-wrap bg-white dark:bg-gray-900 -mx-4 px-4 -mt-4 pt-4">
        <Button variant="ghost" size="small" icon={<FaArrowLeft />} onClick={() => navigate('/pdf')} title="返回列表" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]" title={file.name}>
          {file.name}
        </span>
        <div className="flex items-center gap-1 ml-2">
          <Button variant="ghost" size="small" icon={<FaSearchMinus />} onClick={zoomOut} title="缩小" />
          <span className="text-sm text-gray-500 dark:text-gray-400 min-w-[4rem] text-center">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="small" icon={<FaSearchPlus />} onClick={zoomIn} title="放大" />
        </div>
        {numPages > 1 && (
          <div className="flex items-center gap-0.5 ml-1">
            <Button
              variant="ghost"
              size="small"
              icon={<FaChevronLeft />}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              title="上一页"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 min-w-[4rem] text-center">
              {currentPage} / {numPages}
            </span>
            <Button
              variant="ghost"
              size="small"
              icon={<FaChevronRight />}
              onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
              disabled={currentPage >= numPages}
              title="下一页"
            />
          </div>
        )}
        <Button variant="ghost" size="small" icon={<FaFont />} onClick={openTextBox} title="添加文字">
          添加文字
        </Button>
        <span className="flex items-center gap-1">
          <IconToggleButton
            icon={<FaHighlighter />}
            active={brushMode === 'highlight'}
            onClick={(nextActive) => setBrushMode(nextActive ? 'highlight' : null)}
            title="高亮"
          />
          {brushMode === 'highlight' && (
            <ColorPicker
              value={highlightColor}
              onChange={setHighlightColor}
              title="高亮颜色"
              size={24}
            />
          )}
        </span>
        <IconToggleButton
          icon={<FaThLarge />}
          active={brushMode === 'mosaic'}
          onClick={(nextActive) => setBrushMode(nextActive ? 'mosaic' : null)}
          title="马赛克"
        />
        {hasEdits && (
          <Button
            variant="ghost"
            size="small"
            icon={<FaSave />}
            onClick={handleSave}
            disabled={saving}
            title="保存修改到本地（会刷新预览）"
            className="text-amber-600 dark:text-amber-400"
          >
            保存修改
          </Button>
        )}
      </div>

      <div
        ref={scrollWrapRef}
        className={`flex-1 min-h-0 flex overflow-auto bg-gray-200 dark:bg-gray-800 rounded-lg p-4 ${fits ? 'items-center justify-center' : 'items-start justify-start'}`}
      >
        <div
          style={{ width: scaledW, height: scaledH }}
          className="relative shadow-lg flex-shrink-0 overflow-hidden"
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: CANVAS_W,
              height: CANVAS_H,
              transform: `scale(${scale})`,
              transformOrigin: '0 0',
            }}
            className="relative bg-white dark:bg-gray-900"
          >
            {canvasLoading && !pdfDoc && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                加载 PDF…
              </div>
            )}
            {canvasError && (
              <div className="absolute inset-0 flex items-center justify-center text-red-600 dark:text-red-400 text-sm p-4 text-center">
                {canvasError}
              </div>
            )}
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="block w-full h-full"
              style={{ width: CANVAS_W, height: CANVAS_H }}
            />
          {(pendingItems.length > 0 || textBoxOpen) && (
            <div
              ref={textBoxOpen ? placeContainerRef : null}
              className="absolute inset-0"
              style={{ width: CANVAS_W, height: CANVAS_H, pointerEvents: 'auto' }}
            >
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="absolute rounded-lg overflow-hidden border border-amber-500/40 bg-amber-50/80 dark:bg-amber-900/30 pointer-events-none"
                  style={{
                    left: `${item.position.x * 100}%`,
                    top: `${item.position.y * 100}%`,
                    width: item.size.width,
                    height: item.size.height,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div
                    className="absolute left-0 right-0 overflow-hidden border border-amber-500/60 rounded box-border bg-white/30"
                    style={{
                      top: DRAG_BAR_H,
                      bottom: BOTTOM_BAR_H,
                      padding: CONTENT_PAD,
                      borderWidth: CONTENT_BORDER,
                      fontSize: `${fontSizePxFromBox(item.size.height)}px`,
                      lineHeight: TEXT_LINE_HEIGHT,
                      fontFamily: item.mode === 'signature' ? SIGNATURE_FONT : 'inherit',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {item.text || '—'}
                  </div>
                </div>
              ))}
              {textBoxOpen && (
              <div
                className="absolute rounded-lg"
                style={{
                  left: `${textBoxPosition.x * 100}%`,
                  top: `${textBoxPosition.y * 100}%`,
                  width: textBoxSize.width,
                  height: textBoxSize.height,
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(254, 249, 195, 0.72)',
                  border: '1px dashed rgba(245, 158, 11, 0.75)',
                  borderBottomStyle: 'solid',
                }}
              >
                <div
                  className="absolute left-0 right-0 top-0 flex items-center justify-end px-1 py-0.5 cursor-grab active:cursor-grabbing select-none border-b border-dashed border-amber-400/70"
                  style={{ height: DRAG_BAR_H }}
                  onMouseDown={startDrag}
                  onTouchStart={startDrag}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (textBoxContent === 'text') {
                        if (!textBoxValue.trim()) {
                          alert('请先输入文字');
                          return;
                        }
                        setTextBoxContent('signature');
                      } else {
                        setTextBoxContent('text');
                      }
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="p-0.5 rounded hover:bg-amber-500/30 text-amber-700 dark:text-amber-400"
                    title={textBoxContent === 'signature' ? '改回文字' : '转为签名字体'}
                  >
                    {textBoxContent === 'signature' ? (
                      <FaFont className="w-3 h-3" />
                    ) : (
                      <FaSignature className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <div
                  className="absolute left-0 right-0 overflow-hidden border border-amber-500/60 rounded bg-white/50 box-border"
                  style={{
                    top: DRAG_BAR_H,
                    bottom: BOTTOM_BAR_H,
                    minHeight: contentRectHeightPx(MIN_BOX_H),
                    padding: CONTENT_PAD,
                  }}
                >
                  {textBoxContent === 'text' ? (
                    <textarea
                      value={textBoxValue}
                      onChange={(e) => setTextBoxValue(e.target.value)}
                      placeholder="输入文字"
                      className="w-full h-full resize-none border-0 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-0 p-0"
                      style={{
                        fontSize: `${fontSizePxFromBox(textBoxSize.height)}px`,
                        lineHeight: TEXT_LINE_HEIGHT,
                        minHeight: `${Math.max(20, Math.round(fontSizePxFromBox(textBoxSize.height) * TEXT_LINE_HEIGHT))}px`,
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-start text-gray-900 dark:text-gray-100 overflow-hidden"
                      style={{
                        fontFamily: SIGNATURE_FONT,
                        fontSize: `${fontSizePxFromBox(textBoxSize.height)}px`,
                        lineHeight: TEXT_LINE_HEIGHT,
                        whiteSpace: 'pre-wrap',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {textBoxValue || '—'}
                    </div>
                  )}
                </div>
                <div
                  className="absolute left-0 bottom-0 z-10 flex items-center gap-1 py-0.5 pl-1.5 border-t border-r border-dashed border-amber-400/50 bg-amber-50/75 dark:bg-amber-900/25 rounded-tr"
                  style={{ height: BOTTOM_BAR_H }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTextBox();
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="p-0.5 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                    title="取消"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirm();
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    disabled={saving || !textBoxValue.trim()}
                    className="p-0.5 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-50"
                    title="确认"
                  >
                    <FaCheck className="w-3 h-3" />
                  </button>
                </div>
                <div
                  className="absolute bottom-0 right-0 z-20 w-5 h-5 cursor-se-resize pointer-events-auto flex items-end justify-end p-0.5"
                  onMouseDown={startResize}
                  onTouchStart={startResize}
                  title="拖拽调整大小"
                >
                  <span
                    className="w-full h-full border-b-2 border-r-2 border-amber-500/80 rounded-br"
                    style={{ minWidth: 12, minHeight: 12 }}
                  />
                </div>
              </div>
              )}
            </div>
          )}
            <canvas
              ref={overlayRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="absolute left-0 top-0 block w-full h-full pointer-events-none"
              style={{
                width: CANVAS_W,
                height: CANVAS_H,
                pointerEvents: brushMode && !textBoxOpen ? 'auto' : 'none',
                cursor:
                  brushMode === 'highlight' && !textBoxOpen
                    ? CURSOR_HIGHLIGHT
                    : brushMode === 'mosaic' && !textBoxOpen
                    ? CURSOR_MOSAIC
                    : 'default',
              }}
              onMouseDown={startBrushStroke}
              onTouchStart={startBrushStroke}
              aria-hidden
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default PdfEditorPage;
