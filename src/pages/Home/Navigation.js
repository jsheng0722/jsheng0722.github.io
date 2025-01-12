import React from 'react';

function Navigation({ directories, onNavClick }) {
    return (
        <nav className="w-full bg-gray-100">
            <div className="mx-auto w-4/5 flex items-center justify-center py-3">
                {directories.map((dir,index) => (
                  <button key={index}  onClick={() => onNavClick(dir)} className="mx-4 text-black hover:text-blue-500 hover:font-bold">{dir.name}</button>
                ))}
            </div>
        </nav>
    );
}

export default Navigation;
