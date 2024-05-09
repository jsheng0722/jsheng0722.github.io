import React, { useState, useMemo } from 'react';
import { useModal } from '../../ModalProvider';
import IconComponent from '../../IconComponent';

function NoteSidebar({ notes, onSelectNote, currentNote }) {
    const { openModal } = useModal();
    const [sortType, setSortType] = useState('title');

    const getTitleStyle = (note) => {
        if (currentNote && note.id === currentNote.id) {
            return "whitespace-normal break-words";
        }
        return "truncate";
    };
    
    const sortedNotes = useMemo(() => {
        const notesCopy = [...notes];
        if (sortType === 'title') {
            notesCopy.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortType === 'date') {
            notesCopy.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sortType === 'author') {
            notesCopy.sort((a, b) => a.author.localeCompare(b.author));
        }
        return notesCopy;
    }, [notes, sortType]);

    return (
        <div className="bg-gray-50 text-gray-800 flex flex-col h-screen">
            <div className="flex-grow overflow-auto sticky top-0 z-10">
                <div className="flex flex-col justify-between items-center p-2 bg-blue-200 text-gray-800 sm:flex-row">
                    <h2 className="text-xl font-bold">Notes</h2>
                    <div className="flex flex-col items-end sm:items-start">
                        <h3>
                            <span onClick={openModal} className="cursor-pointer">
                                <IconComponent normalIcon='/icons/tutor.svg' hoverIcon='/icons/tutor-hover.svg'/>
                            </span>
                        </h3>
                    </div>
                </div>
                <div className='flex justify-end mx-2 items-end sm:items-start'>
                    <select 
                        onChange={(e) => setSortType(e.target.value)}
                        className="outline-none bg-white border border-gray-300 rounded p-2 cursor-pointer mt-2 w-full max-w-xs sm:w-auto overflow-hidden text-ellipsis">
                        <option value="title">Title</option>
                        <option value="date">Date</option>
                        <option value="author">Author</option>
                    </select>
                </div>
                <hr className='mt-2 border-t-2 border-gray-400'></hr>
                <ul className="divide-y divide-gray-300">
                    {sortedNotes.map((note) => (
                        <li
                            key={note.id}
                            onClick={() => onSelectNote(note)}
                            className={`px-6 py-3 hover:bg-blue-100 cursor-pointer transition-colors ${
                                note.id === currentNote?.id ? 'bg-blue-300' : ''
                            }`}
                        >
                            <div className={getTitleStyle(note)}>
                                {note.title}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

    );
}

export default NoteSidebar;
