/**
 * 图像处理：左侧无框标签栏(0.5) + 上传(2) + 主区(7.5)
 * 主区随标签变化：基础 → 6:1.5（预览+结果）；识别文字 → 4.5:3（图+文本）；AI → 4.5:3 占位
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  FaImage,
  FaDownload,
  FaTrashAlt,
  FaFont,
  FaSyncAlt,
  FaThLarge,
  FaTint,
  FaMagic,
  FaSave,
} from 'react-icons/fa';
import PageLayout from '../../components/Layout/PageLayout';
import { Button, Modal } from '../../components/UI';
import { useI18n } from '../../context/I18nContext';
import { applyFlipRotate, applyRemoveWatermark, createCanvasFromImageUrl, pixelateRectOnContext } from './imageLabUtils';

const ACCEPT_IMAGE = 'image/*';
const MAX_FILE_MB = 20;

function genId() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function ImageLabPage() {
  const { t } = useI18n();
  const inputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('basic');

  const [files, setFiles] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [history, setHistory] = useState([]);
  const [ocrText, setOcrText] = useState('');
  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState('');
  const [toolRunning, setToolRunning] = useState(false);
  const [mosaicSize, setMosaicSize] = useState(10);
  const [mosaicBrushMode, setMosaicBrushMode] = useState(false);
  const [rotateDeg, setRotateDeg] = useState(0);
  const [enlargeUrl, setEnlargeUrl] = useState(null);

  const selectedFile = files[selectedIndex];

  useEffect(() => {
    if (!selectedFile?.file) {
      setCurrentImageUrl(null);
      setHistory([]);
      setOcrText('');
      return;
    }
    const url = URL.createObjectURL(selectedFile.file);
    setCurrentImageUrl(url);
    setHistory([]);
    setOcrText('');
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile?.id]);

  const addFiles = useCallback((newFiles) => {
    if (!newFiles?.length) return;
    const list = [];
    for (let i = 0; i < newFiles.length; i++) {
      const f = newFiles[i];
      if (!f.type?.startsWith('image/')) continue;
      if (f.size > MAX_FILE_MB * 1024 * 1024) continue;
      list.push({ file: f, id: `${Date.now()}-${i}-${f.name}` });
    }
    setFiles((prev) => {
      const next = [...prev, ...list];
      if (next.length > 0 && selectedIndex >= prev.length) setSelectedIndex(prev.length);
      return next;
    });
  }, [selectedIndex]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    addFiles(e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : []);
  }, [addFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleSelect = useCallback(() => inputRef.current?.click(), []);
  const handleInputChange = useCallback((e) => {
    addFiles(e.target.files ? Array.from(e.target.files) : []);
    e.target.value = '';
  }, [addFiles]);

  const removeFile = useCallback((id) => {
    setFiles((prev) => {
      const next = prev.filter((item) => item.id !== id);
      setSelectedIndex((i) => (i >= next.length ? Math.max(0, next.length - 1) : i));
      return next;
    });
  }, []);

  const applyOnly = useCallback((dataUrl) => {
    if (dataUrl) setCurrentImageUrl(dataUrl);
  }, []);

  const runFlip = useCallback(
    (horizontal, vertical) => {
      if (!currentImageUrl || toolRunning) return;
      setToolRunning(true);
      applyFlipRotate(currentImageUrl, { horizontal, vertical, rotate: rotateDeg })
        .then(applyOnly)
        .catch(console.error)
        .finally(() => setToolRunning(false));
    },
    [currentImageUrl, toolRunning, rotateDeg, applyOnly]
  );

  const runRotate = useCallback(
    (deg) => {
      if (!currentImageUrl || toolRunning) return;
      setToolRunning(true);
      applyFlipRotate(currentImageUrl, { horizontal: false, vertical: false, rotate: deg })
        .then(applyOnly)
        .catch(console.error)
        .finally(() => setToolRunning(false));
    },
    [currentImageUrl, toolRunning, applyOnly]
  );

  const finishMosaicBrush = useCallback((dataUrl) => {
    if (dataUrl) applyOnly(dataUrl);
    setMosaicBrushMode(false);
  }, [applyOnly]);

  const runWatermark = useCallback(() => {
    if (!currentImageUrl || toolRunning) return;
    setToolRunning(true);
    applyRemoveWatermark(currentImageUrl, { x: 0.1, y: 0.85, w: 0.8, h: 0.1 })
      .then(applyOnly)
      .catch(console.error)
      .finally(() => setToolRunning(false));
  }, [currentImageUrl, toolRunning, applyOnly]);

  const saveToHistory = useCallback(() => {
    if (!currentImageUrl) return;
    const defaultName = `${t('ImageLabResultName') || '结果'} ${history.length + 1}`;
    setHistory((prev) => [...prev, { id: genId(), url: currentImageUrl, name: defaultName }]);
  }, [currentImageUrl, history.length, t]);

  const updateHistoryName = useCallback((id, name) => {
    setHistory((prev) => prev.map((item) => (item.id === id ? { ...item, name } : item)));
  }, []);

  const runOcr = useCallback(async () => {
    if (!selectedFile?.file || ocrRunning) return;
    setOcrRunning(true);
    setOcrProgress(t('ImageLabOcrLoading') || '加载中…');
    setOcrText('');
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker(
        'eng+chi_sim',
        1,
        { logger: (m) => setOcrProgress(m.status || (m.progress != null ? `${Math.round(m.progress * 100)}%` : '') || '') }
      );
      setOcrProgress(t('ImageLabOcrRecognizing') || '识别中…');
      const { data } = await worker.recognize(selectedFile.file);
      await worker.terminate();
      setOcrText(data?.text?.trim() || '');
    } catch (err) {
      console.error(err);
      alert(t('ImageLabOcrError') || 'OCR 失败');
    } finally {
      setOcrRunning(false);
      setOcrProgress('');
    }
  }, [selectedFile, ocrRunning, t]);

  const downloadCurrent = useCallback(() => {
    if (!currentImageUrl) return;
    const a = document.createElement('a');
    a.href = currentImageUrl;
    a.download = `image-lab-${Date.now()}.png`;
    a.click();
  }, [currentImageUrl]);

  const downloadOcrTxt = useCallback(() => {
    if (!ocrText) return;
    const blob = new Blob([ocrText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-lab-ocr-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [ocrText]);

  const contentHeight = 'calc(100vh - 8rem)';

  const tabBtn = (tabId, icon, label, disabled = false) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(tabId)}
      className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-colors w-full ${
        activeTab === tabId
          ? 'bg-indigo-600 text-white shadow'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={label}
    >
      {icon}
      <span className="leading-tight text-center break-words">{label}</span>
    </button>
  );

  return (
    <PageLayout className="max-w-[1600px] mx-auto px-2 py-4">
      <div className="mb-2">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FaImage className="text-indigo-500" />
          {t('ImageLabTitle')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-xs">{t('ImageLabDesc')}</p>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.5fr)_minmax(0,2fr)_minmax(0,7.5fr)] gap-2"
        style={{ minHeight: contentHeight }}
      >
        {/* 标签栏：无外框，仅按钮 */}
        <div
          className="hidden lg:flex flex-col gap-1.5 py-1 shrink-0"
          style={{ height: contentHeight }}
        >
          {tabBtn('basic', <FaImage className="w-4 h-4 mx-auto" />, t('ImageLabTabBasic'))}
          {tabBtn('ocr', <FaFont className="w-4 h-4 mx-auto" />, t('ImageLabStepOcr'))}
          {tabBtn('ai', <FaMagic className="w-4 h-4 mx-auto" />, t('ImageLabStepAiGenerate'))}
        </div>

        {/* 上传列：不变 */}
        <div
          className="flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          style={{ height: contentHeight }}
        >
          <div className="p-2 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <h2 className="text-xs font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1">
              <FaImage className="w-3 h-3 text-indigo-500" />
              {t('ImageLabUpload')}
            </h2>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT_IMAGE}
              multiple
              className="hidden"
              onChange={handleInputChange}
            />
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={handleSelect}
              className="mt-1 border border-dashed border-gray-300 dark:border-gray-600 rounded p-2 text-center cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-600 dark:text-gray-400"
            >
              {t('ImageLabUploadHint')}
              <span className="block text-[10px] text-gray-500 mt-0.5">{t('ImageLabUploadLimit')}</span>
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto p-1.5 space-y-1 min-h-0">
            {files.length === 0 ? (
              <li className="text-xs text-gray-500 dark:text-gray-400 py-3 text-center">{t('ImageLabNoImage')}</li>
            ) : (
              files.map((item, idx) => (
                <li
                  key={item.id}
                  className={`flex items-center gap-1.5 p-1.5 rounded border cursor-pointer transition-colors shrink-0 ${
                    idx === selectedIndex
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedIndex(idx)}
                >
                  <img
                    src={URL.createObjectURL(item.file)}
                    alt=""
                    className="w-7 h-7 object-cover rounded shrink-0"
                    onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                  />
                  <span className="flex-1 min-w-0 truncate text-xs text-gray-900 dark:text-gray-100">
                    {item.file.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(item.id);
                    }}
                    className="p-0.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    title={t('Delete')}
                  >
                    <FaTrashAlt className="w-3 h-3" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* 主区 7.5：随标签切换 */}
        <div className="min-h-0 flex flex-col lg:flex-row gap-2" style={{ height: contentHeight }}>
          {/* 小屏标签 */}
          <div className="lg:hidden flex gap-1 flex-wrap">
            {tabBtn('basic', <FaImage className="w-4 h-4" />, t('ImageLabTabBasic'))}
            {tabBtn('ocr', <FaFont className="w-4 h-4" />, t('ImageLabStepOcr'))}
            {tabBtn('ai', <FaMagic className="w-4 h-4" />, t('ImageLabStepAiGenerate'), true)}
          </div>

          {activeTab === 'basic' && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,6fr)_minmax(0,1.5fr)] gap-2 min-h-0 w-full">
              <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-h-0">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700 shrink-0 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('ImageLabToolbar')}</span>
                  <Button size="small" variant="ghost" icon={<FaSyncAlt />} onClick={() => runFlip(true, false)} disabled={!currentImageUrl || toolRunning || mosaicBrushMode}>{t('ImageLabFlipH')}</Button>
                  <Button size="small" variant="ghost" icon={<FaSyncAlt />} onClick={() => runFlip(false, true)} disabled={!currentImageUrl || toolRunning || mosaicBrushMode}>{t('ImageLabFlipV')}</Button>
                  <select value={rotateDeg} onChange={(e) => setRotateDeg(Number(e.target.value))} disabled={mosaicBrushMode} className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1 w-14 disabled:opacity-50">
                    {[0, 90, 180, 270].map((n) => (
                      <option key={n} value={n}>{n}°</option>
                    ))}
                  </select>
                  <Button size="small" variant="ghost" onClick={() => runRotate(rotateDeg)} disabled={!currentImageUrl || toolRunning || rotateDeg === 0 || mosaicBrushMode}>{t('ImageLabRotate')}</Button>
                  <span className="text-gray-400">|</span>
                  <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    {t('ImageLabMosaicBlockAndBrush')}
                    <input type="number" min={2} max={80} value={mosaicSize} onChange={(e) => setMosaicSize(Number(e.target.value) || 10)} className="min-w-[4.5rem] w-16 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm tabular-nums" title={t('ImageLabMosaicBrushHint')} />
                  </label>
                  {!mosaicBrushMode ? (
                    <Button size="small" variant="ghost" icon={<FaThLarge />} onClick={() => currentImageUrl && setMosaicBrushMode(true)} disabled={!currentImageUrl || toolRunning}>{t('ImageLabStepMosaic')}</Button>
                  ) : (
                    <>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{t('ImageLabMosaicBrushActive')}</span>
                      <Button size="small" variant="primary" onClick={() => { const c = document.getElementById('mosaic-brush-canvas'); if (c) finishMosaicBrush(c.toDataURL('image/png')); }}>{t('ImageLabMosaicDone')}</Button>
                      <Button size="small" variant="ghost" onClick={() => setMosaicBrushMode(false)}>{t('ImageLabMosaicCancel')}</Button>
                    </>
                  )}
                  <Button size="small" variant="ghost" icon={<FaTint />} onClick={runWatermark} disabled={!currentImageUrl || toolRunning || mosaicBrushMode}>{t('ImageLabStepWatermark')}</Button>
                  <span className="flex-1" />
                  <Button size="small" variant="primary" icon={<FaSave />} onClick={saveToHistory} disabled={!currentImageUrl || mosaicBrushMode}>{t('ImageLabSaveResult')}</Button>
                  <Button size="small" icon={<FaDownload />} onClick={downloadCurrent} disabled={!currentImageUrl || mosaicBrushMode}>{t('ImageLabDownloadImage')}</Button>
                </div>
                <div className="flex-1 min-h-0 p-2 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800/50 overflow-auto">
                  {mosaicBrushMode && currentImageUrl ? (
                    <>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mb-1 shrink-0">{t('ImageLabMosaicBrushHint')}</p>
                      <MosaicBrushCanvas
                        key={currentImageUrl.slice(-40)}
                        imageUrl={currentImageUrl}
                        blockSize={mosaicSize}
                      />
                    </>
                  ) : currentImageUrl ? (
                    <img src={currentImageUrl} alt="" className="max-w-full max-h-full object-contain rounded" />
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('ImageLabNoImage')}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-h-0">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700 shrink-0">
                  <h2 className="text-xs font-semibold text-gray-900 dark:text-gray-100">{t('ImageLabHistory')}</h2>
                </div>
                <ul className="flex-1 overflow-y-auto p-1.5 space-y-2 min-h-0">
                  {history.length === 0 ? (
                    <li className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">{t('ImageLabNoHistory')}</li>
                  ) : (
                    history.map((item) => (
                      <li key={item.id} className="shrink-0">
                        <button type="button" onClick={() => setEnlargeUrl(item.url)} className="w-full rounded border border-gray-200 dark:border-gray-600 overflow-hidden hover:border-indigo-500 block">
                          <img src={item.url} alt="" className="w-full aspect-square object-cover max-h-20" />
                        </button>
                        <input type="text" value={item.name} onChange={(e) => updateHistoryName(item.id, e.target.value)} className="mt-0.5 w-full rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-1.5 py-0.5" />
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'ocr' && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,4.5fr)_minmax(0,3fr)] gap-2 min-h-0 w-full">
              <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-h-0">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700 shrink-0 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {t('ImageLabOcrImagePanel')}
                </div>
                <div className="flex-1 min-h-0 p-2 flex items-center justify-center bg-gray-100 dark:bg-gray-800/50">
                  {currentImageUrl ? (
                    <img src={currentImageUrl} alt="" className="max-w-full max-h-full object-contain rounded" />
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('ImageLabNoImage')}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-h-0">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700 shrink-0 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{t('ImageLabStepOcr')}</span>
                  <Button size="small" icon={<FaFont />} onClick={runOcr} disabled={!selectedFile || ocrRunning}>
                    {ocrRunning ? ocrProgress || t('Loading') : t('ImageLabOcr')}
                  </Button>
                  <Button size="small" variant="ghost" icon={<FaDownload />} onClick={downloadOcrTxt} disabled={!ocrText}>{t('ImageLabDownloadTxt')}</Button>
                </div>
                <div className="flex-1 min-h-0 p-2 flex flex-col">
                  <textarea
                    value={ocrText}
                    onChange={(e) => setOcrText(e.target.value)}
                    placeholder={t('ImageLabOcrPlaceholder')}
                    className="flex-1 min-h-[120px] w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 text-sm resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,4.5fr)_minmax(0,3fr)] gap-2 min-h-0 w-full">
              <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-h-0">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold">{t('ImageLabAiImagePanel')}</div>
                <div className="flex-1 min-h-0 p-2 flex items-center justify-center bg-gray-100 dark:bg-gray-800/50">
                  {currentImageUrl ? (
                    <img src={currentImageUrl} alt="" className="max-w-full max-h-full object-contain rounded" />
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('ImageLabNoImage')}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-h-0 p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('ImageLabAiHint')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={!!enlargeUrl} onClose={() => setEnlargeUrl(null)} title={t('ImageLabEnlarge')} size="full" showCloseButton closeOnOverlayClick>
        {enlargeUrl && (
          <div className="flex items-center justify-center max-h-[85vh]">
            <img src={enlargeUrl} alt="" className="max-w-full max-h-[80vh] object-contain rounded" />
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}

function squarePxForBlock(canvas, blockSize) {
  if (!canvas || !canvas.width) return 16;
  const rect = canvas.getBoundingClientRect();
  const scale = rect.width / canvas.width;
  return Math.max(4, Math.min(320, blockSize * scale));
}

function MosaicBrushCanvas({ imageUrl, blockSize }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const blockSizeRef = useRef(blockSize);
  const drawing = useRef(false);
  const last = useRef(null);
  const blockRef = useRef(blockSize);
  blockRef.current = blockSize;
  blockSizeRef.current = blockSize;

  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false, squarePx: 16 });

  useEffect(() => {
    let cancelled = false;
    const wrap = wrapRef.current;
    if (!wrap || !imageUrl) return;
    wrap.innerHTML = '';
    createCanvasFromImageUrl(imageUrl, 1400).then((canvas) => {
      if (cancelled || !wrapRef.current) return;
      canvasRef.current = canvas;
      canvas.id = 'mosaic-brush-canvas';
      canvas.className = 'max-w-full max-h-[min(70vh,560px)] object-contain rounded border border-gray-300 dark:border-gray-600 touch-none';
      canvas.style.cursor = 'none';
      canvas.style.touchAction = 'none';
      const ctx = canvas.getContext('2d');

      const toLocal = (e) => {
        const rect = canvas.getBoundingClientRect();
        const sx = canvas.width / rect.width;
        const sy = canvas.height / rect.height;
        return {
          x: (e.clientX - rect.left) * sx,
          y: (e.clientY - rect.top) * sy,
        };
      };

      /** 每次涂抹 = 与马赛克块同大的正方形（边长 blockSize 画布像素） */
      const stamp = (x, y) => {
        const bs = Math.max(2, blockRef.current);
        const left = Math.floor(x - bs / 2);
        const top = Math.floor(y - bs / 2);
        pixelateRectOnContext(ctx, left, top, bs, bs, bs);
      };

      const line = (x0, y0, x1, y1) => {
        const bs = Math.max(2, blockRef.current);
        const dx = x1 - x0;
        const dy = y1 - y0;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const step = Math.max(1, bs * 0.45);
        for (let i = 0; i <= len; i += step) {
          const t = i / len;
          stamp(x0 + dx * t, y0 + dy * t);
        }
      };

      const onPointerMoveCursor = (e) => {
        const bs = blockSizeRef.current;
        const sq = squarePxForBlock(canvas, bs);
        setCursor({ x: e.clientX, y: e.clientY, visible: true, squarePx: sq });
      };

      const down = (e) => {
        e.preventDefault();
        drawing.current = true;
        const p = toLocal(e);
        last.current = p;
        stamp(p.x, p.y);
      };
      const move = (e) => {
        onPointerMoveCursor(e);
        if (!drawing.current) return;
        e.preventDefault();
        const p = toLocal(e);
        if (last.current) line(last.current.x, last.current.y, p.x, p.y);
        last.current = p;
      };
      const up = () => {
        drawing.current = false;
        last.current = null;
      };
      const leave = () => {
        up();
        setCursor((c) => ({ ...c, visible: false }));
      };

      canvas.addEventListener('pointerdown', down);
      canvas.addEventListener('pointermove', move);
      canvas.addEventListener('pointerup', up);
      canvas.addEventListener('pointerleave', leave);
      canvas.addEventListener('pointerenter', onPointerMoveCursor);
      wrap.appendChild(canvas);
      setCursor((c) => ({
        ...c,
        squarePx: squarePxForBlock(canvas, blockSizeRef.current),
      }));

      const ro = new ResizeObserver(() => {
        const cvs = canvasRef.current;
        if (cvs) {
          const sq = squarePxForBlock(cvs, blockSizeRef.current);
          setCursor((c) => (c.visible ? { ...c, squarePx: sq } : { ...c, squarePx: sq }));
        }
      });
      ro.observe(canvas);
    }).catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  useEffect(() => {
    blockSizeRef.current = blockSize;
    const cvs = canvasRef.current;
    if (!cvs) return;
    const sq = squarePxForBlock(cvs, blockSize);
    setCursor((c) => ({ ...c, squarePx: sq }));
  }, [blockSize]);

  const s = cursor.squarePx;

  return (
    <div ref={wrapRef} className="flex items-center justify-center min-h-[120px] relative">
      {cursor.visible && (
        <div
          className="pointer-events-none fixed z-[100] border-2 border-indigo-600 dark:border-indigo-400 bg-indigo-500/15 box-border shadow-sm"
          style={{
            width: s,
            height: s,
            left: cursor.x - s / 2,
            top: cursor.y - s / 2,
          }}
          aria-hidden
        />
      )}
    </div>
  );
}

export default ImageLabPage;
