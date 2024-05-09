
import React, { useState } from 'react';

function SearchComponent() {
  const [searchFocus, setSearchFocus] = useState(false);

  const handleSearchFocus = () => {
    setSearchFocus(true);
  };

  const handleSearchBlur = () => {
    setSearchFocus(false);
  };

  return (
    <div className="flex flex-col items-center bg-white rounded overflow-hidden border border-gray-300">
      <input
        type="text"
        className="px-4 py-2 w-full"
        placeholder="Search..."
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
      />
      {searchFocus && (
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 w-full mt-2"
        >
          Search
        </button>
      )}
    </div>
  );
}

export default SearchComponent;
;
