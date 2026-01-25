import React, { useState, useMemo } from 'react';
import { FaEye, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import ArrayVisualizer from './ArrayVisualizer';
import SortVisualizer from './SortVisualizer';

/**
 * 函数块组件
 * 显示单个函数的可视化内容，包括其所有步骤
 */
function FunctionBlock({
  functionId,
  functionName,
  functionSteps,
  algorithmType = 'array',
  currentStep,
  onStepChange,
  isPlaying,
  speed,
  code,
  language,
  returnValue = null,
  nextFunctionId = null,
  onViewStep = null
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewingStepIndex, setViewingStepIndex] = useState(null);

  // 计算当前函数块应该显示的步骤索引
  const blockCurrentStep = useMemo(() => {
    if (viewingStepIndex !== null) {
      // 如果正在查看特定步骤，使用该步骤
      return viewingStepIndex;
    }
    // 否则，找到当前全局步骤对应的函数内步骤索引
    // currentStep 是全局步骤索引，需要找到对应的函数内步骤
    const stepIndex = functionSteps.findIndex(step => {
      // 如果步骤有 stepIndex 属性，使用它；否则使用在 functionSteps 数组中的索引
      const globalIndex = step.stepIndex !== undefined ? step.stepIndex : functionSteps.indexOf(step);
      return globalIndex === currentStep;
    });
    return stepIndex >= 0 ? stepIndex : 0;
  }, [currentStep, functionSteps, viewingStepIndex]);

  // 获取当前步骤的数据
  const currentStepData = functionSteps[blockCurrentStep] || functionSteps[0] || null;

  // 渲染对应的可视化组件
  const renderVisualizer = () => {
    const commonProps = {
      code,
      language,
      currentStep: blockCurrentStep,
      steps: functionSteps,
      isPlaying,
      speed,
      onStepChange: (step) => {
        if (onViewStep && functionSteps[step]) {
          onViewStep(functionSteps[step].stepIndex);
        }
        setViewingStepIndex(step);
      }
    };

    switch (algorithmType) {
      case 'sort':
        return <SortVisualizer {...commonProps} />;
      case 'array':
      default:
        return <ArrayVisualizer {...commonProps} />;
    }
  };

  return (
    <div className="mb-6 border-2 border-blue-300 dark:border-blue-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      {/* 函数块头部 */}
      <div 
        className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 text-white cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <FaChevronDown className="text-sm" />
          ) : (
            <FaChevronUp className="text-sm" />
          )}
          <h3 className="text-lg font-semibold">
            {functionName}
          </h3>
          {returnValue !== null && (
            <span className="text-sm bg-green-500 dark:bg-green-600 px-2 py-1 rounded">
              返回: {JSON.stringify(returnValue)}
            </span>
          )}
          {nextFunctionId && (
            <span className="text-xs bg-yellow-500 dark:bg-yellow-600 px-2 py-1 rounded">
              → {nextFunctionId}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>{functionSteps.length} 个步骤</span>
        </div>
      </div>

      {/* 步骤列表（可折叠） */}
      {isExpanded && (
        <>
          {/* 步骤导航栏 */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                步骤: {blockCurrentStep + 1} / {functionSteps.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  在函数内
                </span>
              </div>
            </div>
            
            {/* 步骤按钮列表 */}
            <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
              {functionSteps.map((step, index) => {
                // 获取全局步骤索引：优先使用 step.stepIndex，否则使用步骤在原始数组中的位置
                const globalStepIndex = step.stepIndex !== undefined ? step.stepIndex : index;
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setViewingStepIndex(index);
                      if (onViewStep) {
                        onViewStep(globalStepIndex);
                      }
                    }}
                    className={`px-2 py-1 text-xs rounded transition-all ${
                      index === blockCurrentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                    title={step.message || `步骤 ${index + 1}`}
                  >
                    <FaEye className="inline mr-1" />
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 可视化内容 */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-[300px]">
            {functionSteps.length > 0 ? (
              <>
                {renderVisualizer()}
                
                {/* 当前步骤信息 */}
                {currentStepData && (
                  <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <div className="font-semibold mb-1">步骤详情:</div>
                      <div>{currentStepData.message}</div>
                      {currentStepData.currentVariables && Object.keys(currentStepData.currentVariables).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Object.keys(currentStepData.currentVariables).map(varName => (
                            <span 
                              key={varName}
                              className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded text-xs"
                            >
                              {varName} = {currentStepData.currentVariables[varName]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                等待代码执行...
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default FunctionBlock;

