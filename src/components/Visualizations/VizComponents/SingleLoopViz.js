import React, { useMemo, useEffect } from 'react';
import { parseListParam, parseNumberParam } from './parseParams';
import EmptyVizMessage from './EmptyVizMessage';
import ListItemCard from './ListItemCard';
import { executeStepByStep } from '../algorithmSteps';
import { formatValue } from './formatValue';

/**
 * 单循环通用可视化：一个 for 遍历列表，展示索引与值；执行并上报 return。
 */
export default function SingleLoopViz({ methodKey, method, getParam, patternInfo, onReturnValue, returnBoxRef }) {
  const params = useMemo(() => method?.params?.filter((p) => p !== 'self') || [], [method?.params]);
  const firstLoop = (patternInfo?.loops || [])[0];
  const iterable = (firstLoop?.iterable || '').trim();
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

  if (list.length === 0 && !listStr.trim()) {
    return <EmptyVizMessage>输入列表参数后显示单循环可视化</EmptyVizMessage>;
  }

  const iteratorName = firstLoop?.iterator || 'i';

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
          for {iteratorName} in {listParamName}
        </div>
        <div className="flex flex-wrap gap-2">
          {list.map((val, idx) => (
            <ListItemCard key={idx} indexLabel={`${iteratorName}=${idx}`} value={val} />
          ))}
        </div>
      </div>
      {returnValue !== undefined && returnValue !== null && (
        <div ref={returnBoxRef} className="rounded-lg border-2 border-purple-400 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-500/50 px-3 py-2">
          <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-0.5">return</div>
          <div className="font-mono text-sm text-purple-800 dark:text-purple-200">{formatValue(returnValue, '')}</div>
        </div>
      )}
    </div>
  );
}
