/**
 * 统一的值格式化，用于返回值/print 显示与步骤显示
 * @param {*} v - 任意值
 * @param {string} [emptyPlaceholder=''] - null/undefined 时的占位符（步骤用 '—'，返回值用 ''）
 */
export function formatValue(v, emptyPlaceholder = '') {
  if (v === undefined || v === null) return emptyPlaceholder;
  if (v === Infinity) return "float('inf')";
  if (v === -Infinity) return "-float('inf')";
  if (Array.isArray(v)) return `[${v.join(', ')}]`;
  return String(v);
}
