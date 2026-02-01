/**
 * 通用表达式求值器：将 Python 风格/算术表达式安全地转换为最终值。
 * 支持：数字、标识符、+ - * / % ** //、max/min、Math.*、len/sorted/sum/range、float('inf')、切片 A[i:j] 等。
 * 用于步骤可视化。
 */

// --- Tokenizer ---
const TT = {
  NUMBER: 'NUMBER',
  IDENT: 'IDENT',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  LBRACK: 'LBRACK',
  RBRACK: 'RBRACK',
  COMMA: 'COMMA',
  COLON: 'COLON',
  OP: 'OP',
  STRING: 'STRING',
  DOT: 'DOT',
  EOF: 'EOF',
};

function tokenize(expr) {
  if (expr == null || typeof expr !== 'string') return [];
  const s = expr.trim();
  if (!s) return [{ type: TT.EOF }];
  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const rest = s.slice(i);
    if (/^\s+/.test(rest)) {
      i += rest.match(/^\s+/)[0].length;
      continue;
    }
    if (/^\d+\.?\d*/.test(rest)) {
      const m = rest.match(/^\d+\.?\d*/)[0];
      tokens.push({ type: TT.NUMBER, value: m, raw: m });
      i += m.length;
      continue;
    }
    if (/^["']/.test(rest)) {
      const q = rest[0];
      let j = 1;
      while (j < rest.length && rest[j] !== q) {
        if (rest[j] === '\\') j++;
        j++;
      }
      if (j < rest.length) j++;
      tokens.push({ type: TT.STRING, value: rest.slice(1, j - 1), raw: rest.slice(0, j) });
      i += j;
      continue;
    }
    if (/^\*\*/.test(rest)) {
      tokens.push({ type: TT.OP, value: '**', raw: '**' });
      i += 2;
      continue;
    }
    if (/^\/\//.test(rest)) {
      tokens.push({ type: TT.OP, value: '//', raw: '//' });
      i += 2;
      continue;
    }
    if (/^[+\-*/%()[\],:]/.test(rest)) {
      const c = rest[0];
      if (c === '(') tokens.push({ type: TT.LPAREN, raw: c });
      else if (c === ')') tokens.push({ type: TT.RPAREN, raw: c });
      else if (c === '[') tokens.push({ type: TT.LBRACK, raw: c });
      else if (c === ']') tokens.push({ type: TT.RBRACK, raw: c });
      else if (c === ',') tokens.push({ type: TT.COMMA, raw: c });
      else if (c === ':') tokens.push({ type: TT.COLON, raw: c });
      else if (c === '.') tokens.push({ type: TT.DOT, raw: c });
      else tokens.push({ type: TT.OP, value: c, raw: c });
      i += 1;
      continue;
    }
    if (/^[a-zA-Z_]\w*/.test(rest)) {
      const m = rest.match(/^[a-zA-Z_]\w*/)[0];
      tokens.push({ type: TT.IDENT, value: m, raw: m });
      i += m.length;
      continue;
    }
    i++;
  }
  tokens.push({ type: TT.EOF });
  return tokens;
}

// --- Parser: recursive descent, outputs JS expression string using scope variable `s` ---
function Parser(tokens) {
  this.tokens = tokens;
  this.pos = 0;
}

Parser.prototype.cur = function () {
  return this.tokens[this.pos] || { type: TT.EOF };
};

Parser.prototype.advance = function () {
  if (this.pos < this.tokens.length) this.pos++;
  return this.cur();
};

Parser.prototype.expect = function (type, value) {
  const t = this.cur();
  if (value != null ? t.type === type && t.value === value : t.type === type) {
    this.advance();
    return t;
  }
  return null;
};

Parser.prototype.parse = function () {
  const js = this.parseExpression();
  if (js == null) return null;
  return js;
};

// expression = additive
Parser.prototype.parseExpression = function () {
  return this.parseAdditive();
};

// additive = multiplicative ( (+|-) multiplicative )*
Parser.prototype.parseAdditive = function () {
  let left = this.parseMultiplicative();
  if (left == null) return null;
  for (;;) {
    const op = this.cur();
    if (op.type === TT.OP && (op.value === '+' || op.value === '-')) {
      this.advance();
      const right = this.parseMultiplicative();
      if (right == null) return null;
      left = `(${left}${op.value}${right})`;
    } else break;
  }
  return left;
};

// multiplicative = unary ( (*|/|%|//) unary )*
Parser.prototype.parseMultiplicative = function () {
  let left = this.parseUnary();
  if (left == null) return null;
  for (;;) {
    const op = this.cur();
    if (op.type === TT.OP && ['*', '/', '%', '//'].includes(op.value)) {
      this.advance();
      const right = this.parseUnary();
      if (right == null) return null;
      if (op.value === '//') left = `(Math.trunc(${left}/${right}))`;
      else left = `(${left}${op.value}${right})`;
    } else break;
  }
  return left;
};

// unary = (+|-)* power
Parser.prototype.parseUnary = function () {
  let sign = 1;
  while (this.cur().type === TT.OP && (this.cur().value === '+' || this.cur().value === '-')) {
    const op = this.cur().value; // 先取当前运算符，再 advance，否则会用到下一个 token
    this.advance();
    if (op === '-') sign = -sign;
  }
  const inner = this.parsePower();
  if (inner == null) return null;
  return sign === -1 ? `(-${inner})` : inner;
};

// power = postfix ** unary | postfix
Parser.prototype.parsePower = function () {
  const base = this.parsePostfix();
  if (base == null) return null;
  if (this.expect(TT.OP, '**')) {
    const exp = this.parseUnary();
    if (exp == null) return null;
    return `(Math.pow(${base},${exp}))`;
  }
  return base;
};

// postfix = primary ( '[' subscript ']' )*
Parser.prototype.parsePostfix = function () {
  let left = this.parsePrimary();
  if (left == null) return null;
  while (this.expect(TT.LBRACK)) {
    const sub = this.parseSubscript();
    if (sub == null) return null;
    if (!this.expect(TT.RBRACK)) return null;
    if (sub.slice) {
      left = sub.end != null ? `(${left}.slice(${sub.start},${sub.end}))` : `(${left}.slice(${sub.start}))`;
    } else {
      left = `(${left}[${sub.index}])`;
    }
  }
  return left;
};

// subscript = expr | expr : expr | expr : | : expr
Parser.prototype.parseSubscript = function () {
  if (this.cur().type === TT.COLON) {
    this.advance();
    const end = this.parseExpression();
    if (end == null) return null;
    return { slice: true, start: '0', end };
  }
  const first = this.parseExpression();
  if (first == null) return null;
  if (this.cur().type !== TT.COLON) return { index: first };
  this.advance();
  if (this.cur().type === TT.RBRACK || this.cur().type === TT.EOF) {
    return { slice: true, start: first, end: undefined };
  }
  const end = this.parseExpression();
  if (end == null) return null;
  return { slice: true, start: first, end };
}

// primary = NUMBER | IDENT ( '.' IDENT )? ( '(' args ')' )? | '(' expression ')'
Parser.prototype.parsePrimary = function () {
  const t = this.cur();
  if (t.type === TT.NUMBER) {
    this.advance();
    return t.raw;
  }
  if (t.type === TT.STRING) {
    this.advance();
    const v = t.value === 'inf' ? 'Infinity' : JSON.stringify(t.value);
    return v;
  }
  if (t.type === TT.LPAREN) {
    this.advance();
    const inner = this.parseExpression();
    if (inner == null) return null;
    if (!this.expect(TT.RPAREN)) return null;
    return `(${inner})`;
  }
  // 列表字面量 [ expr, expr, ... ]，用于 return [i, j] 等
  if (t.type === TT.LBRACK) {
    this.advance();
    const arr = [];
    if (this.cur().type !== TT.RBRACK && this.cur().type !== TT.EOF) {
      for (;;) {
        const e = this.parseExpression();
        if (e == null) return null;
        arr.push(e);
        if (!this.expect(TT.COMMA)) break;
      }
    }
    if (!this.expect(TT.RBRACK)) return null;
    return '[' + arr.join(',') + ']';
  }
  if (t.type === TT.IDENT) {
    const name = t.value;
    this.advance();
    // Math.xxx(...)
    if (name === 'Math' && this.expect(TT.DOT)) {
      const method = this.cur();
      if (method.type !== TT.IDENT) return null;
      this.advance();
      if (!this.expect(TT.LPAREN)) return null;
      const args = this.parseArgs();
      if (args == null) return null;
      if (!this.expect(TT.RPAREN)) return null;
      const m = method.value;
      if (typeof Math[m] === 'function') return `(Math.${m}(${args.join(',')}))`;
      return null;
    }
    // IDENT ( args )  -> builtin or call
    if (this.cur().type === TT.LPAREN) {
      this.advance();
      const args = this.parseArgs();
      if (args == null) return null;
      if (!this.expect(TT.RPAREN)) return null;
      return this.translateCall(name, args);
    }
    return `(s["${name}"])`;
  }
  return null;
};

Parser.prototype.parseArgs = function () {
  const args = [];
  if (this.cur().type === TT.RPAREN) return args;
  for (;;) {
    const a = this.parseExpression();
    if (a == null) return null;
    args.push(a);
    if (!this.expect(TT.COMMA)) break;
  }
  return args;
};

// Python/JS builtins: max, min, len, sorted, sum, range, float, abs
Parser.prototype.translateCall = function (name, args) {
  const n = name.toLowerCase();
  if (n === 'max') {
    if (args.length >= 2) return `(Math.max(${args.join(',')}))`;
    if (args.length === 1) return args[0];
    return null;
  }
  if (n === 'min') {
    if (args.length >= 2) return `(Math.min(${args.join(',')}))`;
    if (args.length === 1) return args[0];
    return null;
  }
  if (n === 'len') {
    if (args.length !== 1) return null;
    return `((function(v){return v!=null&&(Array.isArray(v)||typeof v==="string")?v.length:undefined})(${args[0]}))`;
  }
  if (n === 'sorted') {
    if (args.length !== 1) return null;
    return `((function(v){return Array.isArray(v)?[...v].sort((a,b)=>Number(a)-Number(b)):undefined})(${args[0]}))`;
  }
  if (n === 'sum') {
    if (args.length !== 1) return null;
    return `((function(v){return Array.isArray(v)?v.reduce((a,x)=>a+Number(x),0):undefined})(${args[0]}))`;
  }
  if (n === 'range') {
    if (args.length === 1) return `(__range(0,${args[0]}))`;
    if (args.length >= 2) return `(__range(${args[0]},${args[1]}))`;
    return null;
  }
  if (n === 'float') {
    if (args.length === 1 && (args[0] === 'Infinity' || /^["']inf["']$/.test(args[0]))) return 'Infinity';
    if (args.length === 1) return `(Number(${args[0]}))`;
    return null;
  }
  if (n === 'abs') {
    if (args.length === 1) return `(Math.abs(${args[0]}))`;
    return null;
  }
  if (n === 'int') {
    if (args.length === 1) return `(Math.trunc(Number(${args[0]})))`;
    return null;
  }
  return null;
};

/** Python-style range: [start, start+1, ..., end-1] */
function __range(start, end) {
  const a = Math.trunc(Number(start));
  const b = Math.trunc(Number(end));
  if (Number.isNaN(a) || Number.isNaN(b)) return [];
  const out = [];
  for (let i = a; i < b; i++) out.push(i);
  return out;
}

/**
 * 通用表达式求值：将表达式翻译为 JS 后在受控作用域中执行。
 * @param {string} expr - 表达式字符串
 * @param {Object} scope - 变量表 { A: [], K: 3, L: 2, i: 1, ... }
 * @returns {*} 求值结果，无法求值时返回 undefined
 */
function evaluateWithParser(expr, scope) {
  if (expr == null || typeof expr !== 'string') return undefined;
  const e = expr.trim();
  if (!e) return undefined;
  const tokens = tokenize(e);
  const parser = new Parser(tokens);
  const js = parser.parse();
  if (js == null) return undefined;
  try {
    // 表达式求值：将解析后的 JS 片段在受限 scope 中执行，仅用于可视化计算
    // eslint-disable-next-line no-new-func -- 有意使用，仅用于可视化表达式求值
    const fn = new Function(
      's',
      '__range',
      '"use strict"; return (' + js + ');'
    );
    const result = fn(scope || {}, __range);
    return result;
  } catch {
    return undefined;
  }
}

/**
 * 对表达式的安全求值（通用方案）：支持数字、算术、max/min、Math.*、len/sorted/sum/range、切片等。
 * @param {string} expr - 表达式字符串
 * @param {Object} scope - 变量表
 * @returns {*} 求值结果
 */
export function evaluateExpression(expr, scope) {
  return evaluateWithParser(expr, scope);
}

export default evaluateExpression;