import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';

// 可编辑节点包装器
function EditableNode({ children, data, onLabelChange, style = {} }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '双击编辑');

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleChange = useCallback((e) => {
    setLabel(e.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (onLabelChange) {
      onLabelChange(label);
    }
  }, [label, onLabelChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setLabel(data.label || '双击编辑');
    }
  }, [handleBlur, data.label]);

  return (
    <div style={{ position: 'relative', ...style }} onDoubleClick={handleDoubleClick}>
      {children(label, isEditing, handleChange, handleBlur, handleKeyDown)}
    </div>
  );
}

// 矩形节点
export function RectangleNode({ data, isConnectable }) {
  const handleLabelChange = useCallback((newLabel) => {
    if (data.onLabelChange) {
      data.onLabelChange(newLabel);
    }
  }, [data]);

  return (
    <EditableNode data={data} onLabelChange={handleLabelChange}>
      {(label, isEditing, handleChange, handleBlur, handleKeyDown) => (
        <>
          <Handle
            type="target"
            position={Position.Top}
            isConnectable={isConnectable}
            style={{ background: '#555' }}
          />
          <div
            style={{
              padding: '20px 40px',
              borderRadius: '8px',
              background: data.color || '#60a5fa',
              border: `2px solid ${data.borderColor || '#3b82f6'}`,
              color: 'white',
              fontWeight: 'bold',
              minWidth: '100px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            {isEditing ? (
              <input
                type="text"
                value={label}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  textAlign: 'center',
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                  outline: 'none',
                  width: '100%',
                }}
              />
            ) : (
              <span>{label}</span>
            )}
          </div>
          <Handle
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            style={{ background: '#555' }}
          />
        </>
      )}
    </EditableNode>
  );
}

// 圆形节点
export function CircleNode({ data, isConnectable }) {
  const handleLabelChange = useCallback((newLabel) => {
    if (data.onLabelChange) {
      data.onLabelChange(newLabel);
    }
  }, [data]);

  return (
    <EditableNode data={data} onLabelChange={handleLabelChange}>
      {(label, isEditing, handleChange, handleBlur, handleKeyDown) => (
        <>
          <Handle
            type="target"
            position={Position.Top}
            isConnectable={isConnectable}
            style={{ background: '#555' }}
          />
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ cursor: 'pointer' }}>
            <circle
              cx="60"
              cy="60"
              r="50"
              fill={data.color || '#60a5fa'}
              stroke={data.borderColor || '#3b82f6'}
              strokeWidth="2"
            />
            {isEditing ? (
              <foreignObject x="20" y="50" width="80" height="30">
                <input
                  type="text"
                  value={label}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    outline: 'none',
                  }}
                />
              </foreignObject>
            ) : (
              <text
                x="60"
                y="65"
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="bold"
              >
                {label}
              </text>
            )}
          </svg>
          <Handle
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            style={{ background: '#555' }}
          />
        </>
      )}
    </EditableNode>
  );
}

// 菱形节点
export function DiamondNode({ data, isConnectable }) {
  const handleLabelChange = useCallback((newLabel) => {
    if (data.onLabelChange) {
      data.onLabelChange(newLabel);
    }
  }, [data]);

  return (
    <EditableNode data={data} onLabelChange={handleLabelChange}>
      {(label, isEditing, handleChange, handleBlur, handleKeyDown) => (
        <>
          <Handle
            type="target"
            position={Position.Top}
            isConnectable={isConnectable}
            style={{ background: '#555' }}
          />
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ cursor: 'pointer' }}>
            <polygon
              points="60,10 110,60 60,110 10,60"
              fill={data.color || '#60a5fa'}
              stroke={data.borderColor || '#3b82f6'}
              strokeWidth="2"
            />
            {isEditing ? (
              <foreignObject x="30" y="50" width="60" height="30">
                <input
                  type="text"
                  value={label}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    outline: 'none',
                  }}
                />
              </foreignObject>
            ) : (
              <text
                x="60"
                y="65"
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {label}
              </text>
            )}
          </svg>
          <Handle
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            style={{ background: '#555' }}
          />
        </>
      )}
    </EditableNode>
  );
}

// 三角形节点
export function TriangleNode({ data, isConnectable }) {
  const handleLabelChange = useCallback((newLabel) => {
    if (data.onLabelChange) {
      data.onLabelChange(newLabel);
    }
  }, [data]);

  return (
    <EditableNode data={data} onLabelChange={handleLabelChange}>
      {(label, isEditing, handleChange, handleBlur, handleKeyDown) => (
        <>
          <Handle
            type="target"
            position={Position.Top}
            isConnectable={isConnectable}
            style={{ background: '#555' }}
          />
          <svg width="100" height="100" viewBox="0 0 100 100" style={{ cursor: 'pointer' }}>
            <polygon
              points="50,10 90,90 10,90"
              fill={data.color || '#60a5fa'}
              stroke={data.borderColor || '#3b82f6'}
              strokeWidth="2"
            />
            {isEditing ? (
              <foreignObject x="20" y="50" width="60" height="30">
                <input
                  type="text"
                  value={label}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    outline: 'none',
                  }}
                />
              </foreignObject>
            ) : (
              <text
                x="50"
                y="65"
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {label}
              </text>
            )}
          </svg>
          <Handle
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            style={{ background: '#555' }}
          />
        </>
      )}
    </EditableNode>
  );
}

// 星形节点
export function StarNode({ data, isConnectable }) {
  const handleLabelChange = useCallback((newLabel) => {
    if (data.onLabelChange) {
      data.onLabelChange(newLabel);
    }
  }, [data]);

  return (
    <EditableNode data={data} onLabelChange={handleLabelChange}>
      {(label, isEditing, handleChange, handleBlur, handleKeyDown) => (
        <>
          <Handle
            type="target"
            position={Position.Top}
            isConnectable={isConnectable}
            style={{ background: '#555' }}
          />
          <svg width="120" height="120" viewBox="0 0 120 120" style={{ cursor: 'pointer' }}>
            <polygon
              points="60,10 73,45 110,45 80,68 93,103 60,82 27,103 40,68 10,45 47,45"
              fill={data.color || '#60a5fa'}
              stroke={data.borderColor || '#3b82f6'}
              strokeWidth="2"
            />
            {isEditing ? (
              <foreignObject x="30" y="50" width="60" height="30">
                <input
                  type="text"
                  value={label}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    outline: 'none',
                  }}
                />
              </foreignObject>
            ) : (
              <text
                x="60"
                y="65"
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="bold"
              >
                {label}
              </text>
            )}
          </svg>
          <Handle
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            style={{ background: '#555' }}
          />
        </>
      )}
    </EditableNode>
  );
}

// 文本节点
export function TextNode({ data, isConnectable }) {
  const handleLabelChange = useCallback((newLabel) => {
    if (data.onLabelChange) {
      data.onLabelChange(newLabel);
    }
  }, [data]);

  return (
    <EditableNode data={data} onLabelChange={handleLabelChange}>
      {(label, isEditing, handleChange, handleBlur, handleKeyDown) => (
        <>
          <Handle
            type="target"
            position={Position.Top}
            isConnectable={isConnectable}
            style={{ background: '#555', opacity: 0.3 }}
          />
          <div
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: data.color || '#1f2937',
              fontSize: '16px',
              fontWeight: '500',
              minWidth: '80px',
              cursor: 'pointer',
            }}
          >
            {isEditing ? (
              <input
                type="text"
                value={label}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                  outline: 'none',
                  width: '100%',
                }}
              />
            ) : (
              <span>{label}</span>
            )}
          </div>
          <Handle
            type="source"
            position={Position.Bottom}
            isConnectable={isConnectable}
            style={{ background: '#555', opacity: 0.3 }}
          />
        </>
      )}
    </EditableNode>
  );
}

// 导出所有自定义节点类型
export const nodeTypes = {
  rectangle: RectangleNode,
  circle: CircleNode,
  diamond: DiamondNode,
  triangle: TriangleNode,
  star: StarNode,
  text: TextNode,
};

