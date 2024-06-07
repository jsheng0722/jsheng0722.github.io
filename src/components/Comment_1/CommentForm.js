import React, { useState } from 'react';

function CommentForm({ handleSubmit, submitLabel, hasCancelButton = false, initialText = "", handelCancel }) {
    const [text, setText] = useState(initialText);
    const isTextareaDisabled = text.length === 0;

    const onSubmit = (e) => {
        e.preventDefault();
        handleSubmit(text);
        setText("");
    }

    return (
        <div className="my-4 mx-auto w-full bg-white p-4 shadow-md rounded-lg">
            <div className="flex items-start space-x-4">
                <img className="w-12 h-12 rounded-full" src={`${process.env.PUBLIC_URL + '/images/avatar.png'}`} alt="User Avatar" />
                <form className="flex-grow" onSubmit={onSubmit}>
                    <textarea  
                        className="w-full h-24 p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        placeholder="Leave a comment..."
                        value={text} 
                        onChange={(e) => setText(e.target.value)}
                    />
                    <button 
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                        type="submit"
                        disabled={isTextareaDisabled}
                    >
                        {submitLabel}
                    </button>
                    {hasCancelButton && (
                        <button
                            className="mt-2 ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
                            type="button"
                            onClick={handelCancel}
                        >
                            Cancel
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}

export default CommentForm;
