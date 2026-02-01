/**
 * 通用参数解析，供各可视化组件使用
 */

export function parseListParam(str) {
  if (!str || typeof str !== 'string') return [];
  let s = str.trim();
  if (s.startsWith('[') && s.endsWith(']')) {
    s = s.slice(1, -1).trim();
  }
  return s
    .split(/[,，\s]+/)
    .map((x) => x.trim())
    .filter(Boolean)
    // eslint-disable-next-line no-self-compare -- 用 Number.isNaN 判断 NaN，非自比较
    .map((x) => {
      const n = Number(x);
      return Number.isNaN(n) ? x : n;
    });
}

export function parseNumberParam(str) {
  if (str === '' || str == null) return null;
  const n = Number(String(str).trim());
  return Number(n) === n ? n : null;
}
