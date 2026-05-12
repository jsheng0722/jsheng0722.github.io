import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FaCopy, FaCheck } from 'react-icons/fa';
import { useI18n } from '../../context/I18nContext';

function MarkdownViewer({ content }) {
  const { t } = useI18n();
  const [copiedBlocks, setCopiedBlocks] = useState({});

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedBlocks(prev => ({ ...prev, [index]: true }));
      setTimeout(() => {
        setCopiedBlocks(prev => ({ ...prev, [index]: false }));
      }, 2000);
    });
  };

  const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');
    const blockIndex = `${match ? match[1] : 'text'}-${node?.position?.start?.line || 0}`;

    if (!inline && match) {
      return (
        <div className="relative group my-4">
          <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
            <button
              onClick={() => handleCopy(codeString, blockIndex)}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all flex items-center gap-1 text-sm"
              title={t('UniversalViewerCopy')}
            >
              {copiedBlocks[blockIndex] ? (
                <>
                  <FaCheck className="w-3 h-3" />
                  <span>{t('UniversalViewerCopied')}</span>
                </>
              ) : (
                <>
                  <FaCopy className="w-3 h-3" />
                  <span>{t('UniversalViewerCopy')}</span>
                </>
              )}
            </button>
          </div>
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            className="rounded-lg !m-0"
            customStyle={{
              margin: 0,
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  };

  return (
    <div className="markdown-viewer prose dark:prose-invert max-w-none w-full h-full overflow-auto p-4 bg-white dark:bg-gray-900 rounded-lg text-gray-900 dark:text-gray-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownViewer;
