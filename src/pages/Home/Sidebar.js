import React from 'react';

function Sidebar({ content, onFileClick }) {
    const renderMarkdownFiles = (folder) => {
        if (!folder || !folder.children) return null;

        return folder.children
            .filter(item => item.type === 'file' && item.path.endsWith('.html'))
            .map((file, index) => (
                <li key={index} 
                    onClick={() => onFileClick(file.path)}
                    className="cursor-pointer hover:bg-gray-300 p-2 rounded transition-colors duration-200 ease-in-out">
                    {file.name.replace('.html','')}
                </li>
            )
        );
    };

    return (
        <div className="w-full h-full bg-white p-4 overflow-auto shadow-lg">
            <h2 className="font-semibold text-lg mb-4 border-b pb-2">{content ? content.name : 'Empty'}</h2>
            <ul>
                {content ? renderMarkdownFiles(content) : <p className="text-gray-500">No content selected</p>}
            </ul>
        </div>
    );
}

export default Sidebar;
