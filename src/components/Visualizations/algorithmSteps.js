/**
 * 按步骤执行方法体（赋值、循环、return），用于步骤可视化。
 * 内层 range 若求值失败则用 JS 直接计算；记录每次循环迭代的值变更。
 */

import { evaluateExpression } from './expressionEvaluator';

/**
 * 去掉字符串中所有空白，便于正则匹配（代码里可能有空格）
 */
function stripSpaces(s) {
  return (s || '').replace(/\s/g, '');
}

/**
 * 从 range(...) 表达式中解析出两个参数（保留原表达式，用于代入步骤展示）
 */
function parseRangeArgs(iterableExpr) {
  const s = (iterableExpr || '').trim();
  const rangeMatch = s.match(/range\s*\(\s*(.+)\s*,\s*(.+)\s*\)/);
  if (!rangeMatch) return null;
  return { arg1: rangeMatch[1].trim(), arg2: rangeMatch[2].trim() };
}

/**
 * 用 scope 在 JS 中直接计算 range，不依赖表达式求值。
 * 支持：range(1, minV+1)、range(-(K+L-1-i),-max(K,L)+i+1)。
 * 正则未匹配时用 evaluateExpression 兜底，确保 max 等被正确计算。
 * 返回 { values, rangeStart, rangeEnd, arg1, arg2 } 以便先代入再循环。
 */
function computeRangeInScope(iterableExpr, scope) {
  const parsed = parseRangeArgs(iterableExpr);
  if (!parsed) return undefined;
  const { arg1, arg2 } = parsed;
  const a1 = stripSpaces(arg1);
  const a2 = stripSpaces(arg2);

  let start, end;

  // -(X+Y-1-Z) 形式，如 -(K+L-1-i)
  const negLinear = a1.match(/^-\((\w+)\+(\w+)-1-(\w+)\)$/);
  if (negLinear) {
    const va = Number(scope[negLinear[1]]);
    const vb = Number(scope[negLinear[2]]);
    const vc = Number(scope[negLinear[3]]);
    if (Number.isFinite(va) && Number.isFinite(vb) && Number.isFinite(vc)) {
      start = -(va + vb - 1 - vc);
    }
  }
  if (start == null) {
    const v = evaluateExpression(arg1, scope);
    if (v != null && Number.isFinite(Number(v))) start = Number(v);
  }

  // -max(X,Y)+Z+1 形式，如 -max(K,L)+i+1（无空格 strip 后）
  const maxPlus = a2.match(/^-max\((\w+),(\w+)\)\+(\w+)\+1$/);
  if (maxPlus) {
    const mx = Math.max(Number(scope[maxPlus[1]]), Number(scope[maxPlus[2]]));
    const vi = Number(scope[maxPlus[3]]);
    if (Number.isFinite(mx) && Number.isFinite(vi)) {
      end = -mx + vi + 1;
    }
  }
  if (end == null) {
    const v = evaluateExpression(arg2, scope);
    if (v != null && Number.isFinite(Number(v))) end = Number(v);
  }

  if (start != null && end != null) {
    const startInt = Math.trunc(start);
    const endInt = Math.trunc(end);
    const out = [];
    for (let i = startInt; i < endInt; i++) out.push(i);
    return { values: out, rangeStart: start, rangeEnd: end, arg1, arg2 };
  }

  // range(1, minV+1) 等形式
  if (/^\d+$/.test(a1) && /\w+\+1$/.test(a2)) {
    const a = parseInt(a1, 10);
    const bVar = a2.replace(/\+1$/, '');
    const bVal = scope[bVar];
    if (bVal != null && Number.isFinite(Number(bVal))) {
      end = Number(bVal) + 1;
      const out = [];
      for (let i = a; i < end; i++) out.push(i);
      return { values: out, rangeStart: a, rangeEnd: end, arg1, arg2 };
    }
  }

  return undefined;
}

/** Python 语义：range(start, end) 为 [start, end)，用 start/end 生成迭代数组，避免求值误差导致多一项 */
function rangeValuesFromBounds(rangeStart, rangeEnd) {
  if (rangeStart == null || rangeEnd == null) return null;
  const a = Math.trunc(Number(rangeStart));
  const b = Math.trunc(Number(rangeEnd));
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  const out = [];
  for (let i = a; i < b; i++) out.push(i);
  return out;
}

function getMinIndent(body) {
  let min = Infinity;
  for (const b of body || []) {
    const ind = b.indent;
    if (typeof ind === 'number' && ind < min) min = ind;
  }
  return min === Infinity ? 0 : min;
}

/**
 * 从 startIndex 起找到“比 baseIndent 大”的块的结束位置：
 * 第一个 indent <= baseIndent 的行的索引（即循环体的下界，不包含该行）
 */
function findBlockEnd(body, startIndex, baseIndent) {
  for (let i = startIndex; i < body.length; i++) {
    const ind = body[i].indent;
    if (typeof ind === 'number' && ind <= baseIndent) return i;
  }
  return body.length;
}

/** 取出一段 body 中缩进严格大于 baseIndent 的连续行（作为某循环的 body） */
function getLoopBody(body, startIndex, loopIndent) {
  const end = findBlockEnd(body, startIndex, loopIndent);
  const slice = body.slice(startIndex, end);
  return slice.filter((l) => (typeof l.indent === 'number' ? l.indent > loopIndent : false));
}

/** if/elif/else 整条链的结束位置（下一行索引），用于执行完一个分支后跳过其余分支 */
function findConditionChainEnd(body, startIndex, chainIndent, endIndex) {
  let idx = startIndex;
  while (idx < endIndex) {
    const line = body[idx];
    if (typeof line.indent === 'number' && line.indent < chainIndent) return idx;
    if (line.type !== 'condition' || !['if', 'elif', 'else'].includes(line.kind) || line.indent !== chainIndent) return idx;
    idx = findBlockEnd(body, idx + 1, chainIndent);
  }
  return idx;
}

/**
 * 执行一段 body 行（同一缩进级别），更新 scope 并收集 steps
 */
function executeBlock(body, startIndex, endIndex, scope, steps, baseIndent) {
  for (let i = startIndex; i < endIndex; i++) {
    const line = body[i];
    const ind = line.indent;
    if (typeof ind === 'number' && ind < baseIndent) continue;
    if (typeof ind === 'number' && ind > baseIndent) continue; // 由内层循环处理

    if (line.type === 'assignment') {
      const left = line.left?.trim();
      const right = line.right?.trim();
      if (!left) continue;
      const value = evaluateExpression(right, scope);
      scope[left] = value;
      steps.push({ type: 'assign', left, right, value, raw: line.raw });
      continue;
    }

    if (line.type === 'return') {
      const value = evaluateExpression(line.value || '', scope);
      steps.push({ type: 'return', value, raw: line.raw });
      return { done: true, returnValue: value };
    }

    if (line.type === 'condition' && (line.kind === 'if' || line.kind === 'elif' || line.kind === 'else')) {
      const chainIndent = ind;
      let idx = i;
      while (idx < endIndex) {
        const condLine = body[idx];
        if (condLine.type !== 'condition' || !['if', 'elif', 'else'].includes(condLine.kind) || condLine.indent !== chainIndent) break;
        const blockStart = idx + 1;
        const blockEnd = findBlockEnd(body, blockStart, chainIndent);
        const blockBody = getLoopBody(body, blockStart, chainIndent);
        let runBlock = false;
        if (condLine.kind === 'if' || condLine.kind === 'elif') {
          const condVal = evaluateExpression(condLine.condition || '', scope);
          runBlock = condVal != null && condVal !== false && condVal !== 0 && condVal !== '';
        } else {
          runBlock = true;
        }
        if (runBlock) {
          const nextIndent = blockBody[0]?.indent ?? chainIndent + 1;
          const result = executeBlock(blockBody, 0, blockBody.length, scope, steps, nextIndent);
          if (result?.done) return result;
          i = findConditionChainEnd(body, i, chainIndent, endIndex) - 1;
          break;
        }
        idx = blockEnd;
      }
      continue;
    }

    if (line.type === 'loop' && line.kind === 'for') {
      const iterableExpr = (line.iterable || '').trim();
      const iterator = (line.iterator || '').trim();
      const parsed = parseRangeArgs(iterableExpr);
      let rangeArr;
      let rangeStart, rangeEnd;
      if (parsed) {
        const computed = computeRangeInScope(iterableExpr, scope);
        if (computed && Array.isArray(computed.values) && computed.values.length >= 0) {
          rangeStart = computed.rangeStart;
          rangeEnd = computed.rangeEnd;
          steps.push({ type: 'subst', expr: parsed.arg1, value: rangeStart, raw: line.raw });
          steps.push({ type: 'subst', expr: parsed.arg2, value: rangeEnd, raw: line.raw });
        } else {
          const val1 = evaluateExpression(parsed.arg1, scope);
          const val2 = evaluateExpression(parsed.arg2, scope);
          if (val1 != null) rangeStart = Number(val1);
          if (val2 != null) rangeEnd = Number(val2);
          if (rangeStart != null) steps.push({ type: 'subst', expr: parsed.arg1, value: rangeStart, raw: line.raw });
          if (rangeEnd != null) steps.push({ type: 'subst', expr: parsed.arg2, value: rangeEnd, raw: line.raw });
        }
        // 有 rangeStart/rangeEnd 时一律用其生成迭代数组（Python 左闭右开），避免 computed/求值多出一项
        if (rangeStart != null && rangeEnd != null) {
          const normalized = rangeValuesFromBounds(rangeStart, rangeEnd);
          if (normalized) rangeArr = normalized;
          else rangeArr = evaluateExpression(iterableExpr, scope);
        } else {
          rangeArr = evaluateExpression(iterableExpr, scope);
        }
      } else {
        rangeArr = evaluateExpression(iterableExpr, scope);
      }
      if (!Array.isArray(rangeArr)) {
        steps.push({ type: 'loop_enter', iterator, iterable: iterableExpr, values: [], raw: line.raw });
        continue;
      }
      steps.push({
        type: 'loop_enter',
        iterator,
        iterable: iterableExpr,
        values: rangeArr,
        rangeStart,
        rangeEnd,
        raw: line.raw,
      });
      const bodyStart = i + 1;
      const loopBody = getLoopBody(body, bodyStart, ind);
      const nextIndent = loopBody[0]?.indent ?? ind + 1;

      for (const v of rangeArr) {
        scope[iterator] = v;
        steps.push({ type: 'loop_iter', iterator, value: v, raw: line.raw });
        const result = executeBlock(loopBody, 0, loopBody.length, scope, steps, nextIndent);
        if (result?.done) return result;
      }
      const bodyEnd = findBlockEnd(body, bodyStart, ind);
      i = bodyEnd - 1;
    }
  }
  return { done: false };
}

/**
 * 从初始参数执行方法体，收集每一步
 * @param {Object} method - { body, params }
 * @param {Object} paramValues - 参数名 -> 值，如 { A: [1,3,-4,2,-1], K: 3, L: 2 }
 * @returns {{ steps: Array, returnValue: * }}
 */
export function executeStepByStep(method, paramValues) {
  const steps = [];
  const scope = { ...paramValues };
  const body = method?.body || [];
  const baseIndent = getMinIndent(body);

  const result = executeBlock(body, 0, body.length, scope, steps, baseIndent);
  return { steps, returnValue: result?.returnValue };
}

export default executeStepByStep;
