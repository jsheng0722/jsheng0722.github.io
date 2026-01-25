import React, { useState, useEffect } from 'react';

/**
 * 链表可视化组件
 * 用于展示链表结构
 * 从实际执行的 steps 中提取链表数据
 */
function LinkedListVisualizer({ code, currentStep, steps, isPlaying, speed, onStepChange }) {
  const [listData, setListData] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // 从 steps 中提取链表数据
  useEffect(() => {
    if (steps.length > 0 && currentStep < steps.length) {
      const step = steps[currentStep];
      
      // 尝试从步骤中提取链表数据
      if (step.linkedList) {
        setListData(step.linkedList);
      } else if (step.list) {
        setListData(step.list);
      } else if (step.data && step.data.linkedList) {
        setListData(step.data.linkedList);
      } else if (step.data && step.data.list) {
        setListData(step.data.list);
      }
      
      // 设置高亮索引
      if (step.highlightedIndex !== undefined) {
        setHighlightedIndex(step.highlightedIndex);
      } else if (step.currentIndex !== undefined) {
        setHighlightedIndex(step.currentIndex);
      }
    }
  }, [currentStep, steps]);

  // 如果没有从步骤中提取到数据，尝试从代码中解析或使用默认值
  useEffect(() => {
    if (listData.length === 0 && steps.length === 0) {
      // 尝试从代码中提取链表结构（简单解析）
      // 暂时使用默认示例，但会在执行后更新
      setListData([
        { value: 1, next: true },
        { value: 2, next: true },
        { value: 3, next: true },
        { value: 4, next: false }
      ]);
    }
  }, [listData.length, steps.length]);

  if (listData.length === 0) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          等待代码执行以显示链表结构...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
          链表可视化
        </h3>
        {steps[currentStep]?.message && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
            {steps[currentStep].message}
          </div>
        )}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {listData.map((node, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <div 
                  className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all ${
                    highlightedIndex === index 
                      ? 'bg-yellow-500 scale-110' 
                      : 'bg-blue-500'
                  }`}
                >
                  {node.value}
                </div>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Node {index}
                </div>
              </div>
              {node.next && (
                <div className="flex items-center">
                  <div className="w-8 h-1 bg-gray-400"></div>
                  <div className="w-0 h-0 border-t-4 border-t-transparent border-l-8 border-l-gray-400 border-b-4 border-b-transparent"></div>
                </div>
              )}
            </React.Fragment>
          ))}
          {listData.length > 0 && !listData[listData.length - 1]?.next && (
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold">
              null
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LinkedListVisualizer;

