import React, { useState } from 'react';
import Navigation from './Navigation';
import Sidebar from './Sidebar';
import directoryData from '../../content/homeContent.json';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';

function Home() {
    const [sidebarContent, setSidebarContent] = useState('');
    const [currentFileContent, setCurrentFileContent] = useState('');

    const handleNavigationClick = (content) => {
        setSidebarContent(content);
    };

    const handleFileClick = (filePath) => {
        // Assuming filePath is a path to the markdown file
        const correctedPath = filePath.replace(/\\/g, '/');
        const fullPath = `${process.env.PUBLIC_URL}/homeContent/${correctedPath}`;
        fetch(fullPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(htmlContent  => setCurrentFileContent(htmlContent ))
        .catch(error => console.log("Failed to load file", error));
    };

    return (
        <>
        <Header />
        <div className="flex flex-col items-center w-full">
            <Navigation directories={directoryData} onNavClick={handleNavigationClick} />
            <div className='flex flex-row w-4/5 justify-between bg-gray-100 p-4 shadow-lg'>
                <div className='flex-[3]'>
                    <Sidebar content={sidebarContent} onFileClick={handleFileClick} />
                </div>
                <div className='flex-[9] mx-5 bg-white p-4 shadow overflow-auto'>
                    {/* Here you might display the file content */}
                    {currentFileContent ? <div dangerouslySetInnerHTML={{ __html: currentFileContent }} /> : <div>Select a file to view its content.</div>}
                </div>
            </div>
        </div>
        <Footer />
        </>
    );
}

export default Home;