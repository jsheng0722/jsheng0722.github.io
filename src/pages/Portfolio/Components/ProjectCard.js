import React from 'react';

const ProjectCard = ({ title, description, listItems, imageUrl, technology, period }) => {
    return (
        <div className="w-full p-4">
            <div className="h-full p-6 rounded shadow-lg bg-gray-50 flex flex-row justify-between items-center">
                <div className='flex-[3]'>
                    <img src={`${process.env.PUBLIC_URL + imageUrl}`} alt={title} className="w-full h-32 object-cover rounded" />
                </div>
                <div className='flex flex-[9] flex-col ml-10'>
                    <h3 className="mt-2 mb-2 font-bold text-lg">{title}</h3>
                    <p className="mb-2 text-gray-500 text-md">{description}</p>
                    <ul className="flex-1 text-sm list-inside list-disc">
                        {listItems.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                    <p className='text-sm mt-3 text-gray-700'><strong>Technology used: </strong>{technology}</p>
                    <div className="text-right">
                        <p>{period}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;

