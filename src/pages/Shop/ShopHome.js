import React, { useState, useEffect } from 'react';
import { FaHeart, FaExternalLinkAlt, FaStar, FaSearch, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';

function ShopHome() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [sortBy, setSortBy] = useState('name');

  const categories = ['全部', '电子产品', '服装', '家居', '图书', '运动', '美妆', '食品', '其他'];

  useEffect(() => {
    // 从localStorage加载用户收藏的商品
    const loadUserProducts = () => {
      try {
        const savedProducts = localStorage.getItem('userProducts');
        if (savedProducts) {
          const products = JSON.parse(savedProducts);
          setProducts(products);
          setFilteredProducts(products);
        } else {
          // 如果没有保存的商品，显示空状态
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (error) {
        console.error('加载商品数据失败:', error);
        setProducts([]);
        setFilteredProducts([]);
      }
    };

    loadUserProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // 按分类筛选
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // 按搜索词筛选
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        product.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'date':
          return new Date(b.addedDate) - new Date(a.addedDate);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, sortBy]);

  const getStatusColor = (status) => {
    switch (status) {
      case '已购买':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case '收藏中':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case '考虑中':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            我的商品收藏
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            分享我喜欢的商品 · 记录购买心得 · 推荐优质好物
          </p>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* 搜索框 */}
            <div className="flex-1 w-full relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索商品名称、描述或标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 分类筛选 */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* 排序 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">按名称</option>
              <option value="price-low">价格从低到高</option>
              <option value="price-high">价格从高到低</option>
              <option value="rating">按评分</option>
              <option value="date">按添加时间</option>
            </select>

            {/* 添加商品按钮 */}
            <Link
              to="/shop/add"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              添加商品
            </Link>
          </div>
        </div>

        {/* 商品网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* 商品图片 */}
              <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl text-gray-400">📦</div>
                </div>
                
                {/* 折扣标签 */}
                {product.originalPrice > product.price && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </div>
                )}

                {/* 状态标签 */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </div>

                {/* 收藏按钮 */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-white text-red-500 rounded-full shadow-lg hover:bg-red-50 transition-colors">
                    <FaHeart className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 商品信息 */}
              <div className="p-6">
                {/* 分类标签 */}
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-block bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded text-xs font-medium">
                    {product.category}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {product.addedDate}
                  </span>
                </div>

                {/* 商品名称 */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                {/* 商品描述 */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* 推荐理由 */}
                <div className="mb-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    " {product.reason} "
                  </p>
                </div>

                {/* 评分 */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {product.rating} ({product.reviews})
                  </span>
                </div>

                {/* 价格 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      ¥{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ¥{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {product.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                  {product.tags.length > 3 && (
                    <span className="px-2 py-1 text-gray-400 text-xs">
                      +{product.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-2">
                  <a
                    href={product.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaExternalLinkAlt className="w-4 h-4" />
                    查看商品
                  </a>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <FaHeart className="w-4 h-4" />
                  </button>
                </div>

                {/* 来源信息 */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    来源: {product.source}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 无结果提示 */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {products.length === 0 ? '还没有收藏任何商品' : '未找到匹配的商品'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {products.length === 0 
                ? '开始收藏您喜欢的商品吧！' 
                : '尝试调整搜索条件或筛选器'
              }
            </p>
            {products.length === 0 && (
              <Link
                to="/shop/add"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <FaPlus className="w-4 h-4" />
                添加第一个商品
              </Link>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ShopHome;
