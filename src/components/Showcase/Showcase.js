import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight, FaExternalLinkAlt } from 'react-icons/fa';

function Showcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showcaseItems] = useState([
    {
      id: 1,
      title: '最新文章',
      description: '用更现代的方式组织学习资料与示例代码。',
      image: '/images/article-preview.jpg',
      link: '/notes',
      category: '学习资源',
      date: '2024-01-15'
    },
    {
      id: 2,
      title: '开源项目',
      description: '持续维护个人网站与工具库，欢迎Star与贡献。',
      image: '/images/project-preview.jpg',
      link: '/portfolio',
      category: '项目展示',
      date: '2024-01-10'
    },
    {
      id: 3,
      title: '正在进行',
      description: '组件库无障碍与暗黑模式适配优化。',
      image: '/images/work-in-progress.jpg',
      link: '/products',
      category: '开发中',
      date: '2024-01-12'
    },
    {
      id: 4,
      title: '技术分享',
      description: '分享前端开发经验与最佳实践。',
      image: '/images/tech-share.jpg',
      link: '/notes',
      category: '技术文章',
      date: '2024-01-08'
    }
  ]);

  // 自动轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === showcaseItems.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [showcaseItems.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === showcaseItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? showcaseItems.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">展示窗</h3>
      
      <div className="relative">
        {/* 轮播内容 */}
        <div className="overflow-hidden rounded-lg">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {showcaseItems.map((item) => (
              <div key={item.id} className="w-full flex-shrink-0">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.date).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {item.title}
                  </h4>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => window.location.href = item.link}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <span>查看详情</span>
                      <FaExternalLinkAlt className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 导航按钮 */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <FaArrowRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        {/* 指示器 */}
        <div className="flex justify-center space-x-2 mt-4">
          {showcaseItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 快速访问 */}
      <div className="mt-6">
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">快速访问</h5>
        <div className="grid grid-cols-2 gap-2">
          {showcaseItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => window.location.href = item.link}
              className="p-2 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                {item.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {item.category}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Showcase;
