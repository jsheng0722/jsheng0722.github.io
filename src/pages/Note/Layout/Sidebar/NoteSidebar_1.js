import React, { useState, useEffect, useMemo } from 'react';
import { useModal } from '../../ModalProvider';
import IconComponent from '../../IconComponent';

function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
}

function NoteSidebar({ notes, onSelectNote, currentNote }) {
    const { openModal } = useModal();
    const [sortType, setSortType] = useState('title');
    const [tags, setTags] = useState({});
    const [activeTag, setActiveTag] = useState('all');  // State to keep track of the currently selected tag
    const [showTags, setShowTags] = useState(false);

    useEffect(() => {
        // Loading tags from a JSON file located in the 'public/content' directory
        fetch('/content/tags.json')
            .then(response => response.json())
            .then(data => setTags(data))
            .catch(error => console.error('Failed to load tags', error));
    }, []);

    const sortedAndFilteredNotes = useMemo(() => {
        // Filter notes first based on the selected tag, then sort them
        let filteredNotes = notes;
        if (activeTag !== 'all') {
            filteredNotes = notes.filter(note => note.tags && note.tags.includes(activeTag));
        }

        return filteredNotes.sort((a, b) => {
            if (sortType === 'title') {
                return a.title.localeCompare(b.title);
            } else if (sortType === 'date') {
                return new Date(b.date) - new Date(a.date);
            } else {
                return a.author.localeCompare(b.author);
            }
        });
    }, [notes, sortType, activeTag]);

    const getTitleStyle = (note) => {
        if (currentNote && note.id === currentNote.id) {
            return "whitespace-normal break-words";
        }
        return "truncate";
    };

    const toggleTagsDisplay = () => {
        setShowTags(!showTags);
    };

    return (
        <div className="bg-gray-50 text-gray-800 flex flex-col h-screen sticky top-0 z-50">
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
                <div className='flex flex-col md:flex-row justify-between items-center mx-2 my-2 overflow-visible'>
                    <button onClick={toggleTagsDisplay} className="text-sm text-white bg-green-300 rounded p-2 hover:bg-green-400 mb-2 md:mb-0 w-full md:w-auto">
                        {showTags ? 'Hide Tags' : 'Show Tags'}
                    </button>
                    <select 
                        onChange={(e) => setSortType(e.target.value)}
                        className=" mx-2 outline-none bg-white border border-gray-300 rounded p-2 cursor-pointer w-full md:w-auto overflow-visible"
                        style={{ minWidth: "1vw", maxWidth: "100%" }}>
                        <option value="title">Title</option>
                        <option value="date">Date</option>
                        <option value="author">Author</option>
                    </select>
                </div>


                {showTags && (
                    <div>
                        {Object.entries(tags).map(([tag, count]) => (
                            <button key={tag}
                                    onClick={() => setActiveTag(tag)}
                                    style={{ backgroundColor: stringToColor(tag), color: 'white' }}
                                    className={`p-2 rounded m-2 text-[0.8vw] ${activeTag === tag ? 'active' : ''}`}>
                                {tag} | {count}
                            </button>
                        ))}
                        <button onClick={() => setActiveTag('all')} className="p-2 rounded text-[white] bg-gray-600 m-2">
                            Show All
                        </button>
                    </div>
                )}
                <hr className='mt-2 border-t-2 border-gray-400'></hr>
                <ul className="divide-y divide-gray-300">
                    {sortedAndFilteredNotes.map((note) => (
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
