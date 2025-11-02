import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FaTimes, FaSave, FaSquare, FaCircle, FaPlay, FaStar, FaArrowRight, FaFont, FaGem } from 'react-icons/fa';
import { nodeTypes } from './EditableNodes';

const initialNodes = [];
const initialEdges = [];

// 颜色选项
const colors = [
  { name: '蓝色', bg: '#60a5fa', border: '#3b82f6' },
  { name: '紫色', bg: '#a78bfa', border: '#7c3aed' },
  { name: '绿色', bg: '#34d399', border: '#10b981' },
  { name: '红色', bg: '#f87171', border: '#ef4444' },
  { name: '黄色', bg: '#fbbf24', border: '#f59e0b' },
  { name: '粉色', bg: '#f472b6', border: '#ec4899' },
  { name: '灰色', bg: '#9ca3af', border: '#6b7280' },
];

// 内部组件，使用ReactFlow的hooks
function DiagramEditorInner({ isOpen, onClose, onSave, initialData }) {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || initialEdges);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { project } = useReactFlow();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: selectedColor.border, strokeWidth: 2 },
      animated: false,
    }, eds)),
    [setEdges, selectedColor]
  );

  // 处理拖拽开始
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // 处理拖拽结束时添加节点
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: {
          label: '双击编辑',
          color: selectedColor.bg,
          borderColor: selectedColor.border,
          onLabelChange: (newLabel) => {
            setNodes((nds) =>
              nds.map((node) =>
                node.id === newNode.id
                  ? { ...node, data: { ...node.data, label: newLabel } }
                  : node
              )
            );
          },
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [project, selectedColor, setNodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleSave = () => {
    const diagramData = {
      nodes: nodes,
      edges: edges,
      timestamp: Date.now()
    };
    onSave(diagramData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full h-full max-w-7xl max-h-[90vh] m-4 flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            图形编辑器
          </h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaSave className="w-4 h-4" />
              保存
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 工具栏 */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-4 flex-wrap">
            {/* 形状选择 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">形状：</span>
              <div className="flex gap-1 bg-white dark:bg-gray-800 rounded-lg p-1">
                <div
                  draggable
                  onDragStart={(e) => onDragStart(e, 'rectangle')}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative cursor-grab active:cursor-grabbing"
                  title="拖拽到画布添加矩形"
                >
                  <FaSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    拖拽添加矩形
                  </span>
                </div>
                <div
                  draggable
                  onDragStart={(e) => onDragStart(e, 'circle')}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative cursor-grab active:cursor-grabbing"
                  title="拖拽到画布添加圆形"
                >
                  <FaCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    拖拽添加圆形
                  </span>
                </div>
                <div
                  draggable
                  onDragStart={(e) => onDragStart(e, 'diamond')}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative cursor-grab active:cursor-grabbing"
                  title="拖拽到画布添加菱形"
                >
                  <FaGem className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    拖拽添加菱形
                  </span>
                </div>
                <div
                  draggable
                  onDragStart={(e) => onDragStart(e, 'triangle')}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative cursor-grab active:cursor-grabbing"
                  title="拖拽到画布添加三角形"
                >
                  <FaPlay className="w-5 h-5 text-gray-600 dark:text-gray-400" style={{ transform: 'rotate(90deg)' }} />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    拖拽添加三角形
                  </span>
                </div>
                <div
                  draggable
                  onDragStart={(e) => onDragStart(e, 'star')}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative cursor-grab active:cursor-grabbing"
                  title="拖拽到画布添加星形"
                >
                  <FaStar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    拖拽添加星形
                  </span>
                </div>
                <div
                  draggable
                  onDragStart={(e) => onDragStart(e, 'text')}
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group relative cursor-grab active:cursor-grabbing"
                  title="拖拽到画布添加文本"
                >
                  <FaFont className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    拖拽添加文本
                  </span>
                </div>
              </div>
            </div>

            {/* 颜色选择 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">颜色：</span>
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div 
                    className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600"
                    style={{ background: selectedColor.bg }}
                  ></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{selectedColor.name}</span>
                </button>
                
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-10">
                    <div className="grid grid-cols-4 gap-2">
                      {colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => {
                            setSelectedColor(color);
                            setShowColorPicker(false);
                          }}
                          className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                            selectedColor.name === color.name ? 'border-gray-900 dark:border-white' : 'border-transparent'
                          }`}
                          style={{ background: color.bg }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 使用提示 */}
            <div className="flex items-center gap-2 ml-auto">
              <FaArrowRight className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">拖拽形状到画布 • 双击编辑文字</span>
            </div>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>💡 使用提示：</strong> 
            从工具栏拖拽图形到画布 • 拖动形状移动位置 • 双击形状编辑文字 • 拖动形状边缘连接线条 • 
            Delete键删除选中项 • 滚轮缩放 • 拖动空白区域平移画布
          </p>
        </div>

        {/* 画布区域 */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Controls />
            <MiniMap 
              style={{ background: '#f3f4f6' }}
              nodeColor={(node) => node.data?.color || '#60a5fa'}
            />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>

        {/* 底部状态栏 */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>形状数量: <strong className="text-gray-900 dark:text-gray-100">{nodes.length}</strong></span>
              <span>连接数量: <strong className="text-gray-900 dark:text-gray-100">{edges.length}</strong></span>
            </div>
            <div className="flex items-center gap-4">
              <span>Delete键删除 • 双击编辑 • 拖动移动</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 外部包装组件，提供ReactFlow context
function DiagramEditor(props) {
  return (
    <ReactFlowProvider>
      <DiagramEditorInner {...props} />
    </ReactFlowProvider>
  );
}

export default DiagramEditor;
