import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { Card, Button } from '../../UI';

/**
 * 操作节点组件（如 append, insert 等）
 */
function OperationNode({ 
  tool, 
  isSelected, 
  onSelect, 
  onDelete, 
  onDragStart,
  onPortClick,
  connections,
  allTools
}) {
  const { position = { x: 0, y: 0 } } = tool;
  const { operation = 'append' } = tool.config;
  
  // 从连接中获取输入的变量信息
  const inputConnections = connections || [];
  const connectedVariables = inputConnections
    .sort((a, b) => a.order - b.order)
    .map(conn => {
      const sourceTool = allTools?.find(t => t.id === conn.from);
      return sourceTool;
    })
    .filter(Boolean);

  const operationLabels = {
    append: '追加',
    insert: '插入',
    remove: '删除',
    pop: '弹出',
  };

  return (
    <div
      data-tool-id={tool.id}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: isSelected ? 10 : 1,
        cursor: 'move',
      }}
      onClick={(e) => {
        if (!e.target.closest('button') && !e.target.closest('.port')) {
          e.stopPropagation();
          onSelect();
        }
      }}
      onMouseDown={(e) => {
        if (e.target.closest('button') || e.target.closest('.port')) return;
        onDragStart?.(e, tool.id);
      }}
    >
      <Card
        className={`min-w-[120px] transition-all ${
          isSelected
            ? 'ring-2 ring-orange-500 shadow-lg'
            : 'hover:shadow-md'
        } bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            {operationLabels[operation] || operation}
          </h3>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            size="small"
            variant="ghost"
            icon={<FaTrash />}
            className="text-red-500 hover:text-red-700"
          />
        </div>

        {/* 输入端口 */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="port w-4 h-4 rounded-full bg-blue-500 border-2 border-white cursor-pointer hover:bg-blue-600 transition-all flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onPortClick('input');
              }}
              title="点击连接变量输入"
            />
            <div className="flex-1 text-xs text-gray-600 dark:text-gray-400">
              {connectedVariables.length > 0 ? (
                <span>已连接 {connectedVariables.length} 个变量</span>
              ) : (
                <span>点击端口连接变量</span>
              )}
            </div>
          </div>
          {/* 显示连接的变量列表 */}
          {connectedVariables.length > 0 && (
            <div className="ml-6 space-y-1">
              {connectedVariables.map((varTool, index) => (
                <div key={varTool.id} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold">
                    {index + 1}
                  </span>
                  <span>{varTool.config.name}: {String(varTool.config.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 输出端口 */}
        <div className="flex items-center gap-2">
          <div className="flex-1 text-xs text-gray-600 dark:text-gray-400 text-right">
            输出
          </div>
          <div
            className="port w-4 h-4 rounded-full bg-green-500 border-2 border-white cursor-pointer hover:bg-green-600 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onPortClick('output');
            }}
            title="点击连接输出"
          />
        </div>
      </Card>
    </div>
  );
}

export default OperationNode;

