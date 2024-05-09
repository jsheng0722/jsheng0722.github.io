import React from 'react';

function ConfirmationDialog({ show, onConfirm, onCancel, title, message }) {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-5 max-w-sm w-full rounded shadow-lg">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mb-4 text-base">{message}</p>
        <div className="flex justify-end">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-l focus:outline-none focus:shadow-outline"
            onClick={onConfirm}>
            Delete
          </button>
          <button
            className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline"
            onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>

  );
}

export default ConfirmationDialog;