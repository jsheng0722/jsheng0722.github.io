/**
 * 参数提取器
 * 从代码中提取函数参数信息
 */

/**
 * 提取 JavaScript 函数参数（所有函数）
 */
export function extractJavaScriptParameters(code) {
  const functions = [];
  
  // 参数验证
  if (!code || typeof code !== 'string') {
    console.warn('extractJavaScriptParameters: 代码为空或不是字符串');
    return functions;
  }
  
  try {
    // 匹配函数定义: function name(params) 或 const name = (params) =>
    // 包括类中的方法
    const functionPatterns = [
    /function\s+(\w+)\s*\(([^)]*)\)/g,
    /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/g,
    /let\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/g,
    /var\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/g,
    /(\w+)\s*=\s*function\s*\(([^)]*)\)/g
  ];
  
  // 单独处理类中的方法（更精确的匹配）
  // 匹配: class X { methodName(params) { 或 methodName(params) => {
  const classMethodPattern = /class\s+\w+\s*\{[^}]*?(\w+)\s*\(([^)]*)\)\s*[=>{]/g;
  let classMatch;
  while ((classMatch = classMethodPattern.exec(code)) !== null) {
    const methodName = classMatch[1];
    const paramsStr = (classMatch[2] || '').trim();
    
    // 跳过构造函数和保留关键字
    const reservedKeywords = ['constructor', 'if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'new', 'this'];
    if (reservedKeywords.includes(methodName)) {
      continue;
    }
    
    const parameters = [];
    if (paramsStr) {
      const params = paramsStr.split(',').map(p => p.trim()).filter(p => p);
      params.forEach((param, index) => {
        const paramName = param.split('=')[0].trim();
        const cleanParamName = paramName.replace(/^\{|\}$/g, '').trim();
        if (cleanParamName && !reservedKeywords.includes(cleanParamName)) {
          const paramType = inferParameterType(cleanParamName, code);
          parameters.push({
            name: cleanParamName,
            type: paramType,
            index: index,
            defaultValue: null
          });
        }
      });
    }
    
    // 避免重复添加
    if (!functions.find(f => f.name === methodName && 
        JSON.stringify(f.parameters) === JSON.stringify(parameters))) {
      functions.push({
        name: methodName,
        parameters: parameters
      });
    }
  }

  functionPatterns.forEach(pattern => {
    let match;
    // 重置正则表达式的lastIndex，避免重复匹配
    pattern.lastIndex = 0;
    while ((match = pattern.exec(code)) !== null) {
      const functionName = match[1];
      const paramsStr = (match[2] || '').trim();
      const parameters = [];
      
      // 跳过一些关键字（如 if, for, while 等）
      const reservedKeywords = ['if', 'for', 'while', 'switch', 'catch', 'function'];
      if (reservedKeywords.includes(functionName)) {
        continue;
      }
      
      if (paramsStr) {
        const params = paramsStr.split(',').map(p => p.trim()).filter(p => p);
        params.forEach((param, index) => {
          // 移除默认值
          const paramName = param.split('=')[0].trim();
          // 移除解构语法中的大括号
          const cleanParamName = paramName.replace(/^\{|\}$/g, '').trim();
          if (cleanParamName && !reservedKeywords.includes(cleanParamName)) {
            // 推断参数类型
            const paramType = inferParameterType(cleanParamName, code);
            parameters.push({
              name: cleanParamName,
              type: paramType,
              index: index,
              defaultValue: null
            });
          }
        });
      }
      
      // 避免重复添加相同的函数
      if (!functions.find(f => f.name === functionName && 
          JSON.stringify(f.parameters) === JSON.stringify(parameters))) {
        functions.push({
          name: functionName,
          parameters: parameters
        });
      }
    }
  });
  
  } catch (error) {
    console.error('extractJavaScriptParameters 错误:', error);
    console.error('代码内容:', code.substring(0, 500));
  }

  return functions;
}

/**
 * 提取 Python 函数参数（所有函数）
 */
export function extractPythonParameters(code) {
  const functions = [];
  
  // 参数验证
  if (!code || typeof code !== 'string') {
    console.warn('extractPythonParameters: 代码为空或不是字符串');
    return functions;
  }
  
  try {
    // 清理代码：移除注释和多余空白
    // 注意：不要过滤掉类定义和方法定义
    const lines = code.split('\n');
    let inMultiLineString = false;
    let multiLineStringChar = '';
  
  const cleanCode = lines
    .map((line, index) => {
      const trimmed = line.trim();
      // 跳过空行
      if (!trimmed) return '';
      
      // 处理多行字符串（""" 或 '''）
      // 检查是否包含多行字符串标记
      const hasTripleDouble = trimmed.includes('"""');
      const hasTripleSingle = trimmed.includes("'''");
      
      if (hasTripleDouble || hasTripleSingle) {
        // 计算标记数量
        const doubleCount = (trimmed.match(/"""/g) || []).length;
        const singleCount = (trimmed.match(/'''/g) || []).length;
        
        // 如果当前不在多行字符串中，检查是否开始新的多行字符串
        if (!inMultiLineString) {
          // 检查是否是单行多行字符串（开始和结束在同一行）
          if (hasTripleDouble && doubleCount >= 2) {
            // 单行多行字符串，跳过整行
            return '';
          }
          if (hasTripleSingle && singleCount >= 2) {
            // 单行多行字符串，跳过整行
            return '';
          }
          // 开始多行字符串
          if (hasTripleDouble && doubleCount % 2 === 1) {
            inMultiLineString = true;
            multiLineStringChar = '"""';
            return ''; // 跳过开始标记行
          }
          if (hasTripleSingle && singleCount % 2 === 1) {
            inMultiLineString = true;
            multiLineStringChar = "'''";
            return ''; // 跳过开始标记行
          }
        } else {
          // 当前在多行字符串中，检查是否结束
          if ((multiLineStringChar === '"""' && hasTripleDouble) ||
              (multiLineStringChar === "'''" && hasTripleSingle)) {
            inMultiLineString = false;
            multiLineStringChar = '';
            return ''; // 跳过结束标记行
          }
        }
      }
      
      // 如果在多行字符串中，跳过
      if (inMultiLineString) return '';
      
      // 移除行内注释（保留字符串中的 #）
      const commentIndex = trimmed.indexOf('#');
      if (commentIndex >= 0) {
        // 检查 # 是否在字符串中
        const beforeComment = trimmed.substring(0, commentIndex);
        const quoteCount = (beforeComment.match(/['"]/g) || []).length;
        if (quoteCount % 2 === 0) {
          return trimmed.substring(0, commentIndex).trim();
        }
      }
      return trimmed;
    })
    .filter(line => line) // 只过滤空行，保留所有非空行（包括类定义和方法定义）
    .join('\n');
  
  // 匹配所有 Python 函数定义: def name(params):
  // 包括类中的方法
  // 使用更宽松的正则表达式，支持缩进
  const functionPattern = /def\s+(\w+)\s*\(([^)]*)\)\s*:/g;
  let match;
  const matches = [];
  
  // 重置正则表达式的lastIndex
  functionPattern.lastIndex = 0;
  
  // 收集所有匹配（包括类中的方法）
  while ((match = functionPattern.exec(cleanCode)) !== null) {
    matches.push(match);
  }
  
  // 调试信息
  if (matches.length === 0) {
    console.log('Python函数检测: 未找到匹配，清理后的代码:', cleanCode.substring(0, 500));
    console.log('原始代码:', code.substring(0, 500));
  }
  
  // 处理每个匹配
  matches.forEach(match => {
    const functionName = match[1];
    let paramsStr = (match[2] || '').trim();
    const parameters = [];
    
    // 调试信息
    console.log(`检测到Python函数: ${functionName}, 参数: ${paramsStr}`);
    
    if (paramsStr) {
      // 移除 self 参数
      const params = paramsStr
        .split(',')
        .map(p => p.trim())
        .filter(p => {
          const trimmed = p.trim();
          return trimmed !== 'self' && trimmed !== '';
        });
      
      params.forEach((param, index) => {
        // 移除类型注解和默认值
        let paramName = param
          .split(':')[0]  // 移除类型注解
          .split('=')[0]  // 移除默认值
          .trim();
        
        // 进一步清理
        paramName = paramName.replace(/^\s*,\s*/, '').trim();
        
        if (paramName) {
          // 推断参数类型
          const paramType = inferPythonParameterType(paramName, cleanCode);
          parameters.push({
            name: paramName,
            type: paramType,
            index: index,
            defaultValue: null
          });
        }
      });
    }
    
    // 避免重复添加
    if (!functions.find(f => f.name === functionName && 
        JSON.stringify(f.parameters) === JSON.stringify(parameters))) {
      functions.push({
        name: functionName,
        parameters: parameters
      });
    }
  });
  
  } catch (error) {
    console.error('extractPythonParameters 错误:', error);
    console.error('代码内容:', code.substring(0, 500));
  }

  return functions;
}

/**
 * 推断 JavaScript 参数类型
 */
function inferParameterType(paramName, code) {
  const lowerParam = paramName.toLowerCase();
  
  // 检查是否是数组
  if (lowerParam.includes('arr') || 
      lowerParam.includes('array') || 
      lowerParam.includes('nums') ||
      lowerParam.includes('list') ||
      code.includes(`${paramName}.length`) ||
      code.includes(`${paramName}[`)) {
    return 'array';
  }
  
  // 检查是否是数字
  if (lowerParam.includes('target') ||
      lowerParam.includes('num') ||
      lowerParam.includes('value') ||
      lowerParam.includes('k') ||
      lowerParam.includes('n')) {
    return 'number';
  }
  
  // 检查是否是字符串
  if (lowerParam.includes('str') || lowerParam.includes('string')) {
    return 'string';
  }
  
  // 默认返回 number
  return 'number';
}

/**
 * 推断 Python 参数类型
 */
function inferPythonParameterType(paramName, code) {
  const lowerParam = paramName.toLowerCase();
  
  // 检查类型注解
  if (code.includes(`: List[`) || code.includes(`: list[`)) {
    return 'array';
  }
  if (code.includes(`: int`) || code.includes(`: float`)) {
    return 'number';
  }
  if (code.includes(`: str`) || code.includes(`: string`)) {
    return 'string';
  }
  
  // 检查是否是数组
  if (lowerParam.includes('arr') || 
      lowerParam.includes('array') || 
      lowerParam.includes('nums') ||
      lowerParam.includes('list') ||
      code.includes(`len(${paramName})`) ||
      code.includes(`${paramName}[`)) {
    return 'array';
  }
  
  // 检查是否是数字
  if (lowerParam.includes('target') ||
      lowerParam.includes('num') ||
      lowerParam.includes('value') ||
      lowerParam.includes('k') ||
      lowerParam.includes('n')) {
    return 'number';
  }
  
  // 默认返回 number
  return 'number';
}

