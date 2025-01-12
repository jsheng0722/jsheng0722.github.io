import React, { useEffect, useState } from 'react';

const FileViewer = ({ filePath }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (filePath) {
      fetch(`/${filePath}`)
        .then(response => response.text())
        .then(text => setContent(text));
    }
  }, [filePath]);

  if (!filePath) {
    return <div className="file-viewer p-4">Please select a file to view its content.</div>;
  }

  return (
    <div className="file-viewer p-4 flex-grow">
      <pre className="whitespace-pre-wrap">{content}</pre>
    </div>
  );
};

export default FileViewer;
