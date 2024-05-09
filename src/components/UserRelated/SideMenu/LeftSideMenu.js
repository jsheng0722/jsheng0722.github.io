import React, { useEffect, useRef, useCallback  } from 'react';
// import MenuSearchbar from '../../Layout/Searchbar/MenuSearchbar';

function LeftSideMenu ({ avatar, isMenuOpen, toggleMenu }) {
  const menuRef = useRef(); 

  const handleClickOutside = useCallback((event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
        toggleMenu(false);
    }
  }, [toggleMenu]);

  useEffect(() => {
    if (isMenuOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    } else {
        document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, [isMenuOpen, handleClickOutside]);

  return (
    <div>
      <button className="p-2" onClick={() => toggleMenu(!isMenuOpen)}>
          Menu
      </button> 
      {isMenuOpen && (
          <div className="fixed inset-0 bg-white p-4 z-50 opacity-100 w-[35%]" ref={menuRef}>
              <div className="flex justify-between items-center text-black">
                  <h2 className="text-xl font-semibold">Menu</h2>
                  <button className="p-2 text-xl font-bold" onClick={toggleMenu}>×</button>
              </div>
              <div className="flex flex-col">
                <img src={avatar} alt="User Avatar" className="w-24 h-24 rounded-full m-auto" />
                <a href="#profile" className="block m-auto py-2 pt-6 text-gray-800 hover:bg-gray-100">Profile</a>
                <a href="#settings" className="block m-auto py-2 text-gray-800 hover:bg-gray-100">Settings</a>
                <a href="#logout" className="block m-auto py-2 text-gray-800 hover:bg-gray-100">Logout</a>
                <div className='mt-5'>
                  {/* <MenuSearchbar /> */}
                </div>
              </div>
          </div>
      )}
  </div>
  );
};

export default LeftSideMenu;