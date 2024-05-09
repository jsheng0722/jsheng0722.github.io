import React, { useState } from 'react';

function NoteEditor() {
    const [noteTitle, setNoteTitle] = useState('');
    const [noteAuthor, setNoteAuthor] = useState('');
    const [noteDate, setNoteDate] = useState('');
    const [noteContent, setNoteContent] = useState('');

    const handleSaveNote = () => {
        const fileContent = `---
        title: ${noteTitle}
        author: ${noteAuthor}
        date: ${noteDate}
        ---

        ${noteContent}`;

        const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = `${noteTitle.replace(/ /g, '_')}.md`; // 创建一个符合文件名的字符串
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href); // 清理创建的 URL 对象
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Enter title"
                value={noteTitle}
                onChange={e => setNoteTitle(e.target.value)}
            />
            <input
                type="text"
                placeholder="Author"
                value={noteAuthor}
                onChange={e => setNoteAuthor(e.target.value)}
            />
            <input
                type="date"
                placeholder="Date"
                value={noteDate}
                onChange={e => setNoteDate(e.target.value)}
            />
            <textarea
                placeholder="Enter content"
                value={noteContent}
                onChange={e => setNoteContent(e.target.value)}
                style={{ minHeight: '100px', width: '100%' }}
            />
            <button onClick={handleSaveNote}>Save Note</button>
        </div>
    );
}

export default NoteEditor;
