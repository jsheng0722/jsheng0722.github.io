function getIndent(line) {
  const m = line.match(/^(\s*)/);
  return m ? m[1].length : 0;
}

function trimLine(s) {
  return s.replace(/#.*$/, '').trim();
}

/** 视为内置/基础函数，不要求用户在代码中定义，也不对其报「未在代码中定义」 */
const BUILTIN_NAMES = new Set(['print']);

function parseDefOrClass(line) {
  const trimmed = trimLine(line);
  const classMatch = trimmed.match(/^class\s+(\w+)\s*(?:\((.*?)\))?\s*:?/);
  if (classMatch) return { type: 'class', name: classMatch[1], params: [] };
  const defMatch = trimmed.match(/^def\s+(\w+)\s*\((.*?)\)\s*:?/);
  if (defMatch) {
    const paramsStr = defMatch[2].trim();
    const params = paramsStr ? paramsStr.split(',').map((p) => p.trim().split('=')[0].trim()).filter(Boolean) : [];
    return { type: 'def', name: defMatch[1], params };
  }
  return null;
}

function parseBodyLine(line) {
  const trimmed = trimLine(line);
  if (!trimmed) return null;
  if (/^for\s+.+\s+in\s+.+:\s*$/.test(trimmed) || trimmed.startsWith('for ')) {
    const m = trimmed.match(/for\s+(.+?)\s+in\s+(.+?)\s*:?\s*$/);
    return { type: 'loop', kind: 'for', iterator: m ? m[1].trim() : '', iterable: m ? m[2].trim() : trimmed.replace(/^for\s+/, ''), raw: trimmed };
  }
  if (/^while\s+.+:\s*$/.test(trimmed) || trimmed.startsWith('while ')) {
    const cond = trimmed.replace(/^while\s+/, '').replace(/\s*:?\s*$/, '').trim();
    return { type: 'loop', kind: 'while', condition: cond, raw: trimmed };
  }
  if (/^\w+\s*=/.test(trimmed)) {
    const idx = trimmed.indexOf('=');
    return { type: 'assignment', left: trimmed.slice(0, idx).trim(), right: trimmed.slice(idx + 1).trim(), raw: trimmed };
  }
  if (/^if\s+/.test(trimmed)) {
    const cond = trimmed.replace(/^if\s+/, '').replace(/\s*:?\s*$/, '').trim();
    return { type: 'condition', kind: 'if', condition: cond, raw: trimmed };
  }
  if (/^elif\s+/.test(trimmed)) {
    const cond = trimmed.replace(/^elif\s+/, '').replace(/\s*:?\s*$/, '').trim();
    return { type: 'condition', kind: 'elif', condition: cond, raw: trimmed };
  }
  if (/^else\s*:?\s*$/.test(trimmed)) return { type: 'condition', kind: 'else', raw: trimmed };
  if (/^return\s+/.test(trimmed)) {
    return { type: 'return', value: trimmed.replace(/^return\s+/, '').trim(), raw: trimmed };
  }
  return { type: 'statement', raw: trimmed };
}

function parseCallOnLine(trimmed) {
  const match = trimmed.match(/^\s*(\w+)\s*\((.*)\)\s*$/s);
  if (!match) return null;
  const name = match[1];
  const argsStr = match[2].trim();
  if (!argsStr) return { name, args: [] };
  const args = [];
  let parenDepth = 0;
  let bracketDepth = 0;
  let start = 0;
  for (let i = 0; i < argsStr.length; i++) {
    const c = argsStr[i];
    if (c === '(') parenDepth++;
    else if (c === ')') parenDepth--;
    else if (c === '[') bracketDepth++;
    else if (c === ']') bracketDepth--;
    else if ((c === ',' && parenDepth === 0 && bracketDepth === 0) || i === argsStr.length - 1) {
      const end = c === ',' ? i : i + 1;
      args.push(argsStr.slice(start, end).trim());
      start = i + 1;
    }
  }
  if (parenDepth === 0 && start < argsStr.length) args.push(argsStr.slice(start).trim());
  return { name, args };
}

function isSingleFunctionCall(arg) {
  const t = arg.trim();
  const openIdx = t.indexOf('(');
  if (openIdx === -1) return false;
  if (!/^\w+\s*\(/.test(t.slice(0, openIdx + 1))) return false;
  let depth = 1;
  for (let i = openIdx + 1; i < t.length; i++) {
    if (t[i] === '(') depth++;
    else if (t[i] === ')') {
      depth--;
      if (depth === 0) return i === t.length - 1 || /^\s*$/.test(t.slice(i + 1));
    }
  }
  return false;
}

function resolveMethodFromStructure(structure, name) {
  for (const cls of structure.classes || []) {
    if (cls.methods.some((m) => m.name === name)) return { class: cls.name, method: name };
  }
  for (const fn of structure.functions || []) {
    if (fn.name === name) return { class: null, method: name };
  }
  return null;
}

function argToInputValue(argStr) {
  if (!argStr || typeof argStr !== 'string') return '';
  const t = argStr.trim();
  const m = t.match(/^\s*\[\s*(.*)\s*\]\s*$/s);
  if (m) return m[1].trim().replace(/\s+/g, '');
  return t;
}

function collectCallsInOrder(trimmed) {
  const call = parseCallOnLine(trimmed);
  if (!call) return [];
  const result = [];
  for (const arg of call.args) {
    if (isSingleFunctionCall(arg)) result.push(...collectCallsInOrder(arg));
  }
  result.push({ name: call.name, args: call.args });
  return result;
}

function parseCallStack(code, structure) {
  const stack = [];
  if (!code || !structure || (!structure.classes?.length && !structure.functions?.length)) return stack;
  const lines = code.split('\n');
  for (const line of lines) {
    const trimmed = trimLine(line);
    const calls = collectCallsInOrder(trimmed);
    for (const { name, args } of calls) {
      const resolved = resolveMethodFromStructure(structure, name);
      if (!resolved) continue;
      const methodKey = resolved.class ? `${resolved.class}.${resolved.method}` : `fn.${resolved.method}`;
      const cls = structure.classes?.find((c) => c.name === resolved.class);
      const fn = structure.functions?.find((f) => f.name === resolved.method);
      const method = cls?.methods?.find((m) => m.name === resolved.method) || (fn ? { params: fn.params } : null);
      if (!method?.params) continue;
      const paramNames = method.params.filter((p) => p !== 'self');
      const paramValues = {};
      paramNames.forEach((paramName, i) => {
        if (args[i] !== undefined && !isSingleFunctionCall(args[i])) {
          paramValues[paramName] = argToInputValue(args[i]);
        }
      });
      stack.push({ methodKey, paramValues });
    }
  }
  return stack;
}

/** 每个 methodKey 对应一次或多次调用的参数列表，按代码中调用顺序 */
function buildCallSiteArgsFromStack(stack) {
  const callSiteArgs = {};
  for (const { methodKey, paramValues } of stack) {
    if (!callSiteArgs[methodKey]) callSiteArgs[methodKey] = [];
    callSiteArgs[methodKey].push(paramValues);
  }
  return callSiteArgs;
}

function parseDataFlow(code, structure) {
  const dataFlow = [];
  const lines = code.split('\n');
  const dataFlowWarnings = [];
  for (const line of lines) {
    const trimmed = trimLine(line);
    const call = parseCallOnLine(trimmed);
    if (!call) continue;
    const toTarget = resolveMethodFromStructure(structure, call.name);
    call.args.forEach((arg, toParamIndex) => {
      if (!isSingleFunctionCall(arg)) return;
      const inner = parseCallOnLine(arg);
      if (!inner) return;
      const fromTarget = resolveMethodFromStructure(structure, inner.name);
      if (toTarget && fromTarget) {
        dataFlow.push({
          from: { class: fromTarget.class, method: fromTarget.method },
          to: { class: toTarget.class, method: toTarget.method },
          toParamIndex,
        });
        return;
      }
      if (!toTarget && !BUILTIN_NAMES.has(call.name)) dataFlowWarnings.push({ type: 'target_not_found', callName: call.name });
      if (!fromTarget) dataFlowWarnings.push({ type: 'source_not_found', callName: inner.name, usedAsArgOf: call.name, toParamIndex });
    });
  }
  return { dataFlow, dataFlowWarnings };
}

/**
 * 解析顶层 print(fn(...)) 调用：用于在界面显示「print 输出」= fn 的返回值
 */
function parseTopLevelPrintCalls(code, structure) {
  const out = [];
  if (!code || !structure) return out;
  const lines = code.split('\n');
  for (const line of lines) {
    if (getIndent(line) !== 0) continue;
    const trimmed = trimLine(line);
    if (!trimmed) continue;
    if (/^\s*def\s+/.test(trimmed) || /^\s*class\s+/.test(trimmed)) continue;
    const call = parseCallOnLine(trimmed);
    if (!call || call.name !== 'print' || call.args.length !== 1) continue;
    if (!isSingleFunctionCall(call.args[0])) continue;
    const inner = parseCallOnLine(call.args[0]);
    if (!inner) continue;
    const resolved = resolveMethodFromStructure(structure, inner.name);
    if (!resolved) continue;
    const methodKey = resolved.class ? `${resolved.class}.${resolved.method}` : `fn.${resolved.method}`;
    out.push({ methodKey, callText: trimmed, callIndex: out.length });
  }
  return out;
}

function splitTopLevelCommas(s) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === ',' && depth === 0) {
      parts.push(s.slice(start, i).trim());
      start = i + 1;
    }
  }
  if (start < s.length) parts.push(s.slice(start).trim());
  return parts;
}

export function parsePrintExpressions(body) {
  if (!body || !Array.isArray(body)) return [];
  const line = body.find((b) => b && b.raw && /print\s*\(/.test(b.raw));
  if (!line || !line.raw) return [];
  const m = line.raw.match(/print\s*\((.*)\)\s*$/s);
  if (!m) return [];
  const inner = m[1].trim();
  if (!inner) return [];
  const parts = splitTopLevelCommas(inner);
  const result = [];
  for (const p of parts) {
    const t = p.trim();
    const indexed = t.match(/^(\w+)\s*\[\s*(\d+)\s*\]$/);
    if (indexed) result.push({ param: indexed[1], index: parseInt(indexed[2], 10) });
    else if (/^\w+$/.test(t)) result.push({ param: t });
    else result.push({ param: null, raw: t });
  }
  return result;
}

export function parseCodeStructure(code) {
  if (!code || typeof code !== 'string') {
    return { classes: [], functions: [], dataFlow: [], dataFlowWarnings: [], callSiteArgs: {}, topLevelPrintCalls: [], callTree: [] };
  }
  const lines = code.split('\n');
  const result = { classes: [], functions: [] };
  let i = 0;
  const baseIndent = 0;
  while (i < lines.length) {
    const line = lines[i];
    const indent = getIndent(line);
    const parsed = parseDefOrClass(line);
    if (parsed && indent === baseIndent) {
      if (parsed.type === 'class') {
        const cls = { name: parsed.name, methods: [], indent };
        i++;
        while (i < lines.length && getIndent(lines[i]) > indent) {
          const defLine = lines[i];
          const defIndent = getIndent(defLine);
          const defParsed = parseDefOrClass(defLine);
          if (defParsed && defParsed.type === 'def' && defIndent > indent) {
            const method = { name: defParsed.name, params: defParsed.params, body: [] };
            i++;
            while (i < lines.length && getIndent(lines[i]) > defIndent) {
              const bodyItem = parseBodyLine(lines[i]);
              if (bodyItem) method.body.push({ ...bodyItem, indent: getIndent(lines[i]) });
              i++;
            }
            cls.methods.push(method);
          } else i++;
        }
        result.classes.push(cls);
      } else if (parsed.type === 'def') {
        const fn = { name: parsed.name, params: parsed.params, body: [] };
        i++;
        while (i < lines.length && getIndent(lines[i]) > indent) {
          const bodyItem = parseBodyLine(lines[i]);
          if (bodyItem) fn.body.push({ ...bodyItem, indent: getIndent(lines[i]) });
          i++;
        }
        result.functions.push(fn);
      } else i++;
    } else i++;
  }
  const { dataFlow, dataFlowWarnings } = parseDataFlow(code, result);
  result.dataFlow = dataFlow;
  result.dataFlowWarnings = dataFlowWarnings || [];
  const callStack = parseCallStack(code, result);
  result.callSiteArgs = buildCallSiteArgsFromStack(callStack);
  result.topLevelPrintCalls = parseTopLevelPrintCalls(code, result);
  result.callTree = buildCallTreeFromCode(code, result);
  return result;
}

/**
 * 从「调用关系」构建树：例如 print(solution(...)) → print 下挂 solution，文件系统式层次
 * 只解析代码中的「调用表达式」，不按 def 列函数。
 * 返回 [ { key, name, displayName, scrollKey?, children: [] } ]，scrollKey 为代码中定义的函数时用于定位 def
 */
function buildCallTreeFromCode(code, structure) {
  const roots = [];
  if (!code || typeof code !== 'string') return roots;

  const getScrollKey = (name) => {
    if (!structure) return null;
    const r = resolveMethodFromStructure(structure, name);
    if (!r) return null;
    return r.class ? `${r.class}.${r.method}` : `fn.${r.method}`;
  };

  let nodeId = 0;
  /** rootIndex: 顶层调用的先后顺序（第几条语句），用于区分多次同名调用 */
  function buildNodeFromCall(call, pathPrefix, rootIndex) {
    const id = nodeId++;
    const key = pathPrefix ? `${pathPrefix}-${call.name}` : `call-${id}-${call.name}`;
    const scrollKey = getScrollKey(call.name);
    const children = [];
    for (const arg of call.args || []) {
      if (isSingleFunctionCall(arg)) {
        const inner = parseCallOnLine(arg);
        if (inner) children.push(buildNodeFromCall(inner, key, rootIndex));
      }
    }
    const displayName = rootIndex !== undefined && scrollKey
      ? `${call.name} (${rootIndex + 1})`
      : call.name;
    return {
      key,
      name: call.name,
      displayName,
      scrollKey: scrollKey || undefined,
      callIndex: rootIndex,
      children,
    };
  }

  const lines = code.split('\n');
  /** 按「第几次顶层调用」计数，而不是文件行号，这样第一个调用显示 (1)、第二个 (2)… */
  let rootIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (getIndent(lines[i]) !== 0) continue;
    const trimmed = trimLine(lines[i]);
    if (!trimmed) continue;
    const call = parseCallOnLine(trimmed);
    if (!call) continue;
    roots.push(buildNodeFromCall(call, '', rootIndex));
    rootIndex++;
  }

  return roots;
}
