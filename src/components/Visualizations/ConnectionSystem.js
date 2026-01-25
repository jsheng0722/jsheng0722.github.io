import React, { useState, useRef, useEffect } from 'react';

/**
 * 连接系统 - 管理工具之间的连接
 */
export function useConnectionSystem() {
  const [connections, setConnections] = useState([]); // [{ from: toolId, to: toolId, fromPort: 'output', toPort: 'input', order: 0 }]
  const [connectingFrom, setConnectingFrom] = useState(null); // { toolId, port }
  const canvasRef = useRef(null);

  // 添加连接
  const addConnection = (from, to, fromPort = 'output', toPort = 'input') => {
    // 检查是否已存在连接
    const exists = connections.some(
      conn => conn.from === from && conn.to === to && conn.toPort === toPort
    );
    if (exists) return;

    // 获取当前端口的连接数量，用于排序
    const existingConnections = connections.filter(conn => conn.to === to && conn.toPort === toPort);
    const order = existingConnections.length;

    setConnections(prev => [...prev, {
      id: `conn_${Date.now()}_${Math.random()}`,
      from,
      to,
      fromPort,
      toPort,
      order,
    }]);
  };

  // 删除连接
  const removeConnection = (connectionId) => {
    setConnections(prev => {
      const removed = prev.find(c => c.id === connectionId);
      if (!removed) return prev;
      
      // 重新排序剩余的连接
      return prev
        .filter(c => c.id !== connectionId)
        .map(c => {
          if (c.to === removed.to && c.toPort === removed.toPort && c.order > removed.order) {
            return { ...c, order: c.order - 1 };
          }
          return c;
        });
    });
  };

  // 获取连接到某个工具的所有连接
  const getConnectionsTo = (toolId, port = 'input') => {
    return connections
      .filter(conn => conn.to === toolId && conn.toPort === port)
      .sort((a, b) => a.order - b.order);
  };

  // 获取从某个工具出发的所有连接
  const getConnectionsFrom = (toolId, port = 'output') => {
    return connections.filter(conn => conn.from === toolId && conn.fromPort === port);
  };

  // 开始连接
  const startConnection = (toolId, port) => {
    setConnectingFrom({ toolId, port });
  };

  // 完成连接
  const completeConnection = (toolId, port) => {
    if (connectingFrom && connectingFrom.toolId !== toolId) {
      addConnection(connectingFrom.toolId, toolId, connectingFrom.port, port);
    }
    setConnectingFrom(null);
  };

  // 取消连接
  const cancelConnection = () => {
    setConnectingFrom(null);
  };

  return {
    connections,
    connectingFrom,
    addConnection,
    removeConnection,
    getConnectionsTo,
    getConnectionsFrom,
    startConnection,
    completeConnection,
    cancelConnection,
    canvasRef,
  };
}

/**
 * 连接线渲染组件
 */
export function ConnectionLines({ connections, tools, connectingFrom, onCancel }) {
  const [mousePos, setMousePos] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (connectingFrom && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    };

    const handleMouseUp = () => {
      if (connectingFrom) {
        onCancel();
        setMousePos(null);
      }
    };

    if (connectingFrom) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [connectingFrom, onCancel]);

  // 获取工具端口位置
  const getPortPosition = (toolId, port) => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return null;

    const toolElement = document.querySelector(`[data-tool-id="${toolId}"]`);
    if (!toolElement) return null;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return null;

    // 查找对应端口的元素（根据端口类型查找）
    const portSelector = port === 'output' ? '.port.bg-blue-500, .port.bg-green-500' : '.port.bg-green-500, .port.bg-blue-500';
    const portElements = toolElement.querySelectorAll(portSelector);
    
    // 尝试找到正确的端口（输入端口通常在左侧，输出端口在右侧）
    let portElement = null;
    if (port === 'input') {
      // 输入端口：查找左侧的端口（通常是绿色或第一个）
      portElement = Array.from(portElements).find(el => {
        const rect = el.getBoundingClientRect();
        const toolRect = toolElement.getBoundingClientRect();
        return rect.left <= toolRect.left + toolRect.width / 2;
      }) || portElements[0];
    } else {
      // 输出端口：查找右侧的端口（通常是蓝色或最后一个）
      portElement = Array.from(portElements).find(el => {
        const rect = el.getBoundingClientRect();
        const toolRect = toolElement.getBoundingClientRect();
        return rect.left >= toolRect.left + toolRect.width / 2;
      }) || portElements[portElements.length - 1];
    }

    if (portElement) {
      const portRect = portElement.getBoundingClientRect();
      return {
        x: portRect.left - canvasRect.left + portRect.width / 2,
        y: portRect.top - canvasRect.top + portRect.height / 2,
      };
    }

    // 如果没有找到端口元素，使用工具位置和默认位置
    const toolRect = toolElement.getBoundingClientRect();
    const toolX = toolRect.left - canvasRect.left;
    const toolY = toolRect.top - canvasRect.top;
    const toolWidth = toolRect.width;
    const toolHeight = toolRect.height;

    if (port === 'output') {
      return { x: toolX + toolWidth, y: toolY + toolHeight / 2 };
    } else if (port === 'input') {
      return { x: toolX, y: toolY + toolHeight / 2 };
    }
    return null;
  };

  // 绘制连接线
  const drawConnection = (connection) => {
    const fromPos = getPortPosition(connection.from, connection.fromPort);
    const toPos = getPortPosition(connection.to, connection.toPort);
    
    if (!fromPos || !toPos) return null;

    // 计算控制点（贝塞尔曲线）
    const dx = toPos.x - fromPos.x;
    const controlX1 = fromPos.x + dx * 0.5;
    const controlX2 = toPos.x - dx * 0.5;

    return (
      <g key={connection.id}>
        <path
          d={`M ${fromPos.x} ${fromPos.y} C ${controlX1} ${fromPos.y}, ${controlX2} ${toPos.y}, ${toPos.x} ${toPos.y}`}
          stroke="#3b82f6"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead)"
          className="cursor-pointer hover:stroke-blue-600"
          onClick={(e) => {
            e.stopPropagation();
            // 可以添加删除连接的逻辑
          }}
        />
        {/* 连接顺序标签 */}
        {connection.order > 0 && (
          <circle
            cx={toPos.x - 10}
            cy={toPos.y - 15}
            r="8"
            fill="#3b82f6"
            className="cursor-pointer"
          />
        )}
        {connection.order > 0 && (
          <text
            x={toPos.x - 10}
            y={toPos.y - 11}
            textAnchor="middle"
            fill="white"
            fontSize="10"
            fontWeight="bold"
          >
            {connection.order + 1}
          </text>
        )}
      </g>
    );
  };

  // 绘制正在连接的临时线
  const drawTemporaryLine = () => {
    if (!connectingFrom || !mousePos) return null;

    const fromPos = getPortPosition(connectingFrom.toolId, connectingFrom.port);
    if (!fromPos) return null;

    const dx = mousePos.x - fromPos.x;
    const controlX1 = fromPos.x + dx * 0.5;
    const controlX2 = mousePos.x - dx * 0.5;

    return (
      <path
        d={`M ${fromPos.x} ${fromPos.y} C ${controlX1} ${fromPos.y}, ${controlX2} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`}
        stroke="#60a5fa"
        strokeWidth="2"
        strokeDasharray="5,5"
        fill="none"
      />
    );
  };

  return (
    <svg
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
        </marker>
      </defs>
      {connections.map(conn => drawConnection(conn))}
      {drawTemporaryLine()}
    </svg>
  );
}

