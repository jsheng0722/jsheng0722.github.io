import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

function Navbar ({ navTitles }) {
  return (
    <nav className="text-white p-4">
      <div className="flex justify-between space-x-1 md:space-x-2">
        {navTitles.map((title, index) => (
            <Link
              key={index}
              to={`/${title.toLowerCase()}`}
              className="text-xs md:text-sm px-1 md:px-2 py-2 rounded hover:bg-gray-700"
            >
              {title}
            </Link>
          ))}
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  navTitles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Navbar;

