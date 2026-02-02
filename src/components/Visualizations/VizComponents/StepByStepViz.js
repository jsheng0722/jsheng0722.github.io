import React, { useMemo, useEffect, useState, useRef } from 'react';
import { parseListParam, parseNumberParam } from './parseParams';
import { formatValue } from './formatValue';
import EmptyVizMessage from './EmptyVizMessage';
import { executeStepByStep } from '../algorithmSteps';

const STEP_EMPTY = '—';

/**
 * 递归消费一个循环块（含其内层循环），返回 { block, nextIndex }
 */
function consumeOneLoopBlock(steps, startIndex) {
  let i = startIndex;
  if (i >= steps.length || steps[i].type !== 'loop_enter') return { block: null, nextIndex: i };
  const loopEnter = steps[i];
  const iterations = [];
  let currentIter = null;
  i++;
  while (i < steps.length) {
    const t = steps[i];
    if (t.type === 'loop_iter' && t.iterator === loopEnter.iterator) {
      currentIter = { iterValue: t.value, assigns: [], nested: [] };
      iterations.push(currentIter);
      i++;
    } else if (t.type === 'loop_enter') {
      if (t.iterator === loopEnter.iterator) {
        break;
      }
      const { block: innerBlock, nextIndex } = consumeOneLoopBlock(steps, i);
      if (innerBlock && currentIter) currentIter.nested.push(innerBlock);
      i = nextIndex;
    } else if (t.type === 'assign' && currentIter) {
      currentIter.assigns.push({ left: t.left, value: t.value });
      i++;
    } else if (t.type === 'subst') {
      i++;
    } else if (t.type === 'return') {
      break;
    } else {
      i++;
    }
  }
  const finalVars = {};
  iterations.forEach((iter) => {
    iter.assigns.forEach(({ left, value }) => {
      finalVars[left] = value;
    });
  });
  const varLists = {};
  Object.keys(finalVars).forEach((left) => {
    const withAssign = iterations.filter((iter) => iter.assigns.some((x) => x.left === left));
    varLists[left] = withAssign.map((iter) => {
      const forLeft = iter.assigns.filter((x) => x.left === left);
      return forLeft[forLeft.length - 1].value;
    });
  });
  const varIterValues = {};
  Object.keys(finalVars).forEach((left) => {
    const withAssign = iterations.filter((iter) => iter.assigns.some((x) => x.left === left));
    varIterValues[left] = withAssign.map((iter) => iter.iterValue);
  });
  const block = {
    type: 'loop_block',
    loopEnter,
    iterations,
    finalVars,
    varLists,
    varIterValues,
  };
  return { block, nextIndex: i };
}

/**
 * 将扁平 steps 转为“显示块”树：单步 或 循环块（循环块内 iterations[].nested 为内层块，具备层次）
 */
function stepsToDisplayBlocks(steps) {
  const blocks = [];
  let i = 0;
  while (i < steps.length) {
    const s = steps[i];
    if (s.type === 'subst' || s.type === 'assign' || s.type === 'return') {
      blocks.push({ type: s.type, step: s });
      i++;
      continue;
    }
    if (s.type === 'loop_enter') {
      const { block, nextIndex } = consumeOneLoopBlock(steps, i);
      if (block) blocks.push(block);
      i = nextIndex;
      continue;
    }
    if (s.type === 'loop_iter') {
      blocks.push({ type: 'loop_iter', step: s });
      i++;
      continue;
    }
    i++;
  }
  return blocks;
}

function runToParamValues(run, params) {
  const out = {};
  for (const p of params) {
    const raw = run[p] ?? '';
    if (raw && (String(raw).includes(',') || String(raw).trim().startsWith('['))) {
      out[p] = parseListParam(raw);
    } else {
      const n = parseNumberParam(raw);
      out[p] = n !== null ? n : (raw === '' ? undefined : raw);
    }
  }
  return out;
}

const INDENT_STEP = 20;

function LoopBlockRow({ blockIndex, block, collapsed, onToggle, depth = 0, renderNested = () => null }) {
  const { loopEnter, iterations, finalVars, varLists, varIterValues = {} } = block;
  const hasBounds = loopEnter.rangeStart != null && loopEnter.rangeEnd != null;
  const varNames = Object.keys(varLists);
  const hasDirectAssigns = varNames.length > 0;
  const style = depth > 0 ? { marginLeft: depth * INDENT_STEP } : undefined;

  // 外层循环没有“夹在两层循环之间的赋值”时，不提供折叠，只显示一行
  if (!hasDirectAssigns) {
    return (
      <li className="font-mono text-gray-800 dark:text-gray-200 py-0.5 pl-1 flex items-center gap-2 flex-wrap" style={style}>
        <span className="text-amber-600 dark:text-amber-400">for {loopEnter.iterator} in {loopEnter.iterable}</span>
        {hasBounds && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            计算得 range({loopEnter.rangeStart}, {loopEnter.rangeEnd})
          </span>
        )}
        {iterations.some((iter) => iter.nested?.length) ? (
          <div className="w-full mt-1.5 border-l-2 border-slate-200 dark:border-slate-600" style={{ marginLeft: INDENT_STEP }}>
            {iterations.flatMap((iter, iterIdx) => (iter.nested || []).map((nestedBlock, nestedIdx) =>
              renderNested(nestedBlock, iterIdx, nestedIdx)
            ))}
          </div>
        ) : null}
      </li>
    );
  }

  if (collapsed) {
    return (
      <li className="list-none -ml-6" style={style}>
        <div className="rounded-lg border border-amber-200 dark:border-amber-700/50 bg-amber-50/50 dark:bg-amber-900/10 py-2 px-3 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onToggle}
            className="font-mono text-sm text-amber-700 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-700/30 rounded px-2 py-0.5 transition-colors shrink-0 flex items-center gap-1.5"
            aria-label="展开"
          >
            <span className="text-amber-500 dark:text-amber-400">▶</span>
            <span>for {loopEnter.iterator} in {loopEnter.iterable}</span>
          </button>
          {hasBounds && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              range({loopEnter.rangeStart}, {loopEnter.rangeEnd})
            </span>
          )}
          <span className="inline-flex items-center gap-2 text-xs border-l border-amber-200 dark:border-amber-700/50 pl-3 ml-1">
            <span className="text-slate-500 dark:text-slate-400">循环结束后</span>
            {varNames.map((name) => (
              <span key={name} className="font-mono px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                <span className="text-cyan-600 dark:text-cyan-400">{name}</span>
                <span className="mx-1 text-slate-500">=</span>
                <span className="font-semibold">{formatValue(finalVars[name], STEP_EMPTY)}</span>
              </span>
            ))}
          </span>
        </div>
        {iterations.some((iter) => iter.nested?.length) ? (
          <div className="mt-1.5 border-l-2 border-slate-200 dark:border-slate-600 pl-3" style={{ marginLeft: INDENT_STEP }}>
            {iterations.flatMap((iter, iterIdx) => (iter.nested || []).map((nestedBlock, nestedIdx) =>
              renderNested(nestedBlock, iterIdx, nestedIdx)
            ))}
          </div>
        ) : null}
      </li>
    );
  }

  return (
    <li className="list-none -ml-6" style={style}>
      <div className="rounded-lg border border-amber-200 dark:border-amber-700/50 bg-amber-50/30 dark:bg-amber-900/10 overflow-hidden">
        <button
          type="button"
          onClick={onToggle}
          className="w-full text-left font-mono text-sm text-gray-800 dark:text-gray-200 py-2.5 px-3 hover:bg-amber-100/50 dark:hover:bg-amber-800/20 transition-colors flex items-center gap-2 flex-wrap"
          aria-label="折叠"
        >
          <span className="text-amber-500 dark:text-amber-400">▼</span>
          <span className="text-amber-700 dark:text-amber-300">for {loopEnter.iterator} in {loopEnter.iterable}</span>
          {hasBounds && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              计算得 range({loopEnter.rangeStart}, {loopEnter.rangeEnd})
            </span>
          )}
        </button>
        <div className="border-t border-amber-200 dark:border-amber-700/50 bg-white/50 dark:bg-slate-800/20 py-2.5 px-3 space-y-3">
          {varNames.map((name) => {
            const list = varLists[name] || [];
            const iterValues = varIterValues[name] || iterations.map((iter) => iter.iterValue);
            return (
              <div key={name} className="font-mono">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 flex gap-2 flex-wrap items-center">
                  {iterValues.map((v, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/50 min-w-[2.5rem] text-center">
                      {loopEnter.iterator}={formatValue(v, STEP_EMPTY)}
                    </span>
                  ))}
                </div>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-cyan-600 dark:text-cyan-400 font-medium">{name}</span>
                  <span className="text-slate-400">=</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    [
                    {list.map((v, idx) => (
                      <span key={idx}>
                        {idx ? ', ' : ''}
                        <span className="text-green-700 dark:text-green-300 font-semibold">{formatValue(v, STEP_EMPTY)}</span>
                      </span>
                    ))}
                    ]
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {iterations.some((iter) => iter.nested?.length) ? (
          <div className="border-t border-amber-200 dark:border-amber-700/50 py-2 px-3 bg-slate-50/50 dark:bg-slate-800/30" style={{ paddingLeft: 12 + INDENT_STEP, borderLeft: '2px solid rgb(203 213 225 / 0.5)' }}>
            {iterations.flatMap((iter, iterIdx) => (iter.nested || []).map((nestedBlock, nestedIdx) =>
              renderNested(nestedBlock, iterIdx, nestedIdx)
            ))}
          </div>
        ) : null}
      </div>
    </li>
  );
}

function renderStepsList(steps, returnBoxRef, collapsedLoops, setCollapsedLoops, runIdx = 0) {
  const collapsed = collapsedLoops ?? new Set();
  const setCollapsed = setCollapsedLoops ?? (() => {});
  const blocks = stepsToDisplayBlocks(steps);
  let loopBlockIndex = 0;

  const renderLoopBlock = (block, collapseKey, depth) => (
    <LoopBlockRow
      key={collapseKey}
      blockIndex={collapseKey}
      block={block}
      collapsed={collapsed.has(collapseKey)}
      onToggle={() => setCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(collapseKey)) next.delete(collapseKey);
        else next.add(collapseKey);
        return next;
      })}
      depth={depth}
      renderNested={(nestedBlock, iterIdx, nestedIdx) =>
        renderLoopBlock(nestedBlock, `${collapseKey}-${iterIdx}-${nestedIdx}`, depth + 1)
      }
    />
  );

  return (
    <ol className="list-decimal list-inside space-y-2.5 text-sm text-gray-800 dark:text-gray-200 pl-1">
      {blocks.map((b, i) => {
        if (b.type === 'assign') {
          const s = b.step;
          return (
            <li key={i} className="font-mono py-0.5 pl-1">
              <span className="text-cyan-600 dark:text-cyan-400 font-medium">{s.left}</span>
              <span className="mx-1.5 text-slate-400">=</span>
              <span className="text-slate-600 dark:text-slate-400">{s.right}</span>
              <span className="mx-1.5 text-slate-400">→</span>
              <span className="font-semibold text-green-700 dark:text-green-300">{formatValue(s.value, STEP_EMPTY)}</span>
            </li>
          );
        }
        if (b.type === 'subst') {
          const s = b.step;
          return (
            <li key={i} className="font-mono py-1 pl-3 ml-2 border-l-2 border-emerald-300/80 dark:border-emerald-600/80 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-r">
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium uppercase tracking-wide">代入</span>
              <span className="mx-1.5 text-slate-600 dark:text-slate-400">{s.expr}</span>
              <span className="text-slate-400">=</span>
              <span className="ml-1.5 font-semibold text-emerald-700 dark:text-emerald-300">{formatValue(s.value, STEP_EMPTY)}</span>
            </li>
          );
        }
        if (b.type === 'loop_block') {
          const collapseKey = `${runIdx}-${loopBlockIndex++}`;
          return <React.Fragment key={i}>{renderLoopBlock(b, collapseKey, 0)}</React.Fragment>;
        }
        if (b.type === 'loop_iter') {
          const s = b.step;
          return (
            <li key={i} className="font-mono py-1 pl-3 ml-2 border-l-2 border-amber-300/80 dark:border-amber-600/80 bg-amber-50/30 dark:bg-amber-900/10 rounded-r">
              <span className="text-amber-600 dark:text-amber-400 text-xs font-medium">遍历</span>
              <span className="mx-1.5 text-slate-600 dark:text-slate-400">{s.iterator}=</span>
              <span className="font-semibold text-amber-700 dark:text-amber-300">{formatValue(s.value, STEP_EMPTY)}</span>
            </li>
          );
        }
        if (b.type === 'return') {
          const s = b.step;
          return (
            <li key={i} ref={returnBoxRef} className="font-mono font-semibold text-purple-700 dark:text-purple-300 py-1.5 pl-1 mt-1 rounded bg-purple-50 dark:bg-purple-900/20 px-2 -ml-1">
              return {formatValue(s.value, STEP_EMPTY)}
            </li>
          );
        }
        return null;
      })}
    </ol>
  );
}

/**
 * 步骤执行可视化：展示 sorted、min、max、sum、len、float 等每一步的运算结果。
 * 若代码中有多次 print(solution(...))，则按调用次数展示多组解过程（每组：调用 1、调用 2…）。
 */
export default function StepByStepViz({ methodKey, method, getParam, getRuns, onReturnValue, returnBoxRef, scrollToRunIndex, onCenterView }) {
  const params = useMemo(() => method?.params?.filter((p) => p !== 'self') || [], [method?.params]);
  const runs = useMemo(() => (getRuns ? getRuns(methodKey) : []), [getRuns, methodKey]);
  const multiRun = runs.length > 1;
  const [collapsedLoops, setCollapsedLoops] = useState(() => new Set());
  const runBlockRefs = useRef({});

  /* eslint-disable-next-line react-hooks/exhaustive-deps -- params 已 memo */
  const singleParamValues = useMemo(() => {
    if (multiRun) return null;
    const out = {};
    for (const p of params) {
      const raw = getParam(methodKey, p) ?? '';
      if (raw && (raw.includes(',') || String(raw).trim().startsWith('['))) {
        out[p] = parseListParam(raw);
      } else {
        const n = parseNumberParam(raw);
        out[p] = n !== null ? n : (raw === '' ? undefined : raw);
      }
    }
    return out;
  }, [methodKey, params, getParam, multiRun]);

  /* eslint-disable-next-line react-hooks/exhaustive-deps -- params 已 memo */
  const singleHasParams = useMemo(() => {
    if (!singleParamValues) return false;
    const A = singleParamValues.A ?? singleParamValues[params[0]];
    return (Array.isArray(A) && A.length > 0) || params.some((p) => singleParamValues[p] !== undefined && singleParamValues[p] !== '');
  }, [singleParamValues, params]);

  const runResults = useMemo(() => {
    if (!multiRun || runs.length === 0) return [];
    return runs.map((run) => {
      const paramValues = runToParamValues(run, params);
      const scope = {};
      for (const p of params) {
        if (paramValues[p] !== undefined) scope[p] = paramValues[p];
      }
      const has = (Array.isArray(paramValues.A) && paramValues.A.length > 0) || params.some((p) => paramValues[p] !== undefined && paramValues[p] !== '');
      if (!has) return { paramValues, steps: [], returnValue: undefined };
      const { steps, returnValue } = executeStepByStep(method, scope);
      return { paramValues, steps, returnValue };
    });
  }, [multiRun, runs, method, params]);

  /* eslint-disable-next-line react-hooks/exhaustive-deps -- params 已 memo */
  const singleResult = useMemo(() => {
    if (multiRun || !singleHasParams) return { steps: [], returnValue: undefined };
    const scope = {};
    for (const p of params) {
      if (singleParamValues[p] !== undefined) scope[p] = singleParamValues[p];
    }
    return executeStepByStep(method, scope);
  }, [multiRun, singleHasParams, method, params, singleParamValues]);

  useEffect(() => {
    if (multiRun && runResults.length > 0) {
      runResults.forEach((r, i) => {
        if (onReturnValue) onReturnValue(methodKey, r.returnValue, i);
      });
    } else if (!multiRun && onReturnValue) {
      onReturnValue(methodKey, singleResult.returnValue);
    }
  }, [multiRun, methodKey, runResults, singleResult.returnValue, onReturnValue]);

  useEffect(() => {
    if (multiRun && scrollToRunIndex != null && scrollToRunIndex >= 0) {
      const el = runBlockRefs.current[scrollToRunIndex];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        if (typeof onCenterView === 'function') onCenterView(el);
      }
    }
  }, [multiRun, scrollToRunIndex, onCenterView]);

  if (multiRun) {
    if (runs.length === 0) {
      return (
        <div className="text-xs text-gray-400 dark:text-gray-500 italic py-2">
          输入参数或通过 print(solution(...)) 提供多组调用后显示步骤执行
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 pb-1.5 border-b border-slate-200 dark:border-slate-600">
          算法运算步骤（按调用分组，共 {runs.length} 组）
        </div>
        {runResults.map((runResult, idx) => (
          <div
            key={idx}
            ref={(el) => { if (el) runBlockRefs.current[idx] = el; }}
            className="rounded-xl border border-cyan-200 dark:border-cyan-700/50 bg-gradient-to-b from-cyan-50/60 to-white dark:from-cyan-900/20 dark:to-slate-900/50 p-4 shadow-sm"
          >
            <div className="text-sm font-semibold text-cyan-700 dark:text-cyan-300 mb-3 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 dark:bg-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs">
                {idx + 1}
              </span>
              调用 {idx + 1}
              {params.length > 0 && (
                <span className="font-mono font-normal text-xs text-slate-500 dark:text-slate-400 ml-1">
                  {params.map((p) => {
                    const v = runResult.paramValues[p];
                    const disp = Array.isArray(v) ? `[${v.join(',')}]` : (v ?? '');
                    return `${p}=${disp}`;
                  }).join(', ')}
                </span>
              )}
            </div>
            {runResult.steps.length === 0 ? (
              <div className="text-xs text-slate-500 dark:text-slate-400 italic">无步骤或参数无效</div>
            ) : (
              renderStepsList(runResult.steps, idx === 0 ? returnBoxRef : undefined, collapsedLoops, setCollapsedLoops, idx)
            )}
          </div>
        ))}
      </div>
    );
  }

  if (!singleHasParams) {
    return (
      <EmptyVizMessage>输入参数（如 A、K、L）后显示步骤执行</EmptyVizMessage>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 pb-1.5 border-b border-slate-200 dark:border-slate-600">
        算法运算步骤
      </div>
      {renderStepsList(singleResult.steps, returnBoxRef, collapsedLoops, setCollapsedLoops, 0)}
    </div>
  );
}
