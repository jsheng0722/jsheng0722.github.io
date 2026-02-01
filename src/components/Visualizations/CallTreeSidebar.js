import React, { useState } from 'react';

/**
 * 调用树节点：文件系统式展开/折叠，点击定位到对应定义（有 scrollKey 时）
 * ancestors 用于避免循环引用导致无限展开
 */
function TreeNode({ node, depth, onSelect, selectedKey, ancestors = new Set() }) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  /** 有 scrollKey 时用「方法#调用序号」区分多次同名调用，否则用 key */
  const scrollTarget = node.scrollKey
    ? (node.callIndex !== undefined && node.callIndex !== null
        ? `${node.scrollKey}#${node.callIndex}`
        : node.scrollKey)
    : node.key;
  const isSelected = selectedKey === scrollTarget;
  const childAncestors = new Set(ancestors);
  childAncestors.add(node.key);

  const visibleChildren = hasChildren
    ? node.children.filter((child) => !ancestors.has(child.key))
    : [];

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-1 py-1 px-2 rounded cursor-pointer text-sm font-mono hover:bg-slate-200 dark:hover:bg-slate-700 ${isSelected ? 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-200' : 'text-slate-700 dark:text-slate-300'}`}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => onSelect(node.scrollKey ? scrollTarget : null)}
      >
        <span
          className="w-4 h-4 flex items-center justify-center shrink-0"
          onClick={(e) => {
            if (visibleChildren.length > 0) {
              e.stopPropagation();
              setOpen((o) => !o);
            }
          }}
        >
          {visibleChildren.length > 0 ? (
            <span className="text-slate-500 dark:text-slate-400">{open ? '▼' : '▶'}</span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-xs">•</span>
          )}
        </span>
        <span className="truncate" title={node.displayName}>
          {node.displayName}
        </span>
      </div>
      {visibleChildren.length > 0 && open && (
        <div>
          {visibleChildren.map((child) => (
            <TreeNode
              key={child.key}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedKey={selectedKey}
              ancestors={childAncestors}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const BASE_SIDEBAR = 'shrink-0 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 flex flex-col';
const EXPAND_BTN = 'flex-1 flex flex-col items-center justify-center gap-0 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors min-h-[80px]';
const COLLAPSE_BTN = 'p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 shrink-0';

/**
 * 画布右侧快速定位菜单：代码中所有调用函数，文件系统式树形展示；可收缩
 */
export default function CallTreeSidebar({ callTree, onSelectMethod, selectedMethodKey }) {
  const [collapsed, setCollapsed] = useState(false);
  const hasTree = callTree && callTree.length > 0;
  const widthClass = collapsed ? 'w-10' : 'w-52';

  if (collapsed) {
    return (
      <div className={`${widthClass} ${BASE_SIDEBAR} overflow-hidden`}>
        <button type="button" onClick={() => setCollapsed(false)} className={EXPAND_BTN} title="展开调用关系">
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 rotate-90 origin-center whitespace-nowrap">调用关系</span>
          <span className="text-xs mt-2">◀</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`${widthClass} ${BASE_SIDEBAR} overflow-hidden`}>
      <div className="p-2 border-b border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-between gap-1">
        <div>
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">调用关系</div>
          {hasTree && <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">点击可定位到定义</div>}
        </div>
        <button type="button" onClick={() => setCollapsed(true)} className={COLLAPSE_BTN} title="收起侧边栏">▶</button>
      </div>
      <div className="flex-1 overflow-auto p-1 min-h-0">
        {hasTree ? (
          callTree.map((node) => (
            <TreeNode key={node.key} node={node} depth={0} onSelect={onSelectMethod} selectedKey={selectedMethodKey} />
          ))
        ) : (
          <div className="p-2 text-xs text-slate-400 dark:text-slate-500 italic">暂无函数</div>
        )}
      </div>
    </div>
  );
}
