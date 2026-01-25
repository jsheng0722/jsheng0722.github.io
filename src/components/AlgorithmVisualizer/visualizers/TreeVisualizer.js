import React, { useState, useEffect } from 'react';

/**
 * 树结构可视化组件
 * 用于展示二叉树、BST等树结构
 * 从实际执行的 steps 中提取树结构数据
 */
function TreeVisualizer({ code, currentStep, steps, isPlaying, speed, onStepChange }) {
  const [treeData, setTreeData] = useState(null);
  const [highlightedNode, setHighlightedNode] = useState(null);

  // 从 steps 中提取树结构数据
  useEffect(() => {
    if (steps.length > 0 && currentStep < steps.length) {
      const step = steps[currentStep];
      
      // 尝试从步骤中提取树数据
      if (step.tree) {
        setTreeData(step.tree);
      } else if (step.node) {
        // 如果只有单个节点，构建简单树
        setTreeData(step.node);
      } else if (step.data && step.data.tree) {
        setTreeData(step.data.tree);
      } else if (step.data && step.data.node) {
        setTreeData(step.data.node);
      }
      
      // 设置高亮节点
      if (step.highlightedNode !== undefined) {
        setHighlightedNode(step.highlightedNode);
      } else if (step.currentNode !== undefined) {
        setHighlightedNode(step.currentNode);
      }
    }
  }, [currentStep, steps]);

  // 如果没有从步骤中提取到数据，尝试从代码中解析或使用默认值
  useEffect(() => {
    if (!treeData && steps.length === 0) {
      // 尝试从代码中提取树结构（简单解析）
      // 这里可以添加更复杂的解析逻辑
      // 暂时使用默认示例，但会在执行后更新
      setTreeData({
        value: 10,
        left: {
          value: 5,
          left: { value: 3, left: null, right: null },
          right: { value: 7, left: null, right: null }
        },
        right: {
          value: 15,
          left: { value: 12, left: null, right: null },
          right: { value: 18, left: null, right: null }
        }
      });
    }
  }, [treeData, steps.length]);

  const TreeNode = ({ node, x, y, level = 0, width = 800, highlightedValue = null }) => {
    if (!node) return null;

    const nodeHeight = 50;
    const horizontalSpacing = width / (Math.pow(2, level + 1));
    const verticalSpacing = 80;

    const leftX = x - horizontalSpacing;
    const rightX = x + horizontalSpacing;
    const nextY = y + verticalSpacing;
    
    // 检查当前节点是否高亮
    const isHighlighted = highlightedValue !== null && node.value === highlightedValue;

    return (
      <g>
        {/* 连接线 */}
        {node.left && (
          <line
            x1={x}
            y1={y + nodeHeight / 2}
            x2={leftX}
            y2={nextY - nodeHeight / 2}
            stroke="#6b7280"
            strokeWidth="2"
          />
        )}
        {node.right && (
          <line
            x1={x}
            y1={y + nodeHeight / 2}
            x2={rightX}
            y2={nextY - nodeHeight / 2}
            stroke="#6b7280"
            strokeWidth="2"
          />
        )}

        {/* 节点 */}
        <circle
          cx={x}
          cy={y}
          r={nodeHeight / 2}
          fill={isHighlighted ? "#fbbf24" : "#3b82f6"}
          stroke={isHighlighted ? "#f59e0b" : "#1e40af"}
          strokeWidth={isHighlighted ? "3" : "2"}
        />
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
        >
          {node.value}
        </text>

        {/* 递归渲染子节点 */}
        {node.left && (
          <TreeNode
            node={node.left}
            x={leftX}
            y={nextY}
            level={level + 1}
            width={width}
            highlightedValue={highlightedValue}
          />
        )}
        {node.right && (
          <TreeNode
            node={node.right}
            x={rightX}
            y={nextY}
            level={level + 1}
            width={width}
            highlightedValue={highlightedValue}
          />
        )}
      </g>
    );
  };

  if (!treeData) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          等待代码执行以显示树结构...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
          树结构可视化
        </h3>
        {steps[currentStep]?.message && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">
            {steps[currentStep].message}
          </div>
        )}
        <svg width="800" height="400" className="border border-gray-200 dark:border-gray-700 rounded">
          <TreeNode 
            node={treeData} 
            x={400} 
            y={50} 
            highlightedValue={highlightedNode}
          />
        </svg>
      </div>
    </div>
  );
}

export default TreeVisualizer;

