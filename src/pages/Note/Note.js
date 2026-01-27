    import React, { useEffect, useState } from 'react';
    import Header from "../../components/Layout/Header/Header";
    import Footer from '../../components/Layout/Footer/Footer';
    import NoteSidebar from './Layout/Sidebar/NoteSidebar';
    import NoteMain from './Layout/Main/NoteMain';
    import { ModalProvider } from './ModalProvider';

    function Note() {
        const [notes, setNotes] = useState([]);
        const [currentNote, setCurrentNote] = useState(null);

        useEffect(() => {
            fetch('/content/noteList_s.json')
                .then(response => response.json())
                .then(data => setNotes(data))
                .catch(error => console.error('Failed to load notes', error));
        }, []);

        const handleSelectNote = fileName => {
            setCurrentNote(fileName);
        };

        return (
            <div>
                <Header />
                <ModalProvider>
                    <div className="flex flex-row min-h-screen">
                        <div className='w-[20%] bg-gray-200'>
                            <NoteSidebar notes={notes} onSelectNote={handleSelectNote} currentNote={currentNote}/>
                        </div>
                        <div className='w-[80%] p-10'>
                            { currentNote ? (
                                <NoteMain note={currentNote}/>
                            ) : (
                                <div>Select a note to view or create a new one.</div>
                            )}
                        </div>
                    </div>
                </ModalProvider>
                <Footer />
            </div>
        );
    }

    export default Note;
