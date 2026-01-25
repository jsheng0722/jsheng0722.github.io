import React, { useState } from 'react';

function WelcomeBanner() {
  // 使用风景图，可以从 Unsplash 或其他免费图片服务获取
  const welcomeImage = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop&q=80'; // 美丽的风景图
  const [imageError, setImageError] = useState(false);

  return (
    <div className="w-full flex justify-center items-center">
      <div className="w-full max-w-4xl">
        {!imageError ? (
          <img
            src={welcomeImage}
            alt="欢迎"
            className="w-full h-auto rounded-lg shadow-lg object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-lg shadow-lg flex items-center justify-center text-white text-2xl font-bold">
            欢迎图片
          </div>
        )}
      </div>
    </div>
  );
}

export default WelcomeBanner;

