import React, { useEffect, useState } from 'react';

const FileViewer = ({ filePath }) => {
  const [content, setContent] = useState('');
  const [isHtml, setIsHtml] = useState(false);

  useEffect(() => {
    if (filePath) {
      fetch(`/home/folder/${filePath}`)
        .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(text => {
            // 判断是否为 HTML 文件
            if (filePath.endsWith('.html')) {
            setIsHtml(true);
            } else {
            setIsHtml(false);
            }
            setContent(text);
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            setContent('Error loading file content');
        });
    }
  }, [filePath]);

  if (!filePath) {
    return <div className="file-viewer p-4">Please select a file to view its content.</div>;
  }

  if (isHtml) {
    return (
      <div className="file-viewer p-4 flex-grow">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    );
  }
  
  return (
    <div className="file-viewer p-4 flex-grow">
      <pre className="whitespace-pre-wrap">{content}</pre>
    </div>
  );
};

export default FileViewer;
