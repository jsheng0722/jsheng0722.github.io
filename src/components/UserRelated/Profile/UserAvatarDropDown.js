import React, { useEffect, useRef, useCallback  } from 'react';

function UserAvatarDropdown ({ avatar, isDropdownOpen, toggleDropdown }) {
    const dropdownRef = useRef(); 

  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        toggleDropdown(false);
    }
  }, [toggleDropdown]);

  useEffect(() => {
    if (isDropdownOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    } else {
        document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
    }, [isDropdownOpen, handleClickOutside]);
    return (
        <div className="hidden md:block w-12 h-12">
            <img src={avatar} alt="User Avatar" className="rounded-full cursor-pointer border-4 border-green-600" onClick={() => toggleDropdown(!isDropdownOpen)} />
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-lg z-50" ref={dropdownRef}>
                    <a href="#profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Profile</a>
                    <a href="#settings" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Settings</a>
                    <a href="#logout" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Logout</a>
                </div>
            )}
        </div>
    );
};

export default UserAvatarDropdown;