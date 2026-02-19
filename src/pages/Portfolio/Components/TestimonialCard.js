import React, { useState } from 'react';

function TestimonialCard({ image, name, text }) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = image && typeof image === 'string'
    ? (image.startsWith('http') ? image : `${process.env.PUBLIC_URL || ''}${image.startsWith('/') ? '' : '/'}${image}`)
    : '';
  const showFallback = !imgSrc || imgError;
  const initial = name ? String(name).trim().charAt(0).toUpperCase() : '?';

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center max-w-sm rounded-xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-700 text-center p-5 min-h-[140px] w-full">
      <div className="flex-shrink-0">
        {showFallback ? (
          <div
            className="w-24 h-24 rounded-full bg-blue-500 dark:bg-blue-600 text-white flex items-center justify-center text-2xl font-semibold"
            aria-hidden
          >
            {initial}
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={name || 'Avatar'}
            className="w-24 h-24 rounded-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="lg:ml-4 mt-4 lg:mt-0 flex-1 text-left min-w-0">
        <h5 className="font-bold text-gray-900 dark:text-gray-100 text-base">{name || '—'}</h5>
        <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm line-clamp-4">{text || '—'}</p>
      </div>
    </div>
  );
}

export default TestimonialCard;
