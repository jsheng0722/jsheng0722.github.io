import React from 'react';

function IconComponent({normalIcon, hoverIcon}) {

    return (
        <img
            src={normalIcon}
            alt="Tutor Icon"
            onMouseEnter={e => e.currentTarget.src = hoverIcon}
            onMouseLeave={e => e.currentTarget.src = normalIcon}
            className="w-6 h-6"
        />
    );
}

export default IconComponent;