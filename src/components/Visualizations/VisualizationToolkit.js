import React, { useState, useRef } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRedo } from 'react-icons/fa';
import VisualizationToolbar from './VisualizationToolbar';
import ListTool from './tools/ListTool';
import LoopTool from './tools/LoopTool';
import VariableTool from './tools/VariableTool';
import OperationNode from './tools/OperationNode';
import { useConnectionSystem, ConnectionLines } from './ConnectionSystem';
import { Button } from '../UI';

/**
 * 可视化工具包主组件
 * 提供拖拽式工具创建和步骤控制
 */
function VisualizationToolkit({ initialCode = null }) {
  const [tools, setTools] = useState([]); // 画布上的所有工具
  const [currentStep, setCurrentStep] = useState(0); // 当前步骤
  const [steps, setSteps] = useState([]); // 所有步骤
  const [isPlaying, setIsPlaying] = useState(false); // 是否正在播放
  const [speed, setSpeed] = useState(500); // 播放速度（毫秒）
  const [selectedTool, setSelectedTool] = useState(null); // 当前选中的工具
  const [draggingTool, setDraggingTool] = useState(null); // 正在拖拽的工具
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 }); // 拖拽偏移量
  const canvasRef = useRef(null);
  
  // 连接系统
  const connectionSystem = useConnectionSystem();

  // 如果有初始代码，显示提示
  React.useEffect(() => {
    if (initialCode) {
      // 未来可以在这里解析代码并自动创建工具
      // console.log('收到初始代码:', initialCode);
    }
  }, [initialCode]);

  // 添加工具到画布
  const handleAddTool = (toolType, position = { x: 100, y: 100 }) => {
    const newTool = {
      id: `tool_${Date.now()}_${Math.random()}`,
      type: toolType,
      position,
      config: getDefaultConfig(toolType),
      step: 0, // 工具在当前步骤的状态
    };
    setTools(prev => [...prev, newTool]);
    setSelectedTool(newTool.id);
  };

  // 获取工具的默认配置
  const getDefaultConfig = (toolType) => {
    switch (toolType) {
      case 'list':
        return {
          values: [],
          label: '列表',
          dataType: 'number', // number, string, tuple, mixed
        };
      case 'loop':
        return {
          start: 0,
          end: 10,
          step: 1,
          currentIndex: 0,
          label: '循环',
        };
      case 'variable':
        return {
          name: 'var',
          value: '',
          type: 'number', // number, string, boolean
          label: '变量',
        };
      case 'operation':
        return {
          operation: 'append', // append, insert, remove, pop
          connectedInputs: [],
        };
      default:
        return {};
    }
  };

  // 更新工具配置
  const handleUpdateToolConfig = (toolId, config) => {
    setTools(prev =>
      prev.map(tool =>
        tool.id === toolId ? { ...tool, config: { ...tool.config, ...config } } : tool
      )
    );
  };

  // 删除工具
  const handleDeleteTool = (toolId) => {
    // 删除工具时，同时删除相关连接
    const connectionsToRemove = connectionSystem.connections.filter(
      conn => conn.from === toolId || conn.to === toolId
    );
    connectionsToRemove.forEach(conn => connectionSystem.removeConnection(conn.id));
    
    setTools(prev => prev.filter(tool => tool.id !== toolId));
    if (selectedTool === toolId) {
      setSelectedTool(null);
    }
  };

  // 处理列表操作点击（创建操作节点）
  const handleListOperation = (listToolId, operation) => {
    const listTool = tools.find(t => t.id === listToolId);
    if (!listTool) return;

    // 在列表右侧创建操作节点
    const operationId = `operation_${Date.now()}_${Math.random()}`;
    const operationTool = {
      id: operationId,
      type: 'operation',
      position: {
        x: listTool.position.x + 300,
        y: listTool.position.y,
      },
      config: {
        operation,
        connectedInputs: [],
      },
    };

    setTools(prev => [...prev, operationTool]);
    
    // 自动连接操作节点到列表
    setTimeout(() => {
      connectionSystem.addConnection(operationId, listToolId, 'output', 'input');
    }, 100);
    
    setSelectedTool(operationId);
  };

  // 处理端口点击（开始/完成连接）
  const handlePortClick = (toolId, port) => {
    if (connectionSystem.connectingFrom) {
      // 完成连接
      if (connectionSystem.connectingFrom.toolId !== toolId) {
        connectionSystem.completeConnection(toolId, port);
        
        // 如果是操作节点的输入端口，更新操作节点的配置
        const targetTool = tools.find(t => t.id === toolId);
        if (targetTool?.type === 'operation' && port === 'input') {
          const sourceTool = tools.find(t => t.id === connectionSystem.connectingFrom.toolId);
          if (sourceTool) {
            const currentInputs = targetTool.config.connectedInputs || [];
            handleUpdateToolConfig(toolId, {
              connectedInputs: [...currentInputs, sourceTool.id],
            });
          }
        }
      } else {
        connectionSystem.cancelConnection();
      }
    } else {
      // 开始连接
      connectionSystem.startConnection(toolId, port);
    }
  };

  // 执行操作（根据连接关系）
  const executeOperation = (operationTool) => {
    // 获取连接到操作节点的所有变量（按顺序）
    const inputConnections = connectionSystem.getConnectionsTo(operationTool.id, 'input')
      .sort((a, b) => a.order - b.order);
    
    const inputValues = inputConnections.map(conn => {
      const sourceTool = tools.find(t => t.id === conn.from);
      if (sourceTool?.type === 'variable') {
        return sourceTool.config.value;
      }
      return null;
    }).filter(v => v !== null && v !== '');

    // 根据操作类型执行
    const { operation } = operationTool.config;
    return { operation, inputValues };
  };

  // 应用操作到列表
  const applyOperationToList = (listTool, operationResult) => {
    const { operation, inputValues } = operationResult;
    const currentValues = [...(listTool.config.values || [])];

    switch (operation) {
      case 'append':
        return [...currentValues, ...inputValues];
      case 'insert':
        // insert 需要索引，暂时使用第一个值作为索引，其余作为插入值
        if (inputValues.length >= 2) {
          const index = Number(inputValues[0]) || 0;
          const insertValues = inputValues.slice(1);
          currentValues.splice(index, 0, ...insertValues);
          return currentValues;
        }
        return currentValues;
      case 'remove':
        // remove 使用值来删除
        return currentValues.filter(v => !inputValues.includes(v));
      case 'pop':
        // pop 移除最后一个元素
        return currentValues.slice(0, -1);
      default:
        return currentValues;
    }
  };

  // 生成步骤
  const generateSteps = () => {
    const newSteps = [];
    
    // 找到循环工具，确定总步数
    const loopTool = tools.find(t => t.type === 'loop');
    if (loopTool) {
      const { start, end, step } = loopTool.config;
      const totalSteps = Math.floor((end - start) / step);
      
      for (let i = 0; i <= totalSteps; i++) {
        const currentIndex = start + i * step;
        
        // 在每个步骤中执行连接的操作
        const updatedTools = tools.map(tool => {
          let toolState = getToolStateAtStep(tool, i, currentIndex);
          
          // 如果是列表，检查是否有操作节点连接到它
          if (tool.type === 'list') {
            const operationConnections = connectionSystem.getConnectionsTo(tool.id, 'input');
            if (operationConnections.length > 0) {
              // 找到连接到列表的操作节点
              const operationTool = tools.find(t => 
                operationConnections.some(conn => conn.from === t.id && t.type === 'operation')
              );
              
              if (operationTool) {
                // 执行操作
                const operationResult = executeOperation(operationTool);
                const newValues = applyOperationToList(tool, operationResult);
                toolState = { ...toolState, values: newValues };
              }
            }
          }
          
          return {
            id: tool.id,
            type: tool.type,
            state: toolState,
          };
        });
        
        newSteps.push({
          step: i,
          loopIndex: currentIndex,
          tools: updatedTools,
        });
      }
    } else {
      // 如果没有循环，只生成一个步骤，但也要执行操作
      const updatedTools = tools.map(tool => {
        let toolState = getToolStateAtStep(tool, 0, 0);
        
        if (tool.type === 'list') {
          const operationConnections = connectionSystem.getConnectionsTo(tool.id, 'input');
          if (operationConnections.length > 0) {
            const operationTool = tools.find(t => 
              operationConnections.some(conn => conn.from === t.id && t.type === 'operation')
            );
            
            if (operationTool) {
              const operationResult = executeOperation(operationTool);
              const newValues = applyOperationToList(tool, operationResult);
              toolState = { ...toolState, values: newValues };
            }
          }
        }
        
        return {
          id: tool.id,
          type: tool.type,
          state: toolState,
        };
      });
      
      newSteps.push({
        step: 0,
        tools: updatedTools,
      });
    }
    
    setSteps(newSteps);
    setCurrentStep(0);
  };

  // 获取工具在指定步骤的状态
  const getToolStateAtStep = (tool, stepIndex, loopIndex) => {
    switch (tool.type) {
      case 'list':
        return {
          values: tool.config.values,
          highlightedIndex: loopIndex < tool.config.values.length ? loopIndex : null,
        };
      case 'loop':
        return {
          currentIndex: loopIndex,
          isActive: true,
        };
      case 'variable':
        return {
          value: tool.config.value,
        };
      default:
        return {};
    }
  };

  // 步骤控制
  const handleStepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handlePlay = () => {
    if (steps.length === 0) {
      generateSteps();
      return;
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // 自动播放
  React.useEffect(() => {
    if (isPlaying && steps.length > 0 && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps.length, speed]);

  // 处理工具拖拽
  const handleToolDragStart = (e, toolId) => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    setDraggingTool(toolId);
    setDragOffset({
      x: e.clientX - rect.left - tool.position.x,
      y: e.clientY - rect.top - tool.position.y,
    });
  };

  const handleToolDrag = (e) => {
    if (!draggingTool || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;
    
    setTools(prev =>
      prev.map(tool =>
        tool.id === draggingTool
          ? { ...tool, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
          : tool
      )
    );
  };

  const handleToolDragEnd = () => {
    setDraggingTool(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // 处理画布拖拽放置
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    const toolType = e.dataTransfer.getData('text/plain');
    if (!toolType) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    
    handleAddTool(toolType, { x, y });
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
  };

  // 渲染工具组件
  const renderTool = (tool) => {
    const currentStepData = steps[currentStep];
    const toolState = currentStepData?.tools.find(t => t.id === tool.id)?.state || {};
    const connectionsTo = connectionSystem.getConnectionsTo(tool.id);
    const connectionsFrom = connectionSystem.getConnectionsFrom(tool.id);

    switch (tool.type) {
      case 'list':
        return (
          <ListTool
            key={tool.id}
            tool={tool}
            state={toolState}
            isSelected={selectedTool === tool.id}
            onSelect={() => setSelectedTool(tool.id)}
            onUpdateConfig={(config) => handleUpdateToolConfig(tool.id, config)}
            onDelete={() => handleDeleteTool(tool.id)}
            onDragStart={handleToolDragStart}
            onOperationClick={(operation) => handleListOperation(tool.id, operation)}
            onPortClick={(port) => handlePortClick(tool.id, port)}
            connections={connectionsTo}
          />
        );
      case 'loop':
        return (
          <LoopTool
            key={tool.id}
            tool={tool}
            state={toolState}
            isSelected={selectedTool === tool.id}
            onSelect={() => setSelectedTool(tool.id)}
            onUpdateConfig={(config) => handleUpdateToolConfig(tool.id, config)}
            onDelete={() => handleDeleteTool(tool.id)}
            onDragStart={handleToolDragStart}
            onPortClick={(port) => handlePortClick(tool.id, port)}
            connections={connectionsTo}
          />
        );
      case 'variable':
        return (
          <VariableTool
            key={tool.id}
            tool={tool}
            state={toolState}
            isSelected={selectedTool === tool.id}
            onSelect={() => setSelectedTool(tool.id)}
            onUpdateConfig={(config) => handleUpdateToolConfig(tool.id, config)}
            onDelete={() => handleDeleteTool(tool.id)}
            onDragStart={handleToolDragStart}
            onPortClick={(port) => handlePortClick(tool.id, port)}
            connections={connectionsFrom}
          />
        );
      case 'operation':
        return (
          <OperationNode
            key={tool.id}
            tool={tool}
            isSelected={selectedTool === tool.id}
            onSelect={() => setSelectedTool(tool.id)}
            onDelete={() => handleDeleteTool(tool.id)}
            onDragStart={handleToolDragStart}
            onPortClick={(port) => handlePortClick(tool.id, port)}
            connections={connectionsTo}
            allTools={tools}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900" style={{ minHeight: '500px', height: '100%' }}>
      {/* 工具栏 */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <VisualizationToolbar onAddTool={handleAddTool} />
      </div>

      {/* 控制栏 */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleReset}
              variant="ghost"
              size="small"
              icon={<FaRedo />}
            >
              重置
            </Button>
            <Button
              onClick={handleStepBackward}
              variant="ghost"
              size="small"
              icon={<FaStepBackward />}
              disabled={currentStep === 0}
            >
              上一步
            </Button>
            {isPlaying ? (
              <Button
                onClick={handlePause}
                variant="primary"
                size="small"
                icon={<FaPause />}
              >
                暂停
              </Button>
            ) : (
              <Button
                onClick={handlePlay}
                variant="primary"
                size="small"
                icon={<FaPlay />}
              >
                运行
              </Button>
            )}
            <Button
              onClick={handleStepForward}
              variant="ghost"
              size="small"
              icon={<FaStepForward />}
              disabled={currentStep >= steps.length - 1}
            >
              下一步
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              步骤: {currentStep + 1} / {steps.length || 1}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">速度:</label>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{speed}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* 画布区域 */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-auto bg-gray-100 dark:bg-gray-950"
        style={{ minHeight: '400px' }}
        onDrop={handleCanvasDrop}
        onDragOver={handleCanvasDragOver}
        onMouseMove={handleToolDrag}
        onMouseUp={handleToolDragEnd}
        onMouseLeave={handleToolDragEnd}
        onClick={(e) => {
          if (e.target === canvasRef.current || e.target.classList.contains('connection-line')) {
            setSelectedTool(null);
            connectionSystem.cancelConnection();
          }
        }}
      >
        {tools.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
            <div className="text-center">
              <p className="text-lg mb-2">从工具栏拖拽工具到画布</p>
              <p className="text-sm">或点击工具栏中的工具按钮添加</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full min-h-[600px]">
            {/* 连接线层 */}
            <ConnectionLines
              connections={connectionSystem.connections}
              tools={tools}
              connectingFrom={connectionSystem.connectingFrom}
              onCancel={connectionSystem.cancelConnection}
            />
            {/* 工具层 */}
            <div className="relative z-10">
              {tools.map(tool => renderTool(tool))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default VisualizationToolkit;

