import React, { useState } from 'react';
import { FaTrash, FaRedo } from 'react-icons/fa';
import { Card, Button, Input } from '../../UI';

/**
 * 循环工具组件 - 支持内联编辑
 */
function LoopTool({ tool, state, isSelected, onSelect, onUpdateConfig, onDelete, onDragStart, onPortClick, connections }) {
  const { currentIndex = 0, isActive = false } = state;
  const { position = { x: 0, y: 0 } } = tool;
  const { start = 0, end = 10, step = 1 } = tool.config;
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({ start, end, step });

  const totalSteps = Math.floor((end - start) / step);
  const progress = totalSteps > 0 ? ((currentIndex - start) / (end - start)) * 100 : 0;

  const handleStartEdit = () => {
    setEditing(true);
    setEditValues({ start, end, step });
  };

  const handleSaveEdit = () => {
    onUpdateConfig(editValues);
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValues({ start, end, step });
    setEditing(false);
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
            ? 'ring-2 ring-green-500 shadow-lg'
            : 'hover:shadow-md'
        } ${isActive ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FaRedo className={`w-4 h-4 ${isActive ? 'text-green-500 animate-spin' : 'text-gray-400'}`} />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">循环</h3>
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

        {/* 输入端口（用于接收变量） */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="port w-4 h-4 rounded-full bg-blue-500 border-2 border-white cursor-pointer hover:bg-blue-600 transition-all flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onPortClick?.('input');
            }}
            title="点击连接变量输入"
          />
          <div className="flex-1 text-xs text-gray-600 dark:text-gray-400">
            {connections?.length > 0 ? (
              <span>已连接 {connections.length} 个变量</span>
            ) : (
              <span>连接变量</span>
            )}
          </div>
        </div>

        {/* 编辑模式 */}
        {editing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400 w-12">起始:</label>
              <Input
                type="number"
                value={editValues.start}
                onChange={(e) => setEditValues({ ...editValues, start: Number(e.target.value) })}
                className="flex-1 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400 w-12">结束:</label>
              <Input
                type="number"
                value={editValues.end}
                onChange={(e) => setEditValues({ ...editValues, end: Number(e.target.value) })}
                className="flex-1 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400 w-12">步长:</label>
              <Input
                type="number"
                value={editValues.step}
                onChange={(e) => setEditValues({ ...editValues, step: Number(e.target.value) })}
                className="flex-1 text-sm"
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
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">范围:</span>
                  <span
                    className="font-mono text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600"
                    onDoubleClick={handleStartEdit}
                  >
                    {start} → {end}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">步长:</span>
                  <span
                    className="font-mono text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600"
                    onDoubleClick={handleStartEdit}
                  >
                    {step}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">当前索引:</span>
                  <span
                    className={`font-mono font-bold ${
                      isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {currentIndex}
                  </span>
                </div>
              </div>

              {/* 进度条 */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isActive ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>

              {/* 状态指示 */}
              {isActive && (
                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>循环进行中...</span>
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400">
                双击范围或步长可编辑
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default LoopTool;

