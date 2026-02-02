import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCode, FaCopy, FaCheck } from 'react-icons/fa';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import VisualizationToolkitWithReactFlow from '../../components/Visualizations/VisualizationToolkit';
import { Button } from '../../components/UI';

/**
 * 可视化工具页面 - 独立页面
 * 包含代码编辑器和可视化画布
 */
function VisualizationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialCode = location.state?.code || null;
  const returnPath = location.state?.returnPath || '/notes'; // 返回路径，默认为笔记首页
  
  const [code, setCode] = useState(initialCode || '');
  const [copied, setCopied] = useState(false);

  // 如果初始代码存在，自动设置到编辑器
  React.useEffect(() => {
    if (initialCode && !code) {
      setCode(initialCode);
    }
  }, [initialCode, code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleBack = () => {
    // 优先用 state，刷新后 state 会丢，用 sessionStorage 兜底
    let note = location.state?.note;
    let path = returnPath;

    if (!note) {
      try {
        const storedNote = sessionStorage.getItem('visualizationReturnNote');
        const storedPath = sessionStorage.getItem('visualizationReturnPath');
        if (storedNote) note = JSON.parse(storedNote);
        if (storedPath) path = storedPath;
      } catch (_) {}
    }
    try {
      sessionStorage.removeItem('visualizationReturnNote');
      sessionStorage.removeItem('visualizationReturnPath');
    } catch (_) {}

    navigate(path, note ? { state: { note } } : {});
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header />
      
      <main className="flex-1 flex" style={{ height: 'calc(100vh - 200px)' }}>
        {/* 左侧：代码编辑器 */}
        <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
          {/* 编辑器头部 */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="flex items-center gap-3">
              <Button
                onClick={handleBack}
                variant="ghost"
                size="small"
                icon={<FaArrowLeft />}
                className="text-white hover:bg-white/20"
                title="返回笔记"
              />
              <div className="flex items-center gap-2">
                <FaCode className="w-5 h-5 text-white" />
                <h2 className="text-lg font-bold text-white">代码编辑器</h2>
              </div>
            </div>
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="small"
              icon={copied ? <FaCheck /> : <FaCopy />}
              className="text-white hover:bg-white/20"
              title={copied ? "已复制" : "复制代码"}
            >
              {copied ? "已复制" : "复制"}
            </Button>
          </div>
          
          {/* 编辑器内容 */}
          <div className="flex-1 p-4 overflow-auto bg-gray-50 dark:bg-gray-900">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="在此粘贴或输入算法代码..."
              className="w-full h-full font-mono text-sm resize-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ minHeight: '100%' }}
            />
          </div>
        </div>

        {/* 右侧：可视化画布 */}
        <div className="w-1/2 flex flex-col bg-gray-50 dark:bg-gray-900">
          <VisualizationToolkitWithReactFlow initialCode={code} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default VisualizationPage;

