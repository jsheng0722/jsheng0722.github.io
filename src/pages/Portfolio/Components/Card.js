import React from 'react';

const Card = ({ title, region, major, destitle, description, imageUrl, linkUrl }) => {
    return (
        <div className="flex sm:flex-row m-4 items-center justify-center flex-col">
            <div className='flex-[3] w-[200px] h-auto'>
                <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-75 transition-opacity duration-300">
                    <img className="w-full h-auto" src={`${process.env.PUBLIC_URL + imageUrl}`} alt="Display" />
                </a>
            </div>
            <div className="flex-[9] p-5">
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
