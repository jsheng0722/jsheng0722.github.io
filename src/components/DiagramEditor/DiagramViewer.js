import React from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes } from './EditableNodes';

function DiagramViewer({ diagramData }) {
  if (!diagramData || !diagramData.nodes || diagramData.nodes.length === 0) {
    return null;
  }

  return (
    <div className="my-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2">
        <h4 className="font-medium flex items-center gap-2">
          📊 图形内容
        </h4>
      </div>
      <div className="h-96 bg-gray-50 dark:bg-gray-900">
        <ReactFlow
          nodes={diagramData.nodes}
          edges={diagramData.edges}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          attributionPosition="bottom-right"
        >
          <Controls showInteractive={false} />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}

export default DiagramViewer;
