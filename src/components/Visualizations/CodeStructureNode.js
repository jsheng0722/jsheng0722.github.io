import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import DynamicMethodVisualization from './DynamicMethodVisualization';
import { parseCodeStructure, parsePrintExpressions } from './codeParser';
import { formatValue } from './VizComponents/formatValue';
import { parseListParam } from './VizComponents/parseParams';

const emptyStructure = { classes: [], functions: [], dataFlow: [], dataFlowWarnings: [], callSiteArgs: {}, topLevelPrintCalls: [], callTree: [] };

function CodeStructureNode({ data }) {
  const code = data?.code ?? '';
  const structureFromData = data?.structure;
  // 有 code 时始终用当前代码解析，保证 callSiteArgs（print(solution(...)) 等）与参数框赋值一致
  const structure = useMemo(() => {
    if (code) return parseCodeStructure(code);
    if (structureFromData && (structureFromData.classes?.length || structureFromData.functions?.length)) return structureFromData;
    return emptyStructure;
  }, [code, structureFromData]);

  const callSiteArgs = useMemo(() => structure.callSiteArgs || {}, [structure.callSiteArgs]);
  const dataFlow = useMemo(() => structure.dataFlow || [], [structure.dataFlow]);
  const dataFlowWarnings = structure.dataFlowWarnings || [];
  const topLevelPrintCalls = structure.topLevelPrintCalls || [];
  const [userEditedParamValues, setUserEditedParamValues] = useState({});
  const [returnValues, setReturnValues] = useState({});
  const [linePositions, setLinePositions] = useState([]);
  const containerRef = useRef(null);
  const returnRefs = useRef({});
  const paramRefs = useRef({});
  const methodRefs = useRef({});

  const setParam = (methodKey, paramName, value) => {
    setUserEditedParamValues((prev) => ({ ...prev, [`${methodKey}.${paramName}`]: value }));
  };

  const getParam = useCallback(
    (methodKey, paramName, runIndex) => {
      const runs = callSiteArgs[methodKey];
      const isArray = Array.isArray(runs);
      // 单次调用：runs 为数组且未传 runIndex 时取 runs[0]，保证参数框能显示 print(fn(...)) 解析出的值
      if (runIndex === undefined && !isArray)
        return userEditedParamValues[`${methodKey}.${paramName}`] ?? (runs && typeof runs === 'object' ? runs[paramName] : '') ?? '';
      const idx = runIndex ?? 0;
      const one = isArray && runs.length > 0 ? runs[idx] : !isArray ? runs : undefined;
      return (one && one[paramName]) ?? userEditedParamValues[`${methodKey}.${paramName}`] ?? '';
    },
    [userEditedParamValues, callSiteArgs]
  );

  const getRuns = useCallback(
    (methodKey) => {
      const raw = callSiteArgs[methodKey];
      if (!raw) return [];
      return Array.isArray(raw) ? raw : [raw];
    },
    [callSiteArgs]
  );

  const getToParamName = useCallback(
    (edge) => {
      if (edge.to.class) {
        const cls = structure.classes.find((c) => c.name === edge.to.class);
        const method = cls?.methods.find((m) => m.name === edge.to.method);
        return method?.params?.[edge.toParamIndex];
      }
      const fn = structure.functions.find((f) => f.name === edge.to.method);
      return fn?.params?.[edge.toParamIndex];
    },
    [structure]
  );

  const toKey = (edge) => (edge.to.class ? `${edge.to.class}.${edge.to.method}` : `fn.${edge.to.method}`);
  const fromKey = (edge) => (edge.from.class ? `${edge.from.class}.${edge.from.method}` : `fn.${edge.from.method}`);

  const isParamConnected = (methodKey, paramName) =>
    dataFlow.some((e) => toKey(e) === methodKey && getToParamName(e) === paramName);

  const getParamEffective = (methodKey, paramName) => {
    const edge = dataFlow.find((e) => toKey(e) === methodKey && getToParamName(e) === paramName);
    if (edge) {
      const from = fromKey(edge);
      const val = returnValues[from];
      if (val !== undefined && val !== null) return formatValue(val, '');
      return '';
    }
    return getParam(methodKey, paramName);
  };

  const onReturnValue = useCallback((methodKey, value, callIndex) => {
    const key = callIndex !== undefined && callIndex !== null ? `${methodKey}#${callIndex}` : methodKey;
    setReturnValues((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    if (!containerRef.current || dataFlow.length === 0) {
      setLinePositions([]);
      return;
    }
    const containerRect = containerRef.current.getBoundingClientRect();
    const positions = [];
    dataFlow.forEach((edge) => {
      const fromK = fromKey(edge);
      const toK = toKey(edge);
      const toParamName = getToParamName(edge);
      const fromEl = returnRefs.current[fromK];
      const toEl = paramRefs.current[toK]?.[toParamName];
      if (!fromEl || !toEl) return;
      const fromR = fromEl.getBoundingClientRect();
      const toR = toEl.getBoundingClientRect();
      positions.push({
        id: `${fromK}-${toK}-${toParamName}`,
        from: { x: fromR.right - containerRect.left, y: fromR.top - containerRect.top + fromR.height / 2 },
        to: { x: toR.left - containerRect.left, y: toR.top - containerRect.top + toR.height / 2 },
      });
    });
    setLinePositions(positions);
    // getToParamName 已用 useCallback(structure) 稳定，此处依赖完整
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataFlow, structure, returnValues, userEditedParamValues, getToParamName]);

  const scrollToMethodKey = data?.scrollToMethodKey;
  const [scrollToMethodKeyOnly, scrollToRunIndex] = useMemo(() => {
    const raw = scrollToMethodKey || '';
    const idx = raw.indexOf('#');
    if (idx === -1) return [raw || null, undefined];
    const methodKeyPart = raw.slice(0, idx);
    const runPart = raw.slice(idx + 1);
    const runIndex = runPart === '' ? undefined : parseInt(runPart, 10);
    return [methodKeyPart || null, Number.isNaN(runIndex) ? undefined : runIndex];
  }, [scrollToMethodKey]);

  const onCenterView = data?.onCenterView;
  useEffect(() => {
    if (!scrollToMethodKeyOnly) return;
    const el = methodRefs.current[scrollToMethodKeyOnly];
    if (!el) return;
    if (scrollToRunIndex == null && typeof onCenterView === 'function') onCenterView(el);
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [scrollToMethodKeyOnly, scrollToRunIndex, onCenterView]);

  const renderMethod = (method, methodKey) => {
    const runs = (getRuns ?? (() => []))(methodKey);
    const multiRun = Array.isArray(runs) && runs.length > 1;
    return (
    <div
      key={methodKey}
      ref={(el) => { if (el) methodRefs.current[methodKey] = el; }}
      className="relative rounded-lg border-2 border-cyan-500/50 bg-cyan-50/50 dark:bg-cyan-900/10 dark:border-cyan-400/30 p-3 min-w-[220px]"
      data-method-key={methodKey}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="font-mono font-semibold text-cyan-800 dark:text-cyan-200 text-sm shrink-0">
          def {method.name}({method.params.join(', ')})
        </div>
        {!multiRun && (
        <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
          {method.params.filter((p) => p !== 'self').map((p) => {
            const connected = isParamConnected(methodKey, p);
            return (
              <input
                key={p}
                ref={(el) => {
                  if (!paramRefs.current[methodKey]) paramRefs.current[methodKey] = {};
                  paramRefs.current[methodKey][p] = el;
                }}
                type="text"
                placeholder={connected ? `← ${fromKey(dataFlow.find((e) => toKey(e) === methodKey && getToParamName(e) === p))}` : p}
                value={getParamEffective(methodKey, p)}
                onChange={(e) => !connected && setParam(methodKey, p, e.target.value)}
                readOnly={connected}
                className={`min-w-[5rem] px-2 py-1 text-xs border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                  connected ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
            );
          })}
        </div>
        )}
      </div>
      <DynamicMethodVisualization
        methodKey={methodKey}
        method={method}
        getParam={getParam}
        getRuns={getRuns ?? (() => [])}
        onReturnValue={onReturnValue}
        returnBoxRef={(el) => { returnRefs.current[methodKey] = el; }}
        scrollToRunIndex={scrollToMethodKeyOnly === methodKey ? scrollToRunIndex : undefined}
        onCenterView={scrollToMethodKeyOnly === methodKey && scrollToRunIndex != null ? onCenterView : undefined}
      />
      {method.body?.some((b) => b?.raw && /print\s*\(/.test(b.raw)) && (() => {
        const exprs = parsePrintExpressions(method.body);
        const displayParams = method.params.filter((p) => p !== 'self');
        if (!displayParams.length) return null;
        const parts = [];
        for (const e of exprs) {
          if (e.param == null) { parts.push(e.raw ?? ''); continue; }
          const val = getParamEffective(methodKey, e.param);
          if (e.index != null) {
            const arr = parseListParam(val);
            parts.push(arr[e.index] !== undefined ? String(arr[e.index]) : '');
          } else {
            parts.push(val || '');
          }
        }
        const displayText = parts.length ? parts.join(' ') : null;
        return (
          <div className="mt-3 rounded-lg border-2 border-slate-400 bg-slate-100 dark:bg-slate-800/50 dark:border-slate-500/50 px-3 py-2">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">print 输出</div>
            <div className="font-mono text-sm text-slate-800 dark:text-slate-200 break-all">
              {displayText != null && displayText !== '' ? displayText : <span className="italic text-slate-400">（等待参数）</span>}
            </div>
          </div>
        );
      })()}
    </div>
  );
  };

  const renderClass = (cls) => (
    <div
      key={cls.name}
      className="rounded-xl border-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 dark:border-indigo-400/40 p-4 inline-block"
    >
      <div className="font-mono font-bold text-indigo-800 dark:text-indigo-200 text-base mb-3 pb-2 border-b border-indigo-200 dark:border-indigo-700">
        class {cls.name}
      </div>
      <div className="flex flex-col gap-3">
        {cls.methods.map((method) => renderMethod(method, `${cls.name}.${method.name}`))}
      </div>
    </div>
  );

  const renderTopLevelFunction = (fn) => (
    <div key={fn.name} className="rounded-lg border-2 border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-400/30 p-3">
      {renderMethod(fn, `fn.${fn.name}`)}
    </div>
  );

  const hasContent = structure.classes.length > 0 || structure.functions.length > 0;

  if (!hasContent) {
    return (
      <div className="text-sm text-gray-400 dark:text-gray-500 italic">
        在左侧输入代码后在此显示
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-4">
      {dataFlowWarnings.length > 0 && (
        <div className="rounded-lg border border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600/50 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
          <div className="font-semibold mb-1">无法解析的数据流</div>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            {dataFlowWarnings.map((w, i) => (
              <li key={i}>
                {w.type === 'source_not_found' && <>函数 {w.callName} 未在代码中定义（作为 {w.usedAsArgOf} 的参数）</>}
                {w.type === 'target_not_found' && <>调用目标 {w.callName} 未在代码中定义</>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {linePositions.length > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none z-0"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <marker id="dataflow-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <path d="M0,0 L10,3 L0,6 Z" fill="#22c55e" />
            </marker>
          </defs>
          {linePositions.map(({ id, from, to }) => (
            <path
              key={id}
              d={`M ${from.x} ${from.y} C ${from.x + 40} ${from.y}, ${to.x - 40} ${to.y}, ${to.x} ${to.y}`}
              stroke="#22c55e"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#dataflow-arrow)"
            />
          ))}
        </svg>
      )}
      <div className="relative z-10 flex flex-col gap-4">
        {structure.classes.map(renderClass)}
        {structure.functions.map(renderTopLevelFunction)}
        {topLevelPrintCalls.length > 0 && (
          <div className="rounded-lg border-2 border-slate-400 bg-slate-100 dark:bg-slate-800/50 dark:border-slate-500/50 px-3 py-2">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">print 输出（调用 print 打印的结果）</div>
            <ul className="space-y-1.5 text-sm">
              {topLevelPrintCalls.map((item, i) => {
                const key = item.callIndex != null ? `${item.methodKey}#${item.callIndex}` : item.methodKey;
                const val = returnValues[key] ?? returnValues[item.methodKey];
                const display = val !== undefined && val !== null ? formatValue(val, '') : null;
                return (
                  <li key={i} className="font-mono text-slate-800 dark:text-slate-200">
                    <span className="text-slate-500 dark:text-slate-400">{item.callText ?? ''}</span>
                    {' → '}
                    {display != null && display !== '' ? (
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{display}</span>
                    ) : (
                      <span className="italic text-slate-400">（等待 {item.methodKey.replace('fn.', '')} 的返回值）</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default CodeStructureNode;
