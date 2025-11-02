import React from 'react';
import { useNavigate } from 'react-router-dom';

function DesktopShortcut({ icon: Icon, label, path, color = 'text-blue-500' }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
  };

  return (
    <div
      onClick={handleClick}
      className="flex flex-col items-center p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
    >
      <div className={`w-12 h-12 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700 group-hover:scale-110 transition-transform ${color}`}>
        <Icon className="w-8 h-8" />
      </div>
      <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
        {label}
      </span>
    </div>
  );
}

export default DesktopShortcut;
