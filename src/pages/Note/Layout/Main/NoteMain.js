import React from 'react';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

function NoteMain({ note }) {
    const excludeKeys  = ['id','title','author','date','content']
    
    const htmlContent = md.render(note.content);
    const formatKey = (key) => {
        return key.charAt(0).toUpperCase() + key.slice(1);
    };
    return (
        <div>
            {!note && <div>Select a note to view or create a new one.</div>}
            {note && (
                <div>
                    <h1 className='text-[30px]'>{note.title}</h1>
                    <div className='mt-5'>
                        <strong>Author:</strong> {note.author}
                    </div>
                    <div className='mt-3'>
                        <strong>Date:</strong> {note.date}
                    </div>
                    {Object.entries(note).map(([key, value]) => {
                        if (!excludeKeys.includes(key)) {
                            return (
                                <div className='mt-3' key={key}>
                                    <strong>{formatKey(key)}:</strong> {value}
                                </div>
                            );
                        }
                        return null;
                    })}
                    <hr className=' mt-2 mb-2'></hr>
                    <div className="mt-8">
                        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default NoteMain;



