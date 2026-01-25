/**
 * 代码执行器
 * 执行代码并跟踪每一步的状态变化
 */

// createTrackableArray 函数已移除，当前未使用

/**
 * 执行 JavaScript 代码并跟踪状态
 */
export function executeJavaScriptCode(code, parameters = {}, functionName = null) {
  // 调试：检查传入的代码
  console.log('executeJavaScriptCode 接收到的代码类型:', typeof code);
  console.log('代码前200字符:', code.substring(0, 200));
  
  // 更准确地检测Python代码：检查Python特有的语法
  // 注意：检查逻辑要更精确，避免误判
  const hasDef = code.includes('def ');
  const hasClassWithColon = code.includes('class ') && code.match(/class\s+\w+\s*\([^)]*\)\s*:/);
  const hasRangeWithoutArray = code.includes('range(') && !code.includes('Array.from');
  const hasLenWithoutLength = code.includes('len(') && !code.includes('.length');
  
  const hasPythonSyntax = hasDef || hasClassWithColon || hasRangeWithoutArray || hasLenWithoutLength;
  
  if (hasPythonSyntax) {
    console.error('错误：executeJavaScriptCode 接收到了Python代码！');
    console.error('检测到的Python语法:');
    console.error('- def:', hasDef);
    console.error('- class with colon:', hasClassWithColon);
    console.error('- range without Array.from:', hasRangeWithoutArray);
    console.error('- len without .length:', hasLenWithoutLength);
    console.error('代码内容:', code.substring(0, 500));
    throw new Error('代码应该是JavaScript格式，但收到了Python代码。请确保先调用 executePythonCode 进行转换。');
  }

  const steps = [];
  const stepIndexRef = { current: 0 };
  
  // 存储当前变量值，用于后续步骤的高亮
  const currentVariables = {};
  
  // 函数调用栈，用于跟踪嵌套函数调用
  const functionCallStack = [];
  const functionIdCounter = { current: 0 };
  
  // 当前函数ID和名称
  const currentFunctionId = functionName ? `func_${functionIdCounter.current++}` : null;
  const currentFunctionName = functionName || 'main';
  
  // 如果这是函数调用，推入调用栈
  if (functionName) {
    functionCallStack.push({
      id: currentFunctionId,
      name: currentFunctionName,
      startStep: 0
    });
  }

  // 使用传入的参数，如果没有则尝试从代码中提取
  const arrays = {};
  Object.keys(parameters).forEach(key => {
    if (Array.isArray(parameters[key])) {
      arrays[key] = parameters[key];
    }
  });

  // 如果没有参数，不自动提取数组或使用默认值
  // 只有在用户明确提供参数时才执行
  if (Object.keys(arrays).length === 0 && Object.keys(parameters).length === 0) {
    // 返回空步骤，等待用户输入参数
    return { steps: [], finalArray: null };
  }

  // 创建跟踪函数
  const trackCompare = (arr, i, j, arrName = 'arr') => {
    if (Array.isArray(arr)) {
      const comparison = arr[i] > arr[j] ? '>' : arr[i] < arr[j] ? '<' : '===';
      const result = arr[i] > arr[j] ? 'greater' : arr[i] < arr[j] ? 'less' : 'equal';
      
      // 更新当前变量值（i 和 j 通常是循环变量）
      if (typeof i === 'number') {
        // 如果 i 是数字，可能是数组索引，保存为 'i'
        currentVariables['i'] = i;
      }
      if (typeof j === 'number') {
        currentVariables['j'] = j;
      }
      
      steps.push({
        type: 'compare',
        message: `比较 ${arrName}[${i}](${arr[i]}) ${comparison} ${arrName}[${j}](${arr[j]})`,
        array: [...arr],
        highlightedIndices: [i, j],
        stepIndex: stepIndexRef.current++,
        comparisonResult: result, // 比较结果：greater, less, equal
        comparisonSymbol: comparison, // 比较符号：>, <, ===
        currentVariables: { ...currentVariables }, // 保存当前变量值
        functionId: currentFunctionId, // 所属函数ID
        functionName: currentFunctionName // 所属函数名称
      });
    }
  };

  const trackSwap = (arr, i, j, arrName = 'arr') => {
    if (Array.isArray(arr)) {
      // 更新当前变量值
      if (typeof i === 'number') currentVariables['i'] = i;
      if (typeof j === 'number') currentVariables['j'] = j;
      
      steps.push({
        type: 'swap',
        message: `交换 ${arrName}[${i}](${arr[i]}) 和 ${arrName}[${j}](${arr[j]})`,
        array: [...arr],
        highlightedIndices: [i, j],
        swappedIndices: [i, j],
        stepIndex: stepIndexRef.current++,
        currentVariables: { ...currentVariables }, // 保存当前变量值
        functionId: currentFunctionId, // 所属函数ID
        functionName: currentFunctionName // 所属函数名称
      });
    }
  };

  const trackInfo = (message, arr = null) => {
    steps.push({
      type: 'info',
      message: message,
      array: arr ? [...arr] : (steps.length > 0 ? steps[steps.length - 1].array : null),
      highlightedIndices: [],
      stepIndex: stepIndexRef.current++,
      currentVariables: { ...currentVariables }, // 保存当前变量值
      functionId: currentFunctionId, // 所属函数ID
      functionName: currentFunctionName // 所属函数名称
    });
  };

  const trackArrayAccess = (arr, index, arrName = 'arr') => {
    if (Array.isArray(arr) && index >= 0 && index < arr.length) {
      // 更新当前变量值（如果 index 是变量）
      if (typeof index === 'number') {
        // 尝试从变量中找到对应的值
        Object.keys(currentVariables).forEach(vName => {
          if (currentVariables[vName] === index) {
            // 变量值匹配索引
          }
        });
      }
      
      steps.push({
        type: 'access',
        message: `访问 ${arrName}[${index}] = ${arr[index]}`,
        array: [...arr],
        highlightedIndices: [index],
        stepIndex: stepIndexRef.current++,
        accessedIndex: index,
        accessedValue: arr[index],
        currentVariables: { ...currentVariables }, // 保存当前变量值
        functionId: currentFunctionId, // 所属函数ID
        functionName: currentFunctionName // 所属函数名称
      });
    }
  };

  // 跟踪变量值变化
  const trackVariableChange = (varName, oldValue, newValue) => {
    // 更新当前变量值
    currentVariables[varName] = newValue;
    
    // 确定需要高亮的索引（如果变量值是数字，可能是数组索引）
    const highlightedIndices = [];
    Object.keys(currentVariables).forEach(vName => {
      const val = currentVariables[vName];
      // 如果变量值是数字且在数组范围内，添加到高亮列表
      if (typeof val === 'number' && val >= 0) {
        Object.keys(arrays).forEach(arrName => {
          if (arrays[arrName] && val < arrays[arrName].length) {
            highlightedIndices.push(val);
          }
        });
      }
    });
    
    steps.push({
      type: 'variable',
      message: `${varName}: ${oldValue !== undefined ? oldValue : 'undefined'} → ${newValue}`,
      array: steps.length > 0 ? steps[steps.length - 1].array : null,
      highlightedIndices: highlightedIndices,
      stepIndex: stepIndexRef.current++,
      variableName: varName,
      oldValue: oldValue,
      newValue: newValue,
      currentVariables: { ...currentVariables }, // 保存当前所有变量值
      functionId: currentFunctionId, // 所属函数ID
      functionName: currentFunctionName // 所属函数名称
    });
  };

  // 跟踪条件判断结果
  const trackCondition = (condition, result, arr = null, indices = []) => {
    steps.push({
      type: 'condition',
      message: `条件: ${condition} = ${result}`,
      array: arr ? [...arr] : (steps.length > 0 ? steps[steps.length - 1].array : null),
      highlightedIndices: indices,
      stepIndex: stepIndexRef.current++,
      conditionResult: result,
      functionId: currentFunctionId, // 所属函数ID
      functionName: currentFunctionName // 所属函数名称
    });
  };

  // 跟踪返回值
  const trackReturn = (value, nextFunctionId = null) => {
    steps.push({
      type: 'return',
      message: `返回: ${JSON.stringify(value)}`,
      array: steps.length > 0 ? steps[steps.length - 1].array : null,
      highlightedIndices: [],
      stepIndex: stepIndexRef.current++,
      returnValue: value,
      functionId: currentFunctionId, // 所属函数ID
      functionName: currentFunctionName, // 所属函数名称
      nextFunctionId: nextFunctionId // 返回值指向的下一个函数ID（如果有）
    });
  };

  // 包装代码以添加跟踪
  let instrumentedCode = code;

  // 为每个数组变量创建可跟踪版本
  Object.keys(arrays).forEach(arrName => {
    // 替换数组比较为跟踪版本（先处理比较，避免与单个访问冲突）
    instrumentedCode = instrumentedCode.replace(
      new RegExp(`\\b${arrName}\\s*\\[([^\\]]+)\\]\\s*>\\s*${arrName}\\s*\\[([^\\]]+)\\]`, 'g'),
      (match, i, j) => {
        return `(_trackCompare(${arrName}, ${i}, ${j}, '${arrName}'), ${match})`;
      }
    );

    instrumentedCode = instrumentedCode.replace(
      new RegExp(`\\b${arrName}\\s*\\[([^\\]]+)\\]\\s*<\\s*${arrName}\\s*\\[([^\\]]+)\\]`, 'g'),
      (match, i, j) => {
        return `(_trackCompare(${arrName}, ${i}, ${j}, '${arrName}'), ${match})`;
      }
    );

    // 替换数组交换
    instrumentedCode = instrumentedCode.replace(
      new RegExp(`\\[\\s*${arrName}\\s*\\[([^\\]]+)\\],\\s*${arrName}\\s*\\[([^\\]]+)\\]\\s*\\]\\s*=\\s*\\[\\s*${arrName}\\s*\\[\\2\\],\\s*${arrName}\\s*\\[\\1\\]\\s*\\]`, 'g'),
      (match, i, j) => {
        return `_trackSwap(${arrName}, ${i}, ${j}, '${arrName}'); [${arrName}[${j}], ${arrName}[${i}]] = [${arrName}[${i}], ${arrName}[${j}]];`;
      }
    );
  });

  // 添加循环跟踪：跟踪循环变量的值变化
  // 匹配 for (let i = ...; i < ...; i++) { 或类似模式
  // 先处理循环变量初始化
  instrumentedCode = instrumentedCode.replace(
    /for\s*\(let\s+(\w+)\s*=\s*([^;]+);/g,
    (match, varName, initValue) => {
      // 跟踪循环变量初始化
      return `for (let ${varName} = (${initValue}, _trackVariableChange('${varName}', undefined, ${initValue}));`;
    }
  );

  // 跟踪循环变量递增（在 for 循环的更新部分）
  // 匹配 for (...; ...; i++) 或 for (...; ...; j++)
  instrumentedCode = instrumentedCode.replace(
    /for\s*\([^)]*;\s*([^)]*);\s*(\w+)\+\+\s*\)/g,
    (match, condition, varName) => {
      // 避免跟踪跟踪函数中的变量
      if (varName.startsWith('_track')) return match;
      return match.replace(
        new RegExp(`(${varName})\\+\\+`),
        `(_trackVariableChange('${varName}', $1, $1 + 1), $1++)`
      );
    }
  );

  // 更通用的循环变量递增跟踪（在循环体内部）
  // 但要避免在跟踪函数调用中跟踪
  const lines = instrumentedCode.split('\n');
  instrumentedCode = lines.map((line, lineIndex) => {
    // 跳过已经包含跟踪调用的行
    if (line.includes('_trackVariableChange') || line.includes('_trackCompare') || line.includes('_trackSwap')) {
      return line;
    }
    
    // 跟踪循环变量递增（在行尾）
    let modifiedLine = line.replace(
      /(\w+)\+\+;/g,
      (match, varName) => {
        if (varName.startsWith('_track')) return match;
        return `(_trackVariableChange('${varName}', ${varName}, ${varName} + 1), ${varName}++);`;
      }
    );
    
    return modifiedLine;
  }).join('\n');

  // 添加条件跟踪：在 if 语句中添加跟踪
  // 但避免在跟踪函数内部添加跟踪
  instrumentedCode = instrumentedCode.replace(
    /if\s*\(([^)]+)\)\s*\{/g,
    (match, condition) => {
      // 检查条件中是否包含数组访问
      const hasArrayAccess = Object.keys(arrays).some(arrName => 
        condition.includes(`${arrName}[`)
      );
      if (hasArrayAccess) {
        // 简化条件显示，避免显示整个表达式
        return `${match}\n_trackInfo('检查条件');`;
      }
      return match;
    }
  );

  // 添加 return 语句跟踪
  // 匹配 return 语句，但避免在跟踪函数内部跟踪
  instrumentedCode = instrumentedCode.replace(
    /return\s+([^;]+);/g,
    (match, returnValue) => {
      // 避免在跟踪函数内部跟踪
      if (match.includes('_trackReturn') || match.includes('_track')) {
        return match;
      }
      // 包装返回值，先跟踪再返回
      return `_trackReturn(${returnValue});\nreturn ${returnValue};`;
    }
  );
  
  // 处理没有分号的 return 语句（在块的最后）
  instrumentedCode = instrumentedCode.replace(
    /return\s+([^;\n}]+)(?=\s*[\n}])/g,
    (match, returnValue) => {
      // 避免在跟踪函数内部跟踪
      if (match.includes('_trackReturn') || match.includes('_track')) {
        return match;
      }
      // 包装返回值，先跟踪再返回
      return `(_trackReturn(${returnValue}), ${returnValue})`;
    }
  );

  // 添加初始步骤
  if (Object.keys(arrays).length > 0) {
    const firstArray = Object.values(arrays)[0];
    steps.push({
      type: 'init',
      message: `初始化数组: [${firstArray.join(', ')}]`,
      array: [...firstArray],
      highlightedIndices: [],
      stepIndex: stepIndexRef.current++,
      functionId: currentFunctionId, // 所属函数ID
      functionName: currentFunctionName // 所属函数名称
    });
  }

  try {
    // 创建执行上下文，包含参数
    const context = {
      ...arrays,
      ...parameters, // 添加所有参数（包括非数组参数）
      _trackCompare: trackCompare,
      _trackSwap: trackSwap,
      _trackInfo: trackInfo,
      _trackArrayAccess: trackArrayAccess,
      _trackVariableChange: trackVariableChange,
      _trackCondition: trackCondition,
      _trackReturn: trackReturn,
      console: {
        log: (...args) => {
          trackInfo('console.log: ' + args.join(', '));
        }
      }
    };

    // 执行代码
    try {
      // eslint-disable-next-line no-new-func
      const executeFunction = new Function(...Object.keys(context), instrumentedCode);
      executeFunction(...Object.values(context));
    } catch (error) {
      console.error('代码执行失败:', error);
      console.error('执行的代码:', instrumentedCode.substring(0, 500));
      throw error;
    }
    
    // 如果有函数名，调用该函数
    if (functionName && Object.keys(parameters).length > 0) {
      const paramNames = Object.keys(parameters).join(', ');
      
      // 检查是否是类中的方法（代码中包含 class 关键字）
      const isClassMethod = (instrumentedCode.includes('class ') && 
                           instrumentedCode.includes(` ${functionName}(`)) ||
                           instrumentedCode.match(new RegExp(`class\\s+\\w+[^{]*\\{[^}]*${functionName}\\s*\\(`));
      
      if (isClassMethod) {
        // 如果是类方法，需要先实例化类，然后调用方法
        // 尝试找到类名（简单匹配：class ClassName）
        const classMatch = instrumentedCode.match(/class\s+(\w+)/);
        if (classMatch) {
          const className = classMatch[1];
          // 将类实例化和方法调用添加到代码中，确保在同一个执行上下文中
          const callCode = `
const instance = new ${className}();
instance.${functionName}(${paramNames});
          `;
          // 将调用代码追加到 instrumentedCode 中，然后一起执行
          const fullCode = instrumentedCode + callCode;
          try {
            // eslint-disable-next-line no-new-func
            const executeWithCall = new Function(...Object.keys(context), fullCode);
            executeWithCall(...Object.values(context));
          } catch (e) {
            // 如果实例化失败，尝试直接调用（可能是静态方法）
            try {
              const staticCallCode = `${className}.${functionName}(${paramNames});`;
              const fullCodeStatic = instrumentedCode + '\n' + staticCallCode;
              // eslint-disable-next-line no-new-func
              const executeStatic = new Function(...Object.keys(context), fullCodeStatic);
              executeStatic(...Object.values(context));
            } catch (e2) {
              console.error('类方法调用失败:', e2);
              throw e2;
            }
          }
        } else {
          // 如果找不到类名，尝试直接调用函数
          const callCode = `${functionName}(${paramNames});`;
          const fullCode = instrumentedCode + '\n' + callCode;
          try {
            // eslint-disable-next-line no-new-func
            const callFunction = new Function(...Object.keys(context), fullCode);
            callFunction(...Object.values(context));
          } catch (e) {
            console.error('函数调用失败:', e);
            throw e;
          }
        }
      } else {
        // 普通函数调用
        const callCode = `${functionName}(${paramNames});`;
        const fullCode = instrumentedCode + '\n' + callCode;
        try {
          // eslint-disable-next-line no-new-func
          const callFunction = new Function(...Object.keys(context), fullCode);
          callFunction(...Object.values(context));
        } catch (e) {
          console.error('函数调用失败:', e);
          throw e;
        }
      }
    }

    // 添加完成步骤（不强制添加sortedIndices，除非确实是排序算法）
    const finalArray = steps.length > 0 ? steps[steps.length - 1].array : null;
    if (finalArray) {
      // 检查是否有排序相关的步骤
      const hasSortSteps = steps.some(s => s.type === 'swap' || s.sortedIndices);
      steps.push({
        type: 'complete',
        message: '执行完成',
        array: [...finalArray],
        highlightedIndices: hasSortSteps ? Array.from({ length: finalArray.length }, (_, i) => i) : [],
        sortedIndices: hasSortSteps ? Array.from({ length: finalArray.length }, (_, i) => i) : undefined,
        stepIndex: stepIndexRef.current++
      });
    }

    return { steps, finalArray };
  } catch (error) {
    console.error('代码执行错误:', error);
    return {
      steps: [{
        type: 'error',
        message: `执行错误: ${error.message}`,
        array: steps.length > 0 ? steps[steps.length - 1].array : null,
        highlightedIndices: []
      }],
      finalArray: null
    };
  }
}

// instrumentCode 函数已移除，当前未使用

/**
 * 执行 Python 代码（转换为 JavaScript 后执行）
 */
export function executePythonCode(code, parameters = {}, functionName = null) {
  // 如果没有传入函数名，从代码中提取
  if (!functionName) {
    const functionMatch = code.match(/def\s+(\w+)\s*\(/);
    functionName = functionMatch ? functionMatch[1] : 'solution';
  }
  
  // 简单的 Python 到 JavaScript 转换
  // 检查是否是类中的方法
  const isClassMethod = code.includes('class ') && code.includes('def ');
  
  // 先移除多行字符串注释（docstring）和类型注释
  // 重要：保持每行独立，不要合并行
  let jsCode = code
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      // 移除多行字符串注释行
      if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
        return '';
      }
      // 移除类型注释行
      if (trimmed.startsWith(':type') || trimmed.startsWith(':rtype')) {
        return '';
      }
      return line;
    })
    .filter(line => {
      const trimmed = line.trim();
      // 过滤掉空行和只包含注释的行
      if (!trimmed || trimmed.startsWith('#')) {
        return false;
      }
      return true;
    })
    .join('\n');
  
  // 确保每行以换行符结尾（防止行被合并）
  jsCode = jsCode.replace(/\n/g, '\n').replace(/\r\n/g, '\n');
  
  // 移除代码中残留的多行字符串注释内容
  // 匹配 """...""" 或 '''...'''
  jsCode = jsCode.replace(/"""[^"]*"""/g, '');
  jsCode = jsCode.replace(/'''[^']*'''/g, '');
  
  // 如果是类，先转换类结构
  if (isClassMethod) {
    // 转换 class Solution(object): 为 class Solution {
    jsCode = jsCode.replace(/class\s+(\w+)\s*\([^)]*\)\s*:/g, 'class $1 {');
  }
  
  // 转换函数定义 - 必须在其他转换之前
  jsCode = jsCode.replace(/def\s+(\w+)\s*\(([^)]*)\)\s*:/g, (match, funcName, params) => {
    // 移除 self 参数
    const cleanParams = params.replace(/self\s*,?\s*/, '').trim();
    // 如果是类中的方法，保持方法定义格式
    if (isClassMethod) {
      return `${funcName}(${cleanParams}) {`;
    } else {
      return `function ${funcName}(${cleanParams}) {`;
    }
  });
  
  // 转换其他Python语法
  // 先转换 len() - 必须在 range() 之前，因为 range() 可能包含 len()
  // 使用更精确的正则，避免匹配已经转换的代码
  jsCode = jsCode.replace(/\blen\s*\(\s*([^)]+)\s*\)/g, (match, expr) => {
    // 处理 len(nums)-1 这种情况
    return `${expr}.length`;
  });
  
  // 转换 for...in range() - 必须在单独的 range() 转换之前
  jsCode = jsCode.replace(/for\s+(\w+)\s+in\s+range\s*\(([^)]+)\)\s*:/g, (match, varName, rangeArgs) => {
    const parts = rangeArgs.split(',').map(s => s.trim());
    if (parts.length === 2) {
      const [start, end] = parts;
      return `for (let ${varName} = ${start}; ${varName} < ${end}; ${varName}++) {`;
    } else if (parts.length === 3) {
      const [start, end, step] = parts;
      return `for (let ${varName} = ${start}; ${varName} < ${end}; ${varName} += ${step}) {`;
    } else {
      return `for (let ${varName} = 0; ${varName} < ${rangeArgs}; ${varName}++) {`;
    }
  });
  
  // 转换单独的 range() 调用（不在 for 循环中）
  jsCode = jsCode.replace(/\brange\s*\(([^)]+)\)/g, (match, args) => {
    const parts = args.split(',').map(s => s.trim());
    if (parts.length === 2) {
      const [start, end] = parts;
      return `Array.from({length: ${end} - ${start}}, (_, i) => ${start} + i)`;
    } else if (parts.length === 3) {
      const [start, end, step] = parts;
      return `Array.from({length: Math.ceil((${end} - ${start}) / ${step})}, (_, i) => ${start} + i * ${step})`;
    } else {
      return `Array.from({length: ${args}}, (_, i) => i)`;
    }
  });
  
  // 按行处理，确保每行独立转换
  const preProcessedLines = jsCode.split('\n');
  jsCode = preProcessedLines.map(line => {
    let processedLine = line;
    
    // 移除 self 参数
    processedLine = processedLine.replace(/self\s*,?\s*/g, '');
    
    // 转换 print
    processedLine = processedLine.replace(/print\s*\(/g, 'console.log(');
    
    // 转换 if/elif/else（只匹配当前行，不包括后续行）
    processedLine = processedLine.replace(/if\s+([^:\n]+)\s*:$/, 'if ($1) {');
    processedLine = processedLine.replace(/elif\s+([^:\n]+)\s*:$/, 'else if ($1) {');
    processedLine = processedLine.replace(/else\s*:$/, 'else {');
    
    // 处理 return 语句，确保它们有分号
    const trimmed = processedLine.trim();
    if (trimmed.startsWith('return ') && !trimmed.endsWith(';')) {
      // 确保 return 语句有分号
      processedLine = processedLine.replace(/\breturn\s+([^;\n]+?)(\s*)$/, (match, value, trailing) => {
        // 移除末尾可能的空格，添加分号
        return `return ${value.trim()};${trailing}`;
      });
    }
    
    return processedLine;
  }).join('\n');
  
  // 处理Python缩进转换为JavaScript大括号
  // 注意：此时大部分语法已经转换（if/elif/else 已经有大括号，for 循环已经有大括号）
  // 只需要处理剩余的缩进块
  console.log('=== 开始缩进转换 ===');
  console.log('转换前代码前500字符:', jsCode.substring(0, 500));
  
  const lines = jsCode.split('\n');
  let result = [];
  let indentStack = [0]; // 存储缩进级别，[0] 是函数/类级别
  let functionStack = []; // 存储函数定义的缩进级别
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // 跳过空行和注释
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*')) {
      result.push(line);
      continue;
    }
    
    // 安全地计算当前行的缩进（以空格为单位，支持2或4空格缩进）
    const indentMatch = line.match(/^(\s*)/);
    const indentSpaces = indentMatch ? indentMatch[0].length : 0;
    const indent = Math.floor(indentSpaces / 2); // 使用2空格为单位（更通用）
    const prevIndent = indentStack[indentStack.length - 1] || 0;
    
    // 检测函数/方法定义（已经转换过的格式）
    const isFunctionDef = trimmed.match(/^(function\s+\w+|class\s+\w+|\w+\s*\([^)]*\)\s*\{)/);
    if (isFunctionDef) {
      functionStack.push(indent);
      console.log(`检测到函数定义在第 ${i + 1} 行，缩进级别: ${indent}`);
    }
    
    // 如果缩进减少，需要添加闭合大括号
    // 但要注意：不要关闭函数本身的大括号（函数级别的缩进）
    if (indent < prevIndent && indentStack.length > 1) {
      const levelsToClose = prevIndent - indent;
      
      // 检查是否回到了函数级别
      const isBackToFunctionLevel = functionStack.length > 0 && indent <= functionStack[functionStack.length - 1];
      
      // 计算需要关闭的级别数
      let actualClose = 0;
      for (let j = 0; j < levelsToClose && indentStack.length > 1; j++) {
        // 如果回到了函数级别，不要关闭函数的大括号
        if (isBackToFunctionLevel && indentStack.length === 2) {
          break;
        }
        actualClose++;
      }
      
      // 关闭大括号
      for (let j = 0; j < actualClose; j++) {
        if (indentStack.length > 1) {
          result.push('}');
          indentStack.pop();
        }
      }
    }
    
    // 检查行是否已经有大括号（说明已经转换过了）
    const hasOpenBrace = trimmed.endsWith('{');
    const hasColon = trimmed.endsWith(':') && !trimmed.includes('//') && !trimmed.includes('http') && !trimmed.includes('://');
    
    if (hasOpenBrace) {
      // 已经有大括号，直接添加
      result.push(line);
      indentStack.push(indent + 1);
    } else if (hasColon) {
      // 还有冒号（可能是遗漏的），移除冒号，添加大括号
      const newLine = line.replace(/:$/, ' {');
      result.push(newLine);
      indentStack.push(indent + 1);
    } else {
      // 普通行，直接添加
      result.push(line);
    }
  }
  
  // 关闭所有未闭合的大括号（包括函数的大括号）
  // 但确保至少保留一个级别（函数/类级别）
  while (indentStack.length > 1) {
    result.push('}');
    indentStack.pop();
  }
  
  jsCode = result.join('\n');

  // 平衡大括号（确保大括号匹配）
  const openBraces = (jsCode.match(/\{/g) || []).length;
  const closeBraces = (jsCode.match(/\}/g) || []).length;
  const braceDiff = openBraces - closeBraces;
  if (braceDiff > 0) {
    jsCode += '\n' + '}'.repeat(braceDiff);
  } else if (braceDiff < 0) {
    console.warn('警告：闭合大括号多于开放大括号，可能有问题');
  }
  
  console.log('转换后代码前500字符:', jsCode.substring(0, 500));
  console.log('转换后代码后500字符:', jsCode.substring(Math.max(0, jsCode.length - 500)));
  console.log('大括号统计 - 开放:', openBraces, '闭合:', closeBraces, '差值:', braceDiff);
  
  // 检查 return 语句的位置
  const returnLines = [];
  jsCode.split('\n').forEach((line, index) => {
    if (line.trim().startsWith('return')) {
      returnLines.push({ line: index + 1, content: line.trim() });
    }
  });
  if (returnLines.length > 0) {
    console.log('Return 语句位置:', returnLines);
  }
  
  console.log('=== 缩进转换结束 ===');

  // 如果指定了函数名，不要在这里添加函数调用
  // 函数调用应该在 executeJavaScriptCode 中处理，以确保类定义和方法调用在同一个执行上下文中
  // 只需要确保代码结构完整（所有大括号匹配）
  const finalOpenBraces = (jsCode.match(/\{/g) || []).length;
  const finalCloseBraces = (jsCode.match(/\}/g) || []).length;
  const finalBraceDiff = finalOpenBraces - finalCloseBraces;
  
  // 如果还有未关闭的大括号，先关闭它们
  if (finalBraceDiff > 0) {
    jsCode += '\n' + '}'.repeat(finalBraceDiff);
  }

  // 最终清理：确保所有Python语法都被转换
  // 多次转换以确保没有遗漏
  let previousCode = '';
  let iterations = 0;
  while (jsCode !== previousCode && iterations < 5) {
    previousCode = jsCode;
    iterations++;
    
    // 强制转换所有残留的Python语法
    jsCode = jsCode
      .replace(/def\s+(\w+)\s*\(/g, 'function $1(')
      .replace(/\brange\s*\(([^)]+)\)/g, (match, args) => {
        const parts = args.split(',').map(s => s.trim());
        if (parts.length === 2) {
          const [start, end] = parts;
          return `Array.from({length: ${end} - ${start}}, (_, i) => ${start} + i)`;
        } else if (parts.length === 3) {
          const [start, end, step] = parts;
          return `Array.from({length: Math.ceil((${end} - ${start}) / ${step})}, (_, i) => ${start} + i * ${step})`;
        } else {
          return `Array.from({length: ${args}}, (_, i) => i)`;
        }
      })
      .replace(/\blen\s*\(\s*([^)]+)\s*\)/g, '$1.length')
      .replace(/class\s+(\w+)\s*\([^)]*\)\s*:/g, 'class $1 {');
  }
  
  // 验证转换是否成功：检查是否还有Python语法残留
  const hasDef = jsCode.includes('def ');
  const hasRangeWithoutArray = jsCode.includes('range(') && !jsCode.includes('Array.from');
  const hasLenWithoutLength = jsCode.includes('len(') && !jsCode.includes('.length');
  const hasClassWithColon = jsCode.match(/class\s+\w+\s*\([^)]*\)\s*:/);
  const hasPythonSyntax = hasDef || hasRangeWithoutArray || hasLenWithoutLength || hasClassWithColon;
  
  if (hasPythonSyntax) {
    console.error('=== Python代码转换失败，检测到残留的Python语法 ===');
    console.error('原始代码:', code.substring(0, 500));
    console.error('转换后代码:', jsCode.substring(0, 500));
    console.error('检测结果:', {
      hasDef,
      hasRangeWithoutArray,
      hasLenWithoutLength,
      hasClassWithColon
    });
    throw new Error('Python代码转换失败，代码中仍包含Python语法。请检查代码格式。');
  }
  
  // 调试：输出转换后的代码
  console.log('=== Python代码转换完成 ===');
  console.log('原始代码长度:', code.length);
  console.log('转换后代码长度:', jsCode.length);
  console.log('转换后的JavaScript代码前500字符:', jsCode.substring(0, 500));
  console.log('转换后的JavaScript代码后200字符:', jsCode.substring(Math.max(0, jsCode.length - 200)));
  
  // 最终验证：确保没有Python语法
  if (jsCode.includes('def ') || (jsCode.includes('range(') && !jsCode.includes('Array.from'))) {
    console.error('错误：转换后仍然包含Python语法');
    console.error('完整转换后的代码:', jsCode);
    throw new Error('Python代码转换失败，代码中仍包含Python语法。请检查代码格式。');
  }
  
  // 语法验证：尝试解析代码，检查是否有语法错误
  try {
    // 使用 Function 构造函数来验证语法（不执行）
    // eslint-disable-next-line no-new-func
    new Function(jsCode);
    console.log('✓ 语法验证通过');
  } catch (syntaxError) {
    console.error('✗ 语法验证失败:', syntaxError.message);
    console.error('语法错误位置:', syntaxError.stack);
    console.error('=== 完整转换后的代码 ===');
    console.error(jsCode);
    console.error('=== 代码结束 ===');
    
    // 尝试找到 return 语句的位置
    const returnMatches = jsCode.matchAll(/\breturn\s+/g);
    for (const match of returnMatches) {
      const lineNumber = jsCode.substring(0, match.index).split('\n').length;
      const line = jsCode.split('\n')[lineNumber - 1];
      console.error(`Return 语句在第 ${lineNumber} 行:`, line);
      
      // 检查 return 语句之前的大括号
      const beforeReturn = jsCode.substring(0, match.index);
      const openBracesBefore = (beforeReturn.match(/\{/g) || []).length;
      const closeBracesBefore = (beforeReturn.match(/\}/g) || []).length;
      console.error(`Return 之前的大括号: 开放 ${openBracesBefore}, 闭合 ${closeBracesBefore}`);
    }
    
    throw new Error(`Python代码转换后存在语法错误: ${syntaxError.message}。转换后的代码可能有格式问题。`);
  }
  
  try {
    return executeJavaScriptCode(jsCode, parameters, functionName);
  } catch (error) {
    console.error('Python代码转换后执行失败:', error);
    console.error('错误类型:', error.name);
    console.error('错误消息:', error.message);
    console.error('完整转换后的代码:', jsCode);
    throw error;
  }
}

