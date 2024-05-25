import React from 'react';

function SkillCategory ({ title, skills }) {
    return (
        <div className="w-1/3 p-8">
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <div className="grid grid-cols-3 gap-8">
                {skills.map((skill, index) => (
                    <a key={index} href={skill.link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                        <img src={`${process.env.PUBLIC_URL + skill.icon}`} alt={skill.name} className="h-12 w-12 rounded-full"/>
                        <span className="text-sm mt-1 w-20 text-center overflow-hidden">{skill.name}</span>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default SkillCategory;