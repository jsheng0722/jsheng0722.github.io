import React from 'react';
import { useModal } from '../../ModalProvider';
import IconComponent from '../../IconComponent';


function NoteSidebar({ notes, onSelectNote, currentNote, onNewNote }) {
    const { openModal } = useModal();

    const getTitleStyle = (note) => {
        if (currentNote && note.id === currentNote.id) {
            return "whitespace-normal break-words";
        }
        return "truncate";
    };

    return (
        <div className="bg-gray-50 text-gray-800 flex flex-col h-screen">
            <div className="flex-grow overflow-auto sticky top-0">
            <div className="flex justify-between items-center p-6 bg-blue-200 text-gray-800">
                <h2 className="text-xl font-bold">Notes</h2>
                <h3 className="absolute top-1 right-2">
                <span onClick={openModal} className="cursor-pointer">
                    <IconComponent normalIcon='/icons/tutor.svg' hoverIcon='/icons/tutor-hover.svg'/>
                </span>
                </h3>
            </div>
            <ul className="divide-y divide-gray-300">
                {notes.map((note) => (
                    <li
                        key={note.id}
                        onClick={() => onSelectNote(note)}
                        className={`px-6 py-3 hover:bg-blue-100 cursor-pointer transition-colors ${currentNote && currentNote === note ? 'bg-blue-300' : ''}`}
                    >
                        <div className={getTitleStyle(note)}>
                            {note.title}
                        </div>
                        
                    </li>
                ))}
            </ul>
            </div>
            <div className="p-4 bg-gray-100">
                <button onClick={onNewNote} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
                    New Note
                </button>
            </div>
        </div>
    );
}

export default NoteSidebar;

