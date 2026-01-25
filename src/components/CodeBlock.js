import React, { useState, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaCopy, FaCheck, FaMagic } from 'react-icons/fa';
import { detectLanguageFromCode, normalizeLanguage } from './AlgorithmVisualizer/languageDetector';
import { FloatingCodeVisualizer } from './UI';

function CodeBlock({ language, children, isAlgorithmNote = false }) {
  const [copied, setCopied] = useState(false);
  const [showFloatingVisualizer, setShowFloatingVisualizer] = useState(false);

  // 自动检测代码语言
  const detectedLanguage = useMemo(() => {
    const code = String(children).replace(/\n$/, '');
    const normalizedLang = normalizeLanguage(language);
    const autoDetected = detectLanguageFromCode(code, normalizedLang);
    return autoDetected;
  }, [language, children]);

  const handleCopy = () => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleToggleVisualization = () => {
    setShowFloatingVisualizer(!showFloatingVisualizer);
  };

  const code = String(children).replace(/\n$/, '');

  return (
    <>
      <div className="relative group my-4">
        {/* 工具栏按钮 */}
        <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
          {/* 可视化按钮 - 仅在算法笔记中显示 */}
          {isAlgorithmNote && (
            <button
              id="visualization-button"
              name="visualization-button"
              type="button"
              onClick={handleToggleVisualization}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center gap-1 text-sm shadow-md"
              title="打开算法可视化"
            >
              <FaMagic className="w-3 h-3" />
              <span>可视化</span>
            </button>
          )}
          {/* 复制按钮 */}
          <button
            id="copy-code-button"
            name="copy-code-button"
            type="button"
            onClick={handleCopy}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all flex items-center gap-1 text-sm"
            title="复制代码"
          >
            {copied ? (
              <>
                <FaCheck className="w-3 h-3" />
                <span>已复制</span>
              </>
            ) : (
              <>
                <FaCopy className="w-3 h-3" />
                <span>复制</span>
              </>
            )}
          </button>
        </div>
        
        <SyntaxHighlighter
          style={oneDark}
          language={detectedLanguage}
          PreTag="div"
          className="rounded-lg !m-0"
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
            fontSize: '0.9rem'
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {/* 悬浮可视化面板 */}
      <FloatingCodeVisualizer
        isOpen={showFloatingVisualizer}
        onClose={handleToggleVisualization}
        code={code}
        language={detectedLanguage}
        onCopy={handleCopy}
        copied={copied}
      />
    </>
  );
}

export default CodeBlock;
