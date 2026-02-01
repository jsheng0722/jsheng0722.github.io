import React, { useEffect, useMemo, useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { parseCodeStructure } from './codeParser';
import CodeStructureNode from './CodeStructureNode';
import CallTreeSidebar from './CallTreeSidebar';

const nodeTypes = { codeStructure: CodeStructureNode };

/**
 * 可视化画布 - 根据左侧代码解析并展示结构（class、def、变量、循环等）
 */
function VisualizationToolkitInner({ initialCode = null }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, , onEdgesChange] = useEdgesState([]);
  const [scrollToMethodKey, setScrollToMethodKey] = useState(null);
  const { setCenter, screenToFlowPosition, getZoom, fitBounds } = useReactFlow();

  /** 聚焦时让目标模块适应画布：计算元素在 flow 下的 bounds，再 fitBounds，无需手动调缩放 */
  const onCenterView = useCallback(
    (el) => {
      if (!el || typeof screenToFlowPosition !== 'function') return;
      const rect = el.getBoundingClientRect();
      const zoom = typeof getZoom === 'function' ? getZoom() : 1;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const flowCenter = screenToFlowPosition({ x: centerX, y: centerY });
      const flowW = rect.width / zoom;
      const flowH = rect.height / zoom;
      const bounds = {
        x: flowCenter.x - flowW / 2,
        y: flowCenter.y - flowH / 2,
        width: flowW,
        height: flowH,
      };
      if (typeof fitBounds === 'function') {
        fitBounds(bounds, { padding: 0.15, duration: 400 });
      } else if (typeof setCenter === 'function') {
        const fallbackZoom = typeof getZoom === 'function' ? Math.min(getZoom(), 0.9) : 0.85;
        setCenter(flowCenter.x, flowCenter.y, { duration: 400, zoom: fallbackZoom });
      }
    },
    [setCenter, screenToFlowPosition, getZoom, fitBounds]
  );

  const codeFromContext = initialCode || '';
  const structure = useMemo(() => parseCodeStructure(codeFromContext), [codeFromContext]);
  const hasStructure = structure.classes.length > 0 || structure.functions.length > 0;
  const callTree = structure.callTree || [];

  useEffect(() => {
    const node = {
      id: 'code-structure',
      type: 'codeStructure',
      position: { x: 20, y: 20 },
      data: { structure, code: codeFromContext, scrollToMethodKey, onCenterView },
      draggable: true,
    };
    setNodes([node]);
  }, [structure, codeFromContext, scrollToMethodKey, onCenterView, setNodes]);

  useEffect(() => {
    if (setCenter) {
      const t = setTimeout(() => {
        setCenter(150, 80, { zoom: 0.8, duration: 0 });
      }, 150);
      return () => clearTimeout(t);
    }
    // 仅初始视口定位，不依赖 onCenterView
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCenter, hasStructure]);

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 flex-1 min-w-0" style={{ minHeight: '500px', height: '100%' }}>
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 bg-gray-100 dark:bg-gray-950 min-w-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.2}
            maxZoom={2}
          >
            <Background variant="dots" gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor="#60a5fa"
              style={{ backgroundColor: '#f3f4f6' }}
            />
          </ReactFlow>
        </div>
        <CallTreeSidebar
          callTree={callTree}
          onSelectMethod={setScrollToMethodKey}
          selectedMethodKey={scrollToMethodKey}
        />
      </div>
    </div>
  );
}

function VisualizationToolkitWithReactFlow({ initialCode = null }) {
  return (
    <ReactFlowProvider>
      <VisualizationToolkitInner initialCode={initialCode} />
    </ReactFlowProvider>
  );
}
export default VisualizationToolkitWithReactFlow;

