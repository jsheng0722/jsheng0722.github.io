import React, { useState, useEffect } from 'react';

/**
 * 排序算法可视化组件
 * 支持冒泡排序、快速排序、归并排序等
 */
function SortVisualizer({ code, currentStep, steps, isPlaying, speed, onStepChange }) {
  const [array, setArray] = useState([]); // 默认为空数组
  const [highlightedIndices, setHighlightedIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [comparingIndices, setComparingIndices] = useState([]);
  const [swapping, setSwapping] = useState(false); // 交换动画状态
  const [swapFrom, setSwapFrom] = useState(null); // 交换起始索引
  const [swapTo, setSwapTo] = useState(null); // 交换目标索引
  const [comparisonInfo, setComparisonInfo] = useState(null); // 比较信息
  const [currentVariables, setCurrentVariables] = useState({}); // 当前变量值

  useEffect(() => {
    if (isPlaying && steps.length > 0 && currentStep < steps.length) {
      const timer = setTimeout(() => {
        if (currentStep < steps.length - 1) {
          onStepChange(currentStep + 1);
        }
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStep, steps.length, speed, onStepChange]);

  useEffect(() => {
    if (steps.length > 0 && currentStep < steps.length) {
      const step = steps[currentStep];
      
      // 更新数组状态
      if (step.array) {
        setArray(step.array);
      }
      
      // 处理交换动画
      if (step.type === 'swap' && step.swappedIndices && step.swappedIndices.length === 2) {
        const [i, j] = step.swappedIndices;
        setSwapping(true);
        setSwapFrom(i);
        setSwapTo(j);
        setComparingIndices([i, j]);
        
        // 动画完成后重置
        setTimeout(() => {
          setSwapping(false);
          setSwapFrom(null);
          setSwapTo(null);
        }, 500);
      } else {
        // 更新比较索引
        if (step.type === 'compare' || step.type === 'swap') {
          if (step.highlightedIndices) {
            setComparingIndices(step.highlightedIndices);
          } else if (step.indices) {
            setComparingIndices(step.indices);
          }
          setHighlightedIndices([]);
        } else {
          if (step.highlightedIndices) {
            setHighlightedIndices(step.highlightedIndices);
          } else if (step.indices) {
            setHighlightedIndices(step.indices);
          }
        }
      }
      
      // 处理比较信息
      if (step.type === 'compare' && step.comparisonResult) {
        setComparisonInfo({
          result: step.comparisonResult,
          symbol: step.comparisonSymbol,
          indices: step.highlightedIndices || []
        });
      } else {
        setComparisonInfo(null);
      }
      
      // 更新当前变量值
      if (step.currentVariables) {
        setCurrentVariables(step.currentVariables);
      }
      
      // 如果步骤中有变量信息，根据变量值高亮对应的索引
      if (step.currentVariables) {
        const variableIndices = [];
        Object.keys(step.currentVariables).forEach(varName => {
          const value = step.currentVariables[varName];
          // 如果变量值是数字且在数组范围内，添加到高亮列表
          if (typeof value === 'number' && value >= 0 && value < array.length) {
            variableIndices.push(value);
          }
        });
        // 合并变量索引和高亮索引
        if (variableIndices.length > 0) {
          setComparingIndices(prev => {
            const combined = new Set([...prev, ...variableIndices]);
            return Array.from(combined);
          });
        }
      }
      
      // 更新已排序索引
      if (step.sortedIndices) {
        setSortedIndices(prev => {
          const newSorted = new Set(prev);
          step.sortedIndices.forEach(idx => newSorted.add(idx));
          return Array.from(newSorted);
        });
      } else if (step.type === 'sorted' && step.indices) {
        setSortedIndices(prev => {
          const newSorted = new Set(prev);
          step.indices.forEach(idx => newSorted.add(idx));
          return Array.from(newSorted);
        });
      }
      
      if (step.type === 'complete') {
        // 所有元素都已排序
        setSortedIndices(Array.from({ length: array.length }, (_, i) => i));
      }
    }
  }, [currentStep, steps, array.length]);

  const getBarColor = (index) => {
    if (sortedIndices.includes(index)) {
      return 'bg-green-500 dark:bg-green-600';
    }
    if (swapping && (index === swapFrom || index === swapTo)) {
      return 'bg-red-500 dark:bg-red-600';
    }
    if (comparingIndices.includes(index)) {
      // 根据比较结果设置不同颜色
      if (comparisonInfo && comparisonInfo.indices.includes(index)) {
        if (comparisonInfo.result === 'greater') {
          return 'bg-purple-600 dark:bg-purple-700';
        } else if (comparisonInfo.result === 'less') {
          return 'bg-blue-600 dark:bg-blue-700';
        } else {
          return 'bg-green-600 dark:bg-green-700';
        }
      }
      return 'bg-yellow-500 dark:bg-yellow-600';
    }
    if (highlightedIndices.includes(index)) {
      return 'bg-blue-500 dark:bg-blue-600';
    }
    return 'bg-gray-400 dark:bg-gray-500';
  };

  const getBarStyle = (index) => {
    const baseStyle = {
      height: `${(array[index] / Math.max(...array, 1)) * 100}%`,
      minHeight: '30px',
      transition: 'all 0.3s ease-in-out',
    };
    
    // 交换动画：计算位置偏移
    if (swapping && swapFrom !== null && swapTo !== null) {
      const containerWidth = 100 / array.length;
      if (index === swapFrom) {
        // 起始元素向右移动
        baseStyle.transform = `translateX(${containerWidth}%) translateY(-20px)`;
        baseStyle.zIndex = 10;
        baseStyle.transition = 'transform 0.5s ease-in-out';
      } else if (index === swapTo) {
        // 目标元素向左移动
        baseStyle.transform = `translateX(-${containerWidth}%) translateY(-20px)`;
        baseStyle.zIndex = 10;
        baseStyle.transition = 'transform 0.5s ease-in-out';
      }
    }
    
    // 高亮边框效果
    if (comparingIndices.includes(index) || highlightedIndices.includes(index)) {
      baseStyle.boxShadow = '0 0 15px rgba(255, 255, 0, 0.8), 0 0 5px rgba(255, 255, 0, 0.5)';
      baseStyle.border = '2px solid rgba(255, 255, 0, 0.8)';
    }
    
    return baseStyle;
  };

  // 如果没有步骤数据，显示空状态
  if (steps.length === 0 || array.length === 0) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            等待代码执行...
          </div>
          <div className="text-sm text-gray-400 dark:text-gray-500">
            请检测函数并输入参数后执行
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          排序算法可视化
        </h3>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>未排序</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>比较中</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>已排序</span>
          </div>
        </div>
      </div>

      <div className="relative flex items-end justify-center gap-2 h-64 mb-4">
        {array.map((value, index) => (
          <div
            key={index}
            className="flex flex-col items-center relative"
            style={{
              width: `${100 / array.length}%`,
            }}
          >
            {/* 比较符号显示 */}
            {comparisonInfo && 
             comparisonInfo.indices.includes(index) && 
             comparisonInfo.indices.length === 2 && (
              <div 
                className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-white text-sm font-bold z-20 ${
                  comparisonInfo.result === 'greater' ? 'bg-red-500' :
                  comparisonInfo.result === 'less' ? 'bg-blue-500' :
                  'bg-green-500'
                }`}
              >
                {comparisonInfo.symbol}
              </div>
            )}
            
            <div
              className={`${getBarColor(index)} rounded-t-lg flex items-end justify-center text-white font-semibold text-sm min-w-[40px] shadow-md relative`}
              style={getBarStyle(index)}
            >
              {value}
              {/* 交换动画指示器 */}
              {swapping && (index === swapFrom || index === swapTo) && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-red-600 dark:text-red-400 animate-bounce">
                  ⇄
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 font-mono">
              [{index}]
            </div>
          </div>
        ))}
      </div>
      
      {/* 步骤信息显示 */}
      {steps.length > 0 && currentStep < steps.length && steps[currentStep].message && (
        <div className="mt-4 text-center">
          <div className="inline-flex flex-col items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {steps[currentStep].message}
            </div>
            
            {/* 显示当前变量值 */}
            {Object.keys(currentVariables).length > 0 && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-500 dark:text-gray-400">变量:</span>
                {Object.keys(currentVariables).map(varName => (
                  <span 
                    key={varName}
                    className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded font-mono font-semibold"
                  >
                    {varName} = {currentVariables[varName]}
                  </span>
                ))}
              </div>
            )}
            
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({currentStep + 1} / {steps.length})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SortVisualizer;

