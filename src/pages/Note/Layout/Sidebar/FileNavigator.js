// not use
import React from 'react';

function FileNavigator() {
  const fileTree = require.context('!raw-loader!../../../../../src', true, /\.(txt|md|js)$/);

  const files = fileTree.keys().map((path) => {
    return {
      path,
      content: fileTree(path).default
    };
  });

  return (
    <div className="file-navigator">
      <ul>
        {files.map(file => (
          <li key={file.path}>{file.path}</li>  // 简单列出文件路径
        ))}
      </ul>
    </div>
  );
}

export default FileNavigator;
