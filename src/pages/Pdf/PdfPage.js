import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/Layout/PageLayout';
import { Card, Button } from '../../components/UI';
import { FaFilePdf, FaUpload, FaDownload, FaTrash, FaEye, FaEdit } from 'react-icons/fa';
import * as pdfStorage from './pdfStorage';

/**
 * PDF 处理页面 - 仅使用 IndexedDB（适配 GitHub Pages 等静态托管，无服务器）
 * 上传的 PDF 保存在浏览器本地，长期保留
 */
function PdfPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef(null);
  const filesRef = useRef(files);
  filesRef.current = files;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    pdfStorage
      .getAll()
      .then((rows) => {
        if (cancelled) return;
        const list = (rows || []).map((row) => ({
          id: row.id,
          name: row.name,
          url: row.blob ? URL.createObjectURL(row.blob) : null,
        }));
        setFiles(list.filter((f) => f.url));
      })
      .catch(() => {
        if (!cancelled) setFiles([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    return () => {
      (filesRef.current || []).forEach((f) => {
        if (f.url) URL.revokeObjectURL(f.url);
      });
    };
  }, []);

  /** 在已有名称集合下生成不重名显示名，如 report.pdf → report (1).pdf */
  const getUniqueName = (proposed, existingSet) => {
    let name = proposed;
    const lastDot = name.lastIndexOf('.');
    const base = lastDot >= 0 ? name.slice(0, lastDot) : name;
    const ext = lastDot >= 0 ? name.slice(lastDot) : '';
    const match = base.match(/^(.+)\s\((\d+)\)$/);
    const baseWithoutNum = match ? match[1] : base;
    let n = 0;
    while (existingSet.has(name)) {
      n += 1;
      name = `${baseWithoutNum} (${n})${ext}`;
    }
    existingSet.add(name);
    return name;
  };

  const handleUpload = (e) => {
    const selected = Array.from(e.target.files || []).filter((f) => f.type === 'application/pdf');
    if (selected.length === 0) return;
    e.target.value = '';
    const now = Date.now();
    const existingNames = new Set((filesRef.current || []).map((f) => f.name));
    selected.forEach((file) => {
      const id = `${now}-${Math.random().toString(36).slice(2)}`;
      const name = getUniqueName(file.name, existingNames);
      const entry = { id, name, blob: file, createdAt: now };
      pdfStorage.add(entry).then(() => {
        setFiles((prev) => [
          ...prev,
          { id, name, url: URL.createObjectURL(file) },
        ]);
      }).catch(() => {});
    });
  };

  const handleRemove = (id) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.url) URL.revokeObjectURL(item.url);
      pdfStorage.remove(id).catch(() => {});
      return prev.filter((f) => f.id !== id);
    });
  };

  const triggerUpload = () => inputRef.current?.click();

  return (
    <PageLayout className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          PDF 文件
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          上传、下载 PDF 文件（保存在浏览器本地 IndexedDB，适配 GitHub Pages 等静态托管）
        </p>
      </div>

      <Card className="mb-6 p-6">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
        <div className="flex flex-wrap items-center gap-4">
          <Button onClick={triggerUpload} icon={<FaUpload />} iconPosition="left">
            上传 PDF
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            支持多选，仅限 .pdf 文件
          </span>
        </div>
      </Card>

      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">加载中…</p>
        </Card>
      ) : files.length === 0 ? (
        <Card className="p-12 text-center">
          <FaFilePdf className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">暂无 PDF 文件，点击「上传 PDF」添加</p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <FaFilePdf className="w-8 h-8 text-red-500 dark:text-red-400 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-gray-900 dark:text-gray-100 font-medium">
                  {file.name}
                </span>
                <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                  <Button
                    variant="ghost"
                    size="small"
                    icon={<FaEye />}
                    onClick={() => window.open(file.url, '_blank')}
                    title="预览"
                    className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    预览
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    icon={<FaEdit />}
                    onClick={() => navigate('/pdf/editor', { state: { fileId: file.id } })}
                    title="编辑"
                    className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                  >
                    编辑
                  </Button>
                  <a
                    href={file.url}
                    download={file.name}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white"
                  >
                    <FaDownload className="w-4 h-4" />
                    下载
                  </a>
                  <Button
                    variant="ghost"
                    size="small"
                    icon={<FaTrash />}
                    onClick={() => handleRemove(file.id)}
                    title="移除"
                    className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                  >
                    移除
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </PageLayout>
  );
}

export default PdfPage;
