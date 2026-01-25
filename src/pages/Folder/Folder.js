import React, { useState } from 'react';
import { FileList } from '../../components/UI';
import FileViewer from './FileViewer';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';

function Folder() {
    const [selectedFile, setSelectedFile] = useState('');
    const [files, setFiles] = useState([]);

    React.useEffect(() => {
        fetch('/home/fileStructure.json')
            .then(response => response.json())
            .then(data => setFiles(data));
    }, []);

    const handleFileClick = (file) => {
        if (file.path) {
            setSelectedFile(file.path);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Header />
            <div className="flex flex-grow bg-white shadow-lg rounded-lg m-4">
                <div className="w-64 p-4 bg-gray-200 rounded-lg shadow-md">
                    <FileList
                        items={files}
                        onFileClick={handleFileClick}
                        emptyStateText="暂无文件"
                    />
                </div>
                <FileViewer filePath={selectedFile} />
            </div>
            <Footer />
        </div>
    );
}

export default Folder;
