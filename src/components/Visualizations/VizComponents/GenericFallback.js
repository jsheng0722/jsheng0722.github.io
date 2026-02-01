import React, { useMemo, useEffect } from 'react';
import { parseListParam, parseNumberParam } from './parseParams';
import EmptyVizMessage from './EmptyVizMessage';
import { executeStepByStep } from '../algorithmSteps';
import { formatValue } from './formatValue';

/**
 * 无法匹配到具体模式时的通用占位：仍执行方法并上报 return，供数据流显示。
 */
export default function GenericFallback({ methodKey, method, getParam, onReturnValue, returnBoxRef }) {
  const params = useMemo(() => method?.params?.filter((p) => p !== 'self') || [], [method?.params]);
  const paramValues = useMemo(() => {
    const out = {};
    for (const p of params) {
      const raw = getParam?.(methodKey, p) ?? '';
      if (raw && (String(raw).includes(',') || String(raw).trim().startsWith('['))) {
        out[p] = parseListParam(raw);
      } else {
        const n = parseNumberParam(raw);
        out[p] = n !== null ? n : (raw === '' ? undefined : raw);
      }
    }
    return out;
  }, [methodKey, params, getParam]);

  const hasParams = method?.body?.length > 0 && params.some((p) => paramValues[p] !== undefined && paramValues[p] !== '');
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

  if (!method?.body?.length) {
    return <EmptyVizMessage>输入参数后显示动态可视化</EmptyVizMessage>;
  }

  return (
    <div className="space-y-3">
      <EmptyVizMessage>
        当前代码结构暂无专用可视化，可尝试：单循环、双重循环或循环+判断
      </EmptyVizMessage>
      {returnValue !== undefined && returnValue !== null && (
        <div ref={returnBoxRef} className="rounded-lg border-2 border-purple-400 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-500/50 px-3 py-2">
          <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-0.5">return</div>
          <div className="font-mono text-sm text-purple-800 dark:text-purple-200">{formatValue(returnValue, '')}</div>
        </div>
      )}
    </div>
  );
}
