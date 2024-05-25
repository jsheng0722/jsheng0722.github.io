import React from 'react';
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css';
import { useModal } from '../../ModalProvider';
import Modal from 'react-modal';

Modal.setAppElement('#root');

// Define TutorModal outside the main component
const TutorModal = ({ closeModal, isOpen }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Tutor Modal"
            className="fixed bottom-0 top-0 right-0 w-[400px] border-[10px] overflow-auto bg-white transition-right duration-300"
            overlayClassName="bg-black bg-opacity-800"
        >
            <h2>Tutorial</h2>
            <iframe 
                src="/content/tutor/github_md.html"
                className='w-full h-full'
                title="GitHub Markdown Tutorial"
            ></iframe>
            <button onClick={closeModal} className='fixed top-0 right-0 mt-3 mr-10 text-[blue]'>Close</button>
        </Modal>
    );
};

function NoteMain_1({ note }) {
    const excludeKeys = ['id', 'title', 'author', 'date', 'content'];
    const { modalIsOpen, closeModal } = useModal();
    const formatKey = (key) => key.charAt(0).toUpperCase() + key.slice(1);

    return (
        <div>
            {!note && <div>Select a note to view or create a new one.</div>}
            { note && (
                <div>
                    <h1 className='text-[30px]'>{note.title}</h1>
                    <div className='mt-5'>
                        <strong>Author:</strong> {note.author}
                    </div>
                    <div className='mt-3'>
                        <strong>Date:</strong> {note.date}
                    </div>
                    {Object.entries(note).filter(([key]) => !excludeKeys.includes(key)).map(([key, value]) => (
                        <div className='mt-3' key={key}>
                            <strong>{formatKey(key)}:</strong> {value}
                        </div>
                    ))}
                    <hr className='mt-2 mb-2' />
                    <div className="mt-8">
                        <ReactMarkdown 
                          className='markdown-body' 
                          children={note.content}
                        />
                    </div>
                </div>
            )}

            <TutorModal isOpen={modalIsOpen} closeModal={closeModal} />
        </div>
    );
}

export default NoteMain_1;
