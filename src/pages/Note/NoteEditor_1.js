import React, { useState, useEffect, useRef } from 'react';

function NoteEditor() {
    const [fields, setFields] = useState([
        { key: 'title', value: '', type: 'text' },
        { key: 'author', value: '', type: 'text' },
        { key: 'content', value: '', type: 'textarea' }
    ]);

    const textareaRef = useRef(null);

    // 自动调整文本区域的高度以适应内容
    useEffect(() => {
        const adjustHeight = () => {
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
                textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
            }
        };
        adjustHeight();
    }, [fields]);

    const handleInputChange = (index, event) => {
        const newFields = [...fields];
        newFields[index].value = event.target.value;
        setFields(newFields);
    };

    const handleAddField = () => {
        setFields([...fields, { key: '', value: '', type: 'text' }]);
    };

    const handleRemoveField = (index) => {
        setFields(fields.filter((_, idx) => idx !== index));
    };

    const handleSaveNote = () => {
        // 添加日期字段
        const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD 格式
        const fileContent = `---
title: ${fields.find(f => f.key === 'title')?.value}
author: ${fields.find(f => f.key === 'author')?.value}
date: ${date}
---

${fields.find(f => f.key === 'content')?.value}`;

        const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = "note.md";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    };

    return (
        <div>
            {fields.map((field, index) => (
                <div key={index}>
                    <input
                        type="text"
                        placeholder="Enter key"
                        value={field.key}
                        onChange={e => {
                            const newFields = [...fields];
                            newFields[index].key = e.target.value;
                            setFields(newFields);
                        }}
                    />
                    {field.type !== 'textarea' ? (
                        <input
                            type={field.type}
                            placeholder={`Enter ${field.key}`}
                            value={field.value}
                            onChange={e => handleInputChange(index, e)}
                        />
                    ) : (
                        <textarea
                            ref={textareaRef}
                            placeholder={`Enter ${field.key}`}
                            value={field.value}
                            onChange={e => handleInputChange(index, e)}
                            style={{ width: '100%', minHeight: '100px' }}
                        />
                    )}
                    <button onClick={() => handleRemoveField(index)}>Remove</button>
                </div>
            ))}
            <button onClick={handleAddField}>Add Field</button>
            <button onClick={handleSaveNote}>Save Note</button>
        </div>
    );
}

export default NoteEditor;
