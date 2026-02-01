import React, { useMemo, useEffect } from 'react';
import { parseListParam, parseNumberParam } from './parseParams';
import EmptyVizMessage from './EmptyVizMessage';
import ListItemCard from './ListItemCard';
import { executeStepByStep } from '../algorithmSteps';

/**
 * 双重循环通用可视化：两个 for，展示列表与 (i, j) 索引对。
 * 执行方法并上报返回值，供「内层先算、再赋给外层」如 printS(twoSum(...)) 的数据流显示。
 */
export default function DoubleLoopViz({ methodKey, method, getParam, patternInfo, onReturnValue, returnBoxRef }) {
  const params = useMemo(() => method?.params?.filter((p) => p !== 'self') || [], [method?.params]);
  const loops = patternInfo?.loops || [];
  const outer = loops[0];
  const inner = loops[1];
  const iterable = (outer?.iterable || '').trim();
  const listParamName = (() => {
    if (!iterable) return params[0] || 'arr';
    const m = iterable.match(/range\s*\(\s*len\s*\(\s*(\w+)\s*\)\s*\)/);
    if (m) return m[1];
    return iterable.split(/[\s(]+/).filter(Boolean)[0] || params[0] || 'arr';
  })();
  const listStr = getParam(methodKey, listParamName) || getParam(methodKey, params[0]) || '';
  const list = useMemo(() => parseListParam(listStr), [listStr]);

  const paramValues = useMemo(() => {
    const out = {};
    for (const p of params) {
      const raw = getParam(methodKey, p) ?? '';
      if (raw && (String(raw).includes(',') || String(raw).trim().startsWith('['))) {
        out[p] = parseListParam(raw);
      } else {
        const n = parseNumberParam(raw);
        out[p] = n !== null ? n : (raw === '' ? undefined : raw);
      }
    }
    return out;
  }, [methodKey, params, getParam]);

  const hasParams = list.length > 0 || params.some((p) => paramValues[p] !== undefined && paramValues[p] !== '');
  const { returnValue } = useMemo(() => {
    if (!hasParams || !method) return { returnValue: undefined };
    const scope = {};
    for (const p of params) {
      if (paramValues[p] !== undefined) scope[p] = paramValues[p];
    }
    return executeStepByStep(method, scope);
  }, [hasParams, method, params, paramValues]);

  useEffect(() => {
    if (onReturnValue && hasParams) onReturnValue(methodKey, returnValue != null ? returnValue : undefined);
  }, [methodKey, onReturnValue, hasParams, returnValue]);

  const iName = outer?.iterator || 'i';
  const jName = inner?.iterator || 'j';

  if (list.length === 0 && !listStr.trim()) {
    return <EmptyVizMessage>输入列表参数后显示双重循环可视化</EmptyVizMessage>;
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
          for {iName}, for {jName}（双重循环）
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {list.map((val, idx) => (
            <ListItemCard key={idx} indexLabel={`${iName}=${idx}`} value={val} />
          ))}
        </div>
        <div className="text-[10px] text-gray-500 dark:text-gray-400">
          索引对 ({iName}, {jName}) 范围: [0, {list.length}) × [0, {list.length})
        </div>
      </div>
      {returnValue !== undefined && returnValue !== null && (
        <div ref={returnBoxRef} className="rounded-lg border-2 border-purple-400 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-500/50 px-3 py-2">
          <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-0.5">return</div>
          <div className="font-mono text-sm text-purple-800 dark:text-purple-200">
            {Array.isArray(returnValue) ? `[${returnValue.join(', ')}]` : String(returnValue)}
          </div>
        </div>
      )}
    </div>
  );
}
