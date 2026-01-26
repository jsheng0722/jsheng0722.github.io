import React, { useState } from 'react';
import { FaTrash, FaList, FaPlus } from 'react-icons/fa';
import { Card, Button, Input } from '../../UI';

/**
 * 列表工具组件 - 支持内联编辑
 */
function ListTool({ tool, state, isSelected, onSelect, onUpdateConfig, onDelete, onDragStart, onOperationClick, onPortClick, connections }) {
  const { values = [] } = state;
  const { position = { x: 0, y: 0 } } = tool || {};
  const { values: configValues = [] } = tool.config || {};
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState(configValues.join(', '));

  const handleStartEdit = () => {
    setEditing(true);
    setEditValues(configValues.join(', '));
  };

  const handleSaveEdit = () => {
    // 解析输入的值（支持数字、字符串等）
    const parsedValues = editValues
      .split(',')
      .map(v => {
        const trimmed = v.trim();
        // 尝试解析为数字
        if (!isNaN(trimmed) && trimmed !== '') {
          return Number(trimmed);
        }
        // 尝试解析为布尔值
        if (trimmed === 'true' || trimmed === 'True') return true;
        if (trimmed === 'false' || trimmed === 'False') return false;
        // 否则作为字符串
        return trimmed;
      })
      .filter(v => v !== '');
    
    onUpdateConfig({ values: parsedValues });
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValues(configValues.join(', '));
    setEditing(false);
  };

  const handleOperationClick = (operation) => {
    if (onOperationClick) {
      onOperationClick(operation);
    }
  };

  // 显示当前值（如果有状态值则显示状态值，否则显示配置值）
  const displayValues = values.length > 0 ? values : configValues;

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
        if (!e.target.closest('input') && !e.target.closest('button') && !e.target.closest('.port')) {
          e.stopPropagation();
          onSelect();
        }
      }}
      onMouseDown={(e) => {
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.port')) return;
        onDragStart?.(e, tool.id);
      }}
    >
      <Card
        className={`min-w-[280px] transition-all ${
          isSelected
            ? 'ring-2 ring-blue-500 shadow-lg'
            : 'hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FaList className="w-4 h-4 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">列表</h3>
          </div>
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

        {/* 输入端口（用于接收操作结果） */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="port w-4 h-4 rounded-full bg-blue-500 border-2 border-white cursor-pointer hover:bg-blue-600 transition-all flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onPortClick?.('input');
            }}
            title="点击连接操作输入"
          />
          <div className="flex-1 text-xs text-gray-600 dark:text-gray-400">
            {connections?.length > 0 ? (
              <span>已连接 {connections.length} 个操作</span>
            ) : (
              <span>连接操作</span>
            )}
          </div>
        </div>

        {/* 编辑模式 */}
        {editing ? (
          <div className="space-y-2">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                列表值（用逗号分隔）:
              </label>
              <Input
                type="text"
                value={editValues}
                onChange={(e) => setEditValues(e.target.value)}
                placeholder="例如: 1, 2, 3 或 'a', 'b', 'c'"
                className="w-full text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={handleSaveEdit} size="small" variant="primary" className="flex-1">
                保存
              </Button>
              <Button onClick={handleCancelEdit} size="small" variant="ghost" className="flex-1">
                取消
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* 显示模式 */}
            <div className="space-y-3">
              <div className="text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">元素 ({displayValues.length}):</span>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit();
                    }}
                    size="small"
                    variant="ghost"
                    icon={<FaPlus />}
                    className="text-xs"
                  >
                    编辑
                  </Button>
                </div>
                
                {/* 显示列表值 */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 min-h-[60px] max-h-[120px] overflow-y-auto">
                  {displayValues.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {displayValues.map((value, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100"
                        >
                          {String(value)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 dark:text-gray-500 text-xs text-center py-2">
                      空列表
                    </div>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOperationClick('append');
                  }}
                  size="small"
                  variant="outline"
                  className="text-xs"
                >
                  追加
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOperationClick('insert');
                  }}
                  size="small"
                  variant="outline"
                  className="text-xs"
                >
                  插入
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOperationClick('remove');
                  }}
                  size="small"
                  variant="outline"
                  className="text-xs"
                >
                  删除
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOperationClick('pop');
                  }}
                  size="small"
                  variant="outline"
                  className="text-xs"
                >
                  弹出
                </Button>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                点击"编辑"修改列表值，或使用操作按钮
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default ListTool;
