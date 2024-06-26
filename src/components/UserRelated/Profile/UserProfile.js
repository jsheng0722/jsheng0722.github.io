import React, { useState } from 'react';
import UserAvatarDropdown from './UserAvatarDropDown';

function UserProfile() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);


    return (
        <div className="flex">
            {/* Main content area might include these components conditionally */}
            <header className="flex flex-row justify-between items-center p-4">
                <UserAvatarDropdown avatar='/images/avatar.png' isDropdownOpen={isDropdownOpen} toggleDropdown={toggleDropdown} />
            </header>
            {/* Rest of the page content */}
        </div>
    );
}

export default UserProfile;
