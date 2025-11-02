import React from 'react';
import { FaExternalLinkAlt, FaGithub, FaCode, FaDollarSign, FaCheckCircle } from 'react-icons/fa';

function ProductCard({ product }) {
    const getStatusColor = (status) => {
        switch (status) {
            case '已完成':
                return 'bg-green-100 text-green-800';
            case '提供服务':
                return 'bg-blue-100 text-blue-800';
            case '持续进行':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriceColor = (price) => {
        if (price === '免费' || price === '免费开源') {
            return 'text-green-600';
        } else if (price === '面议') {
            return 'text-blue-600';
        } else {
            return 'text-gray-600';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            {/* 产品图片 */}
            <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                {product.image ? (
                    <img 
                        src={product.image} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div className="text-white text-6xl opacity-80" style={{ display: product.image ? 'none' : 'flex' }}>
                    <FaCode />
                </div>
            </div>

            {/* 产品内容 */}
            <div className="p-6">
                {/* 标题和状态 */}
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                        {product.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {product.status}
                    </span>
                </div>

                {/* 分类 */}
                <div className="mb-3">
                    <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                        {product.category}
                    </span>
                </div>

                {/* 描述 */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {product.description}
                </p>

                {/* 技术栈 */}
                <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                        {product.technologies.slice(0, 4).map((tech, index) => (
                            <span 
                                key={index}
                                className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                            >
                                {tech}
                            </span>
                        ))}
                        {product.technologies.length > 4 && (
                            <span className="bg-gray-50 text-gray-500 px-2 py-1 rounded text-xs">
                                +{product.technologies.length - 4}
                            </span>
                        )}
                    </div>
                </div>

                {/* 价格 */}
                <div className="flex items-center mb-4">
                    <FaDollarSign className="text-gray-400 mr-1" />
                    <span className={`font-semibold ${getPriceColor(product.price)}`}>
                        {product.price}
                    </span>
                </div>

                {/* 功能特性 */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">主要特性：</h4>
                    <ul className="space-y-1">
                        {product.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600">
                                <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                                {feature}
                            </li>
                        ))}
                        {product.features.length > 3 && (
                            <li className="text-sm text-gray-500">
                                还有 {product.features.length - 3} 个特性...
                            </li>
                        )}
                    </ul>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-2">
                    {product.demoUrl && (
                        <a
                            href={product.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                        >
                            <FaExternalLinkAlt className="mr-2" />
                            查看演示
                        </a>
                    )}
                    {product.githubUrl && (
                        <a
                            href={product.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${product.demoUrl ? 'flex-1' : 'w-full'} bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors duration-200 flex items-center justify-center`}
                        >
                            <FaGithub className="mr-2" />
                            {product.demoUrl ? '源码' : '查看项目'}
                        </a>
                    )}
                    {!product.demoUrl && !product.githubUrl && (
                        <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200">
                            联系咨询
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
