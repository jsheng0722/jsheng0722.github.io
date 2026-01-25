import React, { useState } from 'react';
import { FaTrash, FaCode } from 'react-icons/fa';
import { Card, Button, Input } from '../../UI';

/**
 * 变量工具组件 - 支持内联编辑
 */
function VariableTool({ tool, state, isSelected, onSelect, onUpdateConfig, onDelete, onDragStart, onPortClick, connections }) {
  const { value = '' } = state;
  const { position = { x: 0, y: 0 } } = tool;
  const { name = 'var', type = 'number' } = tool.config;
  const [editingName, setEditingName] = useState(false);
  const [editingValue, setEditingValue] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editValue, setEditValue] = useState(String(value || ''));

  const getTypeColor = (type) => {
    switch (type) {
      case 'number':
        return 'text-blue-600 dark:text-blue-400';
      case 'string':
        return 'text-green-600 dark:text-green-400';
      case 'boolean':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleSaveName = () => {
    if (editName.trim()) {
      onUpdateConfig({ name: editName.trim() });
    }
    setEditingName(false);
  };

  const handleSaveValue = () => {
    let parsedValue = editValue;
    if (type === 'number') {
      parsedValue = Number(editValue) || 0;
    } else if (type === 'boolean') {
      parsedValue = editValue === 'true' || editValue === '1';
    }
    onUpdateConfig({ value: parsedValue });
    setEditingValue(false);
    setEditValue(String(parsedValue));
  };

  const handleTypeChange = (newType) => {
    onUpdateConfig({ type: newType, value: '' });
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
        if (!e.target.closest('input') && !e.target.closest('select') && !e.target.closest('button') && !e.target.closest('.port')) {
          e.stopPropagation();
          onSelect();
        }
      }}
      onMouseDown={(e) => {
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('.port')) return;
        onDragStart?.(e, tool.id);
      }}
    >
      <Card
        className={`min-w-[220px] transition-all ${
          isSelected
            ? 'ring-2 ring-purple-500 shadow-lg'
            : 'hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FaCode className="w-4 h-4 text-purple-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">变量</h3>
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

        {/* 输出端口 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 text-xs text-gray-600 dark:text-gray-400">
            {connections?.length > 0 ? (
              <span>已连接 {connections.length} 个目标</span>
            ) : (
              <span>输出</span>
            )}
          </div>
          <div
            className="port w-4 h-4 rounded-full bg-blue-500 border-2 border-white cursor-pointer hover:bg-blue-600 transition-all flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onPortClick?.('output');
            }}
            title="点击连接输出"
          />
        </div>

        {/* 变量名编辑 */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">变量名</label>
          {editingName ? (
            <div className="flex gap-2">
              <Input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                className="flex-1 text-sm"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
              <Button onClick={handleSaveName} size="small" variant="primary">✓</Button>
            </div>
          ) : (
            <div
              className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 p-1 rounded"
              onDoubleClick={() => {
                setEditName(name);
                setEditingName(true);
              }}
            >
              {name}
            </div>
          )}
        </div>

        {/* 类型选择 */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">类型</label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="number">数字</option>
            <option value="string">字符串</option>
            <option value="boolean">布尔值</option>
          </select>
        </div>

        {/* 值编辑 */}
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">值</label>
          {editingValue ? (
            <div className="flex gap-2">
              <Input
                type={type === 'number' ? 'number' : 'text'}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveValue()}
                className="flex-1 text-sm"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
              <Button onClick={handleSaveValue} size="small" variant="primary">✓</Button>
            </div>
          ) : (
            <div
              className={`p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-lg font-mono font-bold ${getTypeColor(type)} cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600`}
              onDoubleClick={() => {
                setEditValue(String(tool.config.value || ''));
                setEditingValue(true);
              }}
            >
              {value !== '' ? String(value) : <span className="text-gray-400">双击编辑</span>}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default VariableTool;

