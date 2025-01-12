import React, { useEffect, useState } from 'react';
import { FaFolder, FaFolderOpen, FaFileAlt } from 'react-icons/fa';

const Sidebar = ({ onSelectFile }) => {
  const [files, setFiles] = useState([]);
  const [openFolders, setOpenFolders] = useState({});

  useEffect(() => {
    fetch('/home/fileStructure.json')
      .then(response => response.json())
      .then(data => setFiles(data));
  }, []);

  const toggleFolder = (path) => {
    setOpenFolders(prevState => ({
      ...prevState,
      [path]: !prevState[path]
    }));
  };

  const renderFiles = (files) => {
    return files.map((file, index) => {
      if (file.type === 'folder') {
        return (
          <li key={index} className="ml-4 my-2">
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => toggleFolder(file.path)}
            >
              {openFolders[file.path] ? <FaFolderOpen className="mr-2 text-yellow-500" /> : <FaFolder className="mr-2 text-yellow-500" />}
              <span className="font-semibold">{file.name}</span>
            </div>
            {openFolders[file.path] && (
              <ul className="ml-4">
                {renderFiles(file.children)}
              </ul>
            )}
          </li>
        );
      } else {
        return (
          <li key={index} className="ml-4 my-2">
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => onSelectFile(file.path)}
            >
              <FaFileAlt className="mr-2 text-blue-500" />
              <button className="text-blue-500 hover:underline">{file.name}</button>
            </div>
          </li>
        );
      }
    });
  };

  return (
    <div className="w-64 p-4 bg-gray-200 rounded-lg shadow-md">
      <ul>
        {renderFiles(files)}
      </ul>
    </div>
  );
};

export default Sidebar;
