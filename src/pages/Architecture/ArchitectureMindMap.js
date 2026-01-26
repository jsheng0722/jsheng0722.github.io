import React, { useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  FaHome, FaStickyNote, FaMusic, FaFolder, FaDesktop, 
  FaBlog, FaVideo, FaShoppingCart, FaCode, FaImage,
  FaEye, FaEdit, FaFileAlt, FaChartLine, FaLayerGroup,
  FaPalette, FaCog, FaDatabase, FaChevronRight, FaChevronDown
} from 'react-icons/fa';

// 自定义节点组件 - 文件系统风格
function FileSystemNode({ data }) {
  const { label, icon: Icon, color, type = 'folder' } = data;
  
  const isFolder = type === 'folder';
  
  return (
    <div
      className="flex items-center gap-2 px-4 py-3 rounded-lg shadow-md border-2 transition-all hover:scale-105 relative"
      style={{
        backgroundColor: color || (isFolder ? '#3b82f6' : '#10b981'),
        borderColor: color || (isFolder ? '#2563eb' : '#059669'),
        color: 'white',
        minWidth: '180px',
        maxWidth: '220px',
      }}
    >
      {/* 输入连接点（顶部） */}
      <Handle
        id="target-top"
        type="target"
        position={Position.Top}
        style={{ 
          background: '#6366f1',
          width: '12px',
          height: '12px',
          border: '2px solid white',
        }}
      />
      
      {Icon && <Icon className="text-lg flex-shrink-0" />}
      <div className="font-semibold text-sm truncate">{label}</div>
      {isFolder && <span className="text-xs opacity-75">📁</span>}
      
      {/* 输出连接点（底部） */}
      <Handle
        id="source-bottom"
        type="source"
        position={Position.Bottom}
        style={{ 
          background: '#6366f1',
          width: '12px',
          height: '12px',
          border: '2px solid white',
        }}
      />
    </div>
  );
}

const nodeTypes = {
  filesystem: FileSystemNode,
};

// 左侧导航目录组件
function NavigationTree({ nodes, edges, onNodeClick }) {
  const [expanded, setExpanded] = useState({});
  
  const toggleExpand = (nodeId) => {
    setExpanded(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // 构建树状结构 - 通过edges找到父子关系
  const buildTree = () => {
    const nodeMap = new Map();
    const childrenMap = new Map();
    
    // 初始化所有节点
    nodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] });
      childrenMap.set(node.id, []);
    });

    // 通过edges建立父子关系
    edges.forEach(edge => {
      const children = childrenMap.get(edge.source) || [];
      children.push(edge.target);
      childrenMap.set(edge.source, children);
    });

    // 构建树结构
    const rootNodes = [];
    nodes.forEach(node => {
      const nodeInfo = nodeMap.get(node.id);
      const children = childrenMap.get(node.id) || [];
      nodeInfo.children = children.map(childId => nodeMap.get(childId)).filter(Boolean);
      
      // 找到根节点（没有父节点的节点）
      const hasParent = edges.some(edge => edge.target === node.id);
      if (!hasParent) {
        rootNodes.push(nodeInfo);
      }
    });

    return rootNodes;
  };

  const rootNodes = buildTree();

  const renderNode = (node, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded[node.id];
    const Icon = node.data.icon;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
            level > 0 ? 'ml-4' : ''
          }`}
          onClick={() => {
            if (hasChildren) {
              toggleExpand(node.id);
            }
            onNodeClick(node.id);
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <FaChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
            ) : (
              <FaChevronRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
            )
          ) : (
            <span className="w-3 h-3 flex-shrink-0" />
          )}
          {Icon && <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />}
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
            {node.data.label}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FaLayerGroup className="text-blue-500" />
          项目架构导航
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">点击项目聚焦到对应位置</p>
      </div>
      <div className="p-2">
        {rootNodes.map(node => renderNode(node))}
      </div>
    </div>
  );
}

// 图标映射
const iconMap = {
  'FaHome': FaHome,
  'FaStickyNote': FaStickyNote,
  'FaMusic': FaMusic,
  'FaFolder': FaFolder,
  'FaDesktop': FaDesktop,
  'FaBlog': FaBlog,
  'FaVideo': FaVideo,
  'FaShoppingCart': FaShoppingCart,
  'FaCode': FaCode,
  'FaImage': FaImage,
  'FaEye': FaEye,
  'FaEdit': FaEdit,
  'FaFileAlt': FaFileAlt,
  'FaChartLine': FaChartLine,
  'FaLayerGroup': FaLayerGroup,
  'FaPalette': FaPalette,
  'FaCog': FaCog,
  'FaDatabase': FaDatabase,
};

// 根据名称获取图标组件
function getIconComponent(iconName) {
  return iconMap[iconName] || FaFileAlt;
}

// 生成文件系统树状布局（从动态数据）
function generateFileSystemLayout(architectureData) {
  let nodeIdCounter = 0;

  // 创建节点ID
  const createNodeId = () => `node_${nodeIdCounter++}`;

  // 颜色方案
  const colors = {
    root: '#3b82f6',      // 蓝色 - 根节点
    routes: '#8b5cf6',    // 紫色 - 路由
    components: '#10b981', // 绿色 - 组件
    tools: '#f59e0b',     // 橙色 - 工具
    context: '#ec4899',   // 粉色 - 上下文
    deployment: '#6b7280', // 灰色 - 部署
  };

  // 节点数据结构
  const nodeData = [];
  const nodeMap = new Map();

  // 添加节点的辅助函数（不设置位置）
  const addNode = (label, icon, color, type, level, parentId = null) => {
    const nodeId = createNodeId();
    const nodeInfo = {
      id: nodeId,
      label,
      icon,
      color,
      type,
      level,
      parentId,
      children: [],
    };
    nodeData.push(nodeInfo);
    nodeMap.set(nodeId, nodeInfo);
    
    if (parentId) {
      const parent = nodeMap.get(parentId);
      if (parent) {
        parent.children.push(nodeId);
      }
    }

    return nodeId;
  };

  // 如果没有数据，使用默认数据
  if (!architectureData) {
    return generateDefaultLayout(addNode, colors);
  }

  // 根节点
  const rootId = addNode('项目架构', FaLayerGroup, colors.root, 'folder', 0);

  // ========== 路由系统 ==========
  if (architectureData.routes && architectureData.routes.length > 0) {
    const routesId = addNode('路由系统', FaCode, colors.routes, 'folder', 1, rootId);
    
    // 按路径分组路由
    const routeGroups = {
      '主要页面': [],
      '笔记系统': [],
      '内容管理': [],
      '展示页面': [],
      '工具页面': [],
    };

    architectureData.routes.forEach(route => {
      const path = route.path;
      if (path === '/' || path === '/home' || path === '/classic' || path === '/desktop') {
        routeGroups['主要页面'].push(route);
      } else if (path.startsWith('/notes')) {
        routeGroups['笔记系统'].push(route);
      } else if (path.startsWith('/music') || path.startsWith('/files') || 
                 path.startsWith('/blog') || path.startsWith('/video') || 
                 path.startsWith('/shop')) {
        routeGroups['内容管理'].push(route);
      } else if (path.startsWith('/portfolio') || path.startsWith('/products')) {
        routeGroups['展示页面'].push(route);
      } else {
        routeGroups['工具页面'].push(route);
      }
    });

    // 创建分组并添加路由
    Object.entries(routeGroups).forEach(([groupName, routes]) => {
      if (routes.length > 0) {
        const groupIcon = groupName === '主要页面' ? FaHome :
                         groupName === '笔记系统' ? FaStickyNote :
                         groupName === '内容管理' ? FaFolder :
                         groupName === '展示页面' ? FaImage : FaChartLine;
        const groupId = addNode(groupName, groupIcon, colors.routes, 'folder', 2, routesId);
        
        routes.forEach(route => {
          const iconName = route.icon || 'FaFileAlt';
          const Icon = getIconComponent(iconName);
          addNode(route.path, Icon, '#60a5fa', 'file', 3, groupId);
        });
      }
    });
  }

  // ========== 组件库 ==========
  if (architectureData.components && architectureData.components.length > 0) {
    const componentsId = addNode('组件库', FaPalette, colors.components, 'folder', 1, rootId);
    addComponentsFromTree(architectureData.components, componentsId, addNode, colors);
  }

  // ========== 工具函数 ==========
  if (architectureData.utils && architectureData.utils.length > 0) {
    const utilsId = addNode('工具函数', FaCog, colors.tools, 'folder', 1, rootId);
    addItemsFromTree(architectureData.utils, utilsId, addNode, colors.tools, '#fbbf24', 2);
  }

  // ========== 上下文 ==========
  if (architectureData.contexts && architectureData.contexts.length > 0) {
    const contextId = addNode('上下文', FaDatabase, colors.context, 'folder', 1, rootId);
    addItemsFromTree(architectureData.contexts, contextId, addNode, colors.context, '#f472b6', 2);
  }

  // ========== 部署信息 ==========
  const deploymentId = addNode('部署信息', FaFileAlt, colors.deployment, 'folder', 1, rootId);
  addNode('GitHub Pages', FaFileAlt, '#9ca3af', 'file', 2, deploymentId);
  addNode('gh-pages', FaFileAlt, '#9ca3af', 'file', 2, deploymentId);
  addNode('BrowserRouter', FaFileAlt, '#9ca3af', 'file', 2, deploymentId);
  addNode('.nojekyll', FaFileAlt, '#9ca3af', 'file', 2, deploymentId);

  return layoutAndConvertNodes(nodeData, nodeMap);
}

// 默认布局（当没有数据时）
function generateDefaultLayout(addNode, colors) {
  const rootId = addNode('项目架构', FaLayerGroup, colors.root, 'folder', 0);
  const routesId = addNode('路由系统', FaCode, colors.routes, 'folder', 1, rootId);
  addNode('加载中...', FaFileAlt, '#60a5fa', 'file', 2, routesId);
  return layoutAndConvertNodes([], new Map());
}

// 从树结构添加组件
function addComponentsFromTree(items, parentId, addNode, colors, level = 2) {
  items.forEach(item => {
    if (item.type === 'folder') {
      const icon = getIconComponent(item.name.includes('Layout') ? 'FaLayerGroup' : 
                                    item.name.includes('UI') ? 'FaPalette' : 
                                    item.name.includes('Visualization') ? 'FaChartLine' : 'FaCode');
      const folderId = addNode(item.name, icon, colors.components, 'folder', level, parentId);
      if (item.children && item.children.length > 0) {
        addComponentsFromTree(item.children, folderId, addNode, colors, level + 1);
      }
    } else {
      const icon = getIconComponent('FaFileAlt');
      addNode(item.name, icon, '#34d399', 'file', level, parentId);
    }
  });
}

// 从树结构添加项目
function addItemsFromTree(items, parentId, addNode, folderColor, fileColor, level = 2) {
  items.forEach(item => {
    if (item.type === 'folder') {
      const folderId = addNode(item.name, FaFolder, folderColor, 'folder', level, parentId);
      if (item.children && item.children.length > 0) {
        addItemsFromTree(item.children, folderId, addNode, folderColor, fileColor, level + 1);
      }
    } else {
      const icon = getIconComponent('FaCode');
      addNode(item.name, icon, fileColor, 'file', level, parentId);
    }
  });
}

// 布局并转换节点
function layoutAndConvertNodes(nodeData, nodeMap) {
  const nodes = [];
  const edges = [];

  if (nodeData.length === 0) {
    return { nodes, edges, nodeMap };
  }

  // 找到根节点
  const rootNode = nodeData.find(n => !n.parentId);
  if (!rootNode) return { nodes, edges, nodeMap };

  // 计算每个节点的子树大小（叶子节点数量）
  const calculateSubtreeSize = (nodeId) => {
    const node = nodeMap.get(nodeId);
    if (!node) return 0;
    if (node.children.length === 0) return 1;
    
    let size = 0;
    node.children.forEach(childId => {
      size += calculateSubtreeSize(childId);
    });
    return size;
  };

  // 改进的树状布局算法
  const layoutTree = (nodeId, startY, level) => {
    const node = nodeMap.get(nodeId);
    if (!node) return startY;

    const nodeHeight = 80; // 节点高度（包括间距）
    const levelSpacing = 300; // 层级之间的水平间距
    const verticalSpacing = 100; // 垂直间距

    // 计算当前节点的子树大小
    const subtreeSize = calculateSubtreeSize(nodeId);
    
    // 计算当前节点的Y位置（居中其子树）
    let currentY = startY;
    
    // 如果有子节点，先布局子节点
    if (node.children.length > 0) {
      let childStartY = startY;
      
      node.children.forEach((childId) => {
        const childY = layoutTree(childId, childStartY, level + 1);
        childStartY = childY + verticalSpacing;
      });
      
      // 当前节点位置：子节点范围的中间
      const firstChild = nodeMap.get(node.children[0]);
      const lastChild = nodeMap.get(node.children[node.children.length - 1]);
      if (firstChild && lastChild && firstChild.position && lastChild.position) {
        currentY = (firstChild.position.y + lastChild.position.y) / 2;
      }
    }

    // 设置节点位置
    node.position = {
      x: 100 + level * levelSpacing,
      y: currentY,
    };

    return startY + Math.max(subtreeSize * nodeHeight, nodeHeight);
  };

  // 从根节点开始布局
  layoutTree(rootNode.id, 100, 0);

  // 转换为ReactFlow节点和边
  nodeData.forEach(nodeInfo => {
    nodes.push({
      id: nodeInfo.id,
      type: 'filesystem',
      position: nodeInfo.position,
      data: {
        label: nodeInfo.label,
        icon: nodeInfo.icon,
        color: nodeInfo.color,
        type: nodeInfo.type,
        level: nodeInfo.level,
      },
    });
  });

  // 创建所有连线 - 在nodes创建之后
  nodeData.forEach(nodeInfo => {
    if (nodeInfo.parentId) {
      const parentNode = nodeMap.get(nodeInfo.parentId);
      const parentColor = parentNode?.color || '#6366f1';
      
      edges.push({
        id: `edge_${nodeInfo.parentId}_${nodeInfo.id}`,
        source: nodeInfo.parentId,
        target: nodeInfo.id,
        sourceHandle: 'source-bottom',
        targetHandle: 'target-top',
        type: 'smoothstep',
        style: { 
          stroke: parentColor, 
          strokeWidth: 4,
          opacity: 1,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: parentColor,
          width: 25,
          height: 25,
        },
        animated: false,
      });
    }
  });

  console.log('Generated nodes:', nodes.length, 'edges:', edges.length);
  if (edges.length > 0) {
    console.log('First edge:', edges[0]);
  }
  if (nodes.length > 0) {
    console.log('First node:', nodes[0]);
  }

  return { nodes, edges, nodeMap };
}

function ArchitectureMindMap() {
  const [architectureData, setArchitectureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 动态加载架构数据
  useEffect(() => {
    // 获取正确的 base path（支持 GitHub Pages）
    const basePath = process.env.PUBLIC_URL || '';
    const dataPath = `${basePath}/data/architecture.json`;
    
    fetch(dataPath)
      .then(response => {
        if (!response.ok) {
          throw new Error('无法加载架构数据');
        }
        return response.json();
      })
      .then(data => {
        setArchitectureData(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn('加载架构数据失败，使用默认数据:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return generateFileSystemLayout(architectureData);
  }, [architectureData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { setCenter } = useReactFlow();

  // 当数据更新时，更新节点和边
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // 聚焦到指定节点
  const focusOnNode = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const x = node.position.x;
      const y = node.position.y;
      setCenter(x, y, { zoom: 1.2, duration: 500 });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">正在加载架构数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">加载失败: {error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">请运行 npm run generate-architecture 生成架构数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full bg-gray-50 dark:bg-gray-950">
      {/* 左侧导航目录 */}
      <NavigationTree nodes={nodes} edges={edges} onNodeClick={focusOnNode} />
      
      {/* 右侧思维导图画布 */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          attributionPosition="bottom-right"
          minZoom={0.1}
          maxZoom={2}
          nodesDraggable={true}
          edgesUpdatable={false}
          edgesFocusable={false}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false,
            style: {
              strokeWidth: 3,
              stroke: '#6366f1',
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          }}
        >
          <Background variant="dots" gap={20} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(node) => node.data?.color || '#60a5fa'}
            style={{ backgroundColor: '#f3f4f6' }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function ArchitectureMindMapWrapper() {
  return (
    <ReactFlowProvider>
      <ArchitectureMindMap />
    </ReactFlowProvider>
  );
}
