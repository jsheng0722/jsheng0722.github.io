/**
 * 根据方法体（body）检测算法模式，用于选择对应的通用可视化组件。
 * 支持：单循环、双重循环、循环+判断等。
 */

const MIN_INDENT = 0;

/**
 * 从 body 中按缩进提取循环与条件
 * @param {Array} body - method.body，每项含 type, kind, indent 等
 * @returns {{ loops: Array, conditions: Array }}
 */
function extractLoopsAndConditions(body) {
  const loops = [];
  const conditions = [];
  if (!Array.isArray(body)) return { loops, conditions };
  body.forEach((b) => {
    if (b.type === 'loop') {
      loops.push({
        kind: b.kind,
        iterator: b.iterator || '',
        iterable: b.iterable || '',
        condition: b.condition,
        indent: typeof b.indent === 'number' ? b.indent : MIN_INDENT,
        raw: b.raw,
      });
    } else if (b.type === 'condition' && (b.kind === 'if' || b.kind === 'elif' || b.kind === 'else')) {
      conditions.push({
        kind: b.kind,
        condition: b.condition || '',
        indent: typeof b.indent === 'number' ? b.indent : MIN_INDENT,
        raw: b.raw,
      });
    }
  });
  return { loops, conditions };
}

/**
 * 判断是否为嵌套：内层循环的缩进必须大于外层
 */
function isNestedDoubleLoop(loops) {
  if (loops.length < 2) return false;
  return loops[1].indent > loops[0].indent;
}

/**
 * 检测算法模式
 * @param {Array} body - method.body
 * @param {Array} params - method.params（可选，用于变量名推断）
 * @returns {{ pattern: string, loops: Array, conditions: Array }}
 */
export function detectAlgorithmPattern(body, params = []) {
  const { loops, conditions } = extractLoopsAndConditions(body || []);

  // 1. 步骤执行：赋值中使用了 sorted/min/max/sum/len/float 等，可逐步展示运算
  const hasAssignWithBuiltin = (body || []).some(
    (b) => b.type === 'assignment' && b.right && /sorted|min|max|sum|len|float/.test(b.right)
  );
  if (hasAssignWithBuiltin) {
    return { pattern: 'step_execution', loops, conditions };
  }

  // 2. 双重循环（嵌套）：两个 for，内层缩进大于外层
  if (loops.length >= 2 && isNestedDoubleLoop(loops)) {
    return { pattern: 'double_loop', loops, conditions };
  }

  // 3. 单循环 + 判断
  if (loops.length >= 1 && conditions.length >= 1) {
    return { pattern: 'loop_with_condition', loops, conditions };
  }

  // 5. 单循环
  if (loops.length === 1) {
    return { pattern: 'single_loop', loops, conditions };
  }

  // 6. 仅条件（无循环）
  if (conditions.length >= 1) {
    return { pattern: 'condition_only', loops, conditions };
  }

  return { pattern: 'generic', loops, conditions };
}

export default detectAlgorithmPattern;
