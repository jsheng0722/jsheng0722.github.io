/**
 * 语言检测器
 * 从代码内容自动识别编程语言类型
 */

/**
 * 从代码内容自动检测编程语言
 * @param {string} code - 代码内容
 * @param {string} fallbackLanguage - 如果无法检测，使用的默认语言
 * @returns {string} 检测到的语言类型 ('python' 或 'javascript')
 */
export function detectLanguageFromCode(code, fallbackLanguage = 'javascript') {
  if (!code || typeof code !== 'string') {
    return fallbackLanguage;
  }

  const trimmedCode = code.trim();
  if (!trimmedCode) {
    return fallbackLanguage;
  }

  // Python 特征检测
  const pythonIndicators = [
    /^def\s+\w+\s*\(/,           // def function(
    /^class\s+\w+\s*\([^)]*\)\s*:/,  // class X(object):
    /\brange\s*\(/,              // range(
    /\blen\s*\(/,                // len(
    /:\s*$/,                     // 行尾冒号（Python 语法）
    /^\s+if\s+.*:\s*$/,          // if ...:
    /^\s+elif\s+.*:\s*$/,        // elif ...:
    /^\s+else\s*:\s*$/,          // else:
    /^\s+for\s+\w+\s+in\s+/,     // for x in
    /^\s+while\s+.*:\s*$/,       // while ...:
    /print\s*\(/,                // print(
    /self\s*,/,                  // self,
    /"""|'''/,                   // 多行字符串
    /#.*:type/,                  // 类型注释
    /#.*:rtype/,                 // 返回类型注释
  ];

  // JavaScript 特征检测
  const javascriptIndicators = [
    /^function\s+\w+\s*\(/,      // function name(
    /^const\s+\w+\s*=\s*\(/,     // const name = (
    /^let\s+\w+\s*=\s*\(/,       // let name = (
    /^var\s+\w+\s*=\s*\(/,       // var name = (
    /=>\s*\{/,                   // =>
    /console\.log/,              // console.log
    /Array\.from/,               // Array.from
    /\.length/,                  // .length
    /for\s*\(/,                  // for (
    /while\s*\(/,                // while (
    /if\s*\(/,                   // if (
    /else\s*\{/,                 // else {
  ];

  // 计算 Python 特征匹配数
  let pythonScore = 0;
  const codeLines = trimmedCode.split('\n');
  
  for (const line of codeLines) {
    for (const pattern of pythonIndicators) {
      if (pattern.test(line)) {
        pythonScore++;
        break; // 每行只计算一次
      }
    }
  }

  // 计算 JavaScript 特征匹配数
  let javascriptScore = 0;
  for (const line of codeLines) {
    for (const pattern of javascriptIndicators) {
      if (pattern.test(line)) {
        javascriptScore++;
        break; // 每行只计算一次
      }
    }
  }

  // 特殊检查：如果代码包含 class Solution(object): 或 def，很可能是 Python
  if (trimmedCode.match(/class\s+\w+\s*\([^)]*\)\s*:/) || trimmedCode.match(/def\s+\w+\s*\(/)) {
    pythonScore += 5; // 给 Python 更高的权重
  }

  // 特殊检查：如果代码包含 function 或 =>，很可能是 JavaScript
  if (trimmedCode.match(/function\s+\w+\s*\(/) || trimmedCode.match(/=>\s*\{/)) {
    javascriptScore += 5; // 给 JavaScript 更高的权重
  }

  // 检查是否有未转换的 Python 语法
  if (trimmedCode.includes('def ') && !trimmedCode.includes('function ')) {
    pythonScore += 10;
  }
  if (trimmedCode.includes('range(') && !trimmedCode.includes('Array.from')) {
    pythonScore += 5;
  }
  if (trimmedCode.includes('len(') && !trimmedCode.includes('.length')) {
    pythonScore += 5;
  }

  console.log('=== 语言自动检测 ===');
  console.log('Python 特征得分:', pythonScore);
  console.log('JavaScript 特征得分:', javascriptScore);
  console.log('代码前200字符:', trimmedCode.substring(0, 200));

  // 根据得分判断语言
  if (pythonScore > javascriptScore) {
    console.log('检测结果: Python');
    return 'python';
  } else if (javascriptScore > pythonScore) {
    console.log('检测结果: JavaScript');
    return 'javascript';
  } else {
    // 如果得分相同，使用默认值
    console.log('检测结果: 无法确定，使用默认值', fallbackLanguage);
    return fallbackLanguage;
  }
}

/**
 * 标准化语言类型
 * @param {string} language - 语言类型
 * @returns {string} 标准化后的语言类型
 */
export function normalizeLanguage(language) {
  if (!language || typeof language !== 'string') {
    return 'javascript';
  }

  const normalized = language.toLowerCase().trim();
  
  // Python 变体
  if (normalized === 'python' || normalized === 'py' || normalized === 'python3') {
    return 'python';
  }
  
  // JavaScript 变体
  if (normalized === 'javascript' || normalized === 'js' || normalized === 'jsx' || 
      normalized === 'typescript' || normalized === 'ts') {
    return 'javascript';
  }

  return 'javascript'; // 默认返回 JavaScript
}

