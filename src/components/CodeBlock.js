import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaCopy, FaCheck } from 'react-icons/fa';

function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10 flex items-center gap-1 text-sm"
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
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        className="rounded-lg !m-0"
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.9rem'
        }}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
}

export default CodeBlock;
