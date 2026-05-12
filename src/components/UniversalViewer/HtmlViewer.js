import React from 'react';

function HtmlViewer({ filePath }) {
  const fullPath = `/${filePath.replace(/^\//, '')}`;

  return (
    <div className="html-viewer w-full h-full">
      <iframe
        src={fullPath}
        className="w-full h-full border border-gray-200 dark:border-gray-700 rounded-lg"
        title="HTML Preview"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

export default HtmlViewer;
