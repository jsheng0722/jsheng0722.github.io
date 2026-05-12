import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import VisualizationToolkit from '../Visualizations/VisualizationToolkit';
import { Card } from '../UI';

/**
 * 算法可视化主组件（工具驱动版本）
 * 
 * 注意：代码驱动功能已移除，现在使用工具驱动系统
 * 未来将支持从代码自动生成工具配置
 */
function AlgorithmVisualizer({ code, language = 'javascript' }) {
  return (
    <div className="w-full">
      {/* 信息提示 */}
      {code && (
        <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3 p-4">
            <FaInfoCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                工具驱动可视化模式
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                当前使用工具驱动系统。请从工具栏添加工具（列表、循环、变量等）来创建可视化。
              </p>
              {code && (
                <details className="mt-2">
                  <summary className="text-xs text-blue-700 dark:text-blue-300 cursor-pointer hover:text-blue-900 dark:hover:text-blue-100">
                    查看代码
                  </summary>
                  <pre className="mt-2 text-xs bg-blue-100 dark:bg-blue-900/50 p-2 rounded overflow-x-auto">
                    {code.substring(0, 200)}{code.length > 200 ? '...' : ''}
                  </pre>
                </details>
              )}
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                💡 提示：代码自动解析功能正在开发中，未来将支持从代码自动生成工具配置
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 工具驱动可视化系统 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div style={{ minHeight: '500px' }}>
          <VisualizationToolkit />
        </div>
      </div>
    </div>
  );
}

export default AlgorithmVisualizer;
