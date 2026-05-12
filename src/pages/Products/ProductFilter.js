import React from 'react';
import { useI18n } from '../../context/I18nContext';

function ProductFilter({ categories, selectedCategory, onCategoryChange }) {
    const { t } = useI18n();
    const categoryToKey = {
        '全部': 'ProductsAll',
        'Web开发': 'ProductCategoryWebDev',
        '数据分析': 'ProductCategoryDataAnalysis',
        '学术项目': 'ProductCategoryAcademic',
        '开发服务': 'ProductCategoryDevService',
    };
    const getCategoryLabel = (cat) => (categoryToKey[cat] ? t(categoryToKey[cat]) : cat);
    return (
        <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
                <button
                    key={category}
                    onClick={() => onCategoryChange(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                        selectedCategory === category
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    {getCategoryLabel(category)}
                </button>
            ))}
        </div>
    );
}

export default ProductFilter;
