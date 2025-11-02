import React from 'react';

function ProductFilter({ categories, selectedCategory, onCategoryChange }) {
    return (
        <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
                <button
                    key={category}
                    onClick={() => onCategoryChange(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                        selectedCategory === category
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}

export default ProductFilter;
