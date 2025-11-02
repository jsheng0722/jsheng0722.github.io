import React from 'react';
import { FaMusic } from 'react-icons/fa';

function MusicIcon({ isPlaying = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-40 p-3 rounded-full shadow-lg transition-all duration-300 ${
        isPlaying 
          ? 'bg-blue-600 text-white animate-pulse' 
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-600 hover:text-white'
      }`}
      title="音乐播放器"
    >
      <FaMusic className="w-6 h-6" />
    </button>
  );
}

export default MusicIcon;
