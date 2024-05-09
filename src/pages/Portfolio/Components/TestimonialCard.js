import React from 'react';

function TestimonialCard ({ image, name, text }) {
    return (
        <div className="flex lg:flex-row items-center justify-center max-w-sm rounded overflow-hidden shadow-lg bg-gray-200 text-center p-4 rounded w-auto h-[150px] flex-col">
            <div className='flex-[4]'>
                <img src={image} alt={name} className="w-24 h-24 rounded-full"/>
            </div>
            <div className="flex-[8] mt-4">
                <h5 className="font-bold text-left text-md">{name}</h5>
                <p className="text-gray-500 mt-1 text-xs">{text}</p>
            </div>
        </div>
    );
};

export default TestimonialCard;