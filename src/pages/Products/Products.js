import React, { useState, useEffect } from 'react';
import Header from '../../components/Layout/Header/Header';
import Footer from '../../components/Layout/Footer/Footer';
import ProductCard from './ProductCard';
import ProductFilter from './ProductFilter';

function Products() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('全部');

    useEffect(() => {
        fetch('/me/products.json')
            .then(response => response.json())
            .then(data => {
                setProducts(data);
                setFilteredProducts(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading products:', error);
                setLoading(false);
            });
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
                product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredProducts(filtered);
    }, [products, selectedCategory, searchTerm]);

    const categories = ['全部', ...new Set(products.map(product => product.category))];

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">加载中...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            
            {/* 页面标题和搜索 */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">我的产品与服务</h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            展示我的技术能力、开发项目以及提供的专业服务
                        </p>
                    </div>
                    
                    {/* 搜索栏 */}
                    <div className="max-w-md mx-auto mb-8">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="搜索产品或技术..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 筛选器和产品网格 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ProductFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                />
                
                {/* 产品网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {/* 无结果提示 */}
                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">没有找到匹配的产品</h3>
                        <p className="mt-1 text-sm text-gray-500">尝试调整搜索条件或筛选器</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default Products;
