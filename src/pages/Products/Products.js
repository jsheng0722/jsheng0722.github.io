import React, { useState } from 'react';
import Sidebar from './Sidebar';
import FileViewer from './FileViewer';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';

function Home() {
    const [selectedFile, setSelectedFile] = useState('');

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Header />
            <div className="flex flex-grow bg-white shadow-lg rounded-lg m-4">
                <Sidebar onSelectFile={setSelectedFile} />
                <FileViewer filePath={selectedFile} />
            </div>
            <Footer />
        </div>
    );
}

export default Home;
