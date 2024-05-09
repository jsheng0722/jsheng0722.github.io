import React from 'react';

const Card = ({ title, region, major, destitle, description, imageUrl }) => {
    return (
        <div className="flex sm:flex-row m-4 items-center justify-center flex-col">
            <img className="w-auto h-[100px]" src={imageUrl} alt="Display" />
            <div className="p-4">
                <div className="text-x mb-2">
                    <div className='text-x text-right'><strong className='flex text-left'>{title}</strong>{region}</div>
                </div>
                <div className='text-gray-400 text-base hidden md:inline'>{major}</div>
                <div className='text-sm mt-1'>
                    <div className='text-gray-500 hidden lg:inline'><strong>{destitle}</strong>{description}</div>
                </div>
            </div>
            {/* <div className="px-6 pt-4 pb-2">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Learn More
                </button>
            </div> */}
        </div>
    );
};

export default Card;
