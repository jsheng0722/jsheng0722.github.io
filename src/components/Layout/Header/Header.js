import Navbar from '../Navbar/Navbar';
import UserProfile from "../../UserRelated/Profile/UserProfile";
// import SearchBar from '../Searchbar/Searchbar';
import LeftSideMenu from "../../UserRelated/SideMenu/LeftSideMenu";
import React, { useState } from 'react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className=" bg-gray-800 flex flex-row w-full">
    <div className="flex w-[20%]">
      {/* Top bar for mobile */}
      <div className="flex bg-green-900 w-full md:hidden text-white items-center justify-center">
          <LeftSideMenu avatar='/images/avatar.png' isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      </div>
    </div>
    <div className="flex w-full items-center justify-center">
      <div className="w-[60%]">
        <Navbar navTitles={['Home', 'Portfolio', 'Notes', 'Products']} />
      </div>
      <div className="hidden md:block w-[40%] ml-5">
        {/* <SearchBar /> */}
      </div>
    </div>
    <div className="hidden md:block w-[10%]">
      <div className="flex items-center justify-center">
        <UserProfile />
      </div>
    </div>
    </header>

    )
}

export default Header;
