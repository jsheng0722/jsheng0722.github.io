import React from 'react';

function TextViewer({ content, fileType }) {
  if (fileType === 'html') {
    return (
      <div className="html-viewer w-full h-full">
        <iframe
          srcDoc={content}
          className="w-full h-full border border-gray-200 dark:border-gray-700 rounded-lg"
          title="HTML Preview"
          sandbox="allow-same-origin"
        />
      </div>
    );
  }

  return (
    <div className="text-viewer w-full h-full">
      <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 rounded-lg overflow-auto w-full h-full">
        {content}
      </pre>
    </div>
  );
}

export default TextViewer;
