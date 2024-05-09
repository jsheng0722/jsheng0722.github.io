import React, { useState } from 'react';

function SearchBar() {
  const [input, setInput] = useState('');

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = () => {
    console.log('Search for:', input);  // Implement search logic or redirect
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <input
          type="text"
          className="w-full h-10 pl-10 pr-20 rounded-lg z-0 focus:shadow focus:outline-none"
          placeholder="Search anything..."
          value={input}
          onChange={handleInputChange}
        />
        <div className="absolute top-2 left-3">
          <i className="fa fa-search text-gray-400 z-20 hover:text-gray-500"></i>
        </div>
        <button
          className="absolute top-2 right-2 h-6 w-16 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          onClick={handleSubmit}
        >
          Search
        </button>
      </div>
    </div>
  );
}

export default SearchBar;
