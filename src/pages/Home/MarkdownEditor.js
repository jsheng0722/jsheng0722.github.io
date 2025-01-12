import React from 'react';
import ReactMarkdown from 'react-markdown';

const MarkdownEditor = ({ markdown }) => {
    return (
        <div className="w-1/2 p-4 overflow-auto">
            <ReactMarkdown children={markdown} />
        </div>
    );
};

export default MarkdownEditor;
