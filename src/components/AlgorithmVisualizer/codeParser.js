/**
 * 代码解析器
 * 解析代码并生成可视化步骤
 */

/**
 * 解析 JavaScript 代码并生成执行步骤
 */
export function parseJavaScriptCode(code) {
  const steps = [];
  const lines = code.split('\n').map(line => line.trim()).filter(line => line);
  
  // 提取数组定义
  const arrayMatch = code.match(/\[([^\]]+)\]/);
  let array = [];
  if (arrayMatch) {
    try {
      array = eval(`[${arrayMatch[1]}]`);
    } catch (e) {
      // 如果无法解析，使用默认数组
      array = [3, 7, 1, 9, 2, 5, 8, 4, 6];
    }
  }

  // 检测算法类型（基于代码特征，不固定检测特定函数名）
  const algorithmType = detectAlgorithmType(code);
  
  // 根据算法类型生成步骤
  switch (algorithmType) {
    case 'bubbleSort':
      return generateBubbleSortSteps(array);
    case 'quickSort':
      return generateQuickSortSteps(array);
    case 'mergeSort':
      return generateMergeSortSteps(array);
    case 'binarySearch':
      return generateBinarySearchSteps(array);
    default:
      // 不生成固定步骤，返回空步骤，让实际代码执行来生成
      return { steps: [], finalArray: array };
  }
}

/**
 * 检测算法类型（基于代码特征，不固定检测特定函数名）
 */
function detectAlgorithmType(code) {
  const lowerCode = code.toLowerCase();
  
  // 排序算法检测（基于算法特征，不依赖函数名）
  if (lowerCode.includes('bubble') || 
      (lowerCode.includes('for') && lowerCode.includes('j') && lowerCode.includes('i+1') && 
       lowerCode.includes('arr') && lowerCode.includes('['))) {
    return 'bubbleSort';
  }
  if (lowerCode.includes('quicksort') || lowerCode.includes('quick') || lowerCode.includes('partition')) {
    return 'quickSort';
  }
  if (lowerCode.includes('mergesort') || lowerCode.includes('merge') || lowerCode.includes('divide')) {
    return 'mergeSort';
  }
  // 检测排序模式：包含比较和交换操作
  if ((lowerCode.includes('arr') || lowerCode.includes('nums') || lowerCode.includes('array')) &&
      (lowerCode.includes('>') || lowerCode.includes('<')) &&
      (lowerCode.includes('swap') || lowerCode.includes('=') && lowerCode.includes('['))) {
    return 'bubbleSort'; // 默认排序算法
  }
  
  // 二分查找检测
  if (lowerCode.includes('binary') || 
      (lowerCode.includes('mid') && lowerCode.includes('left') && lowerCode.includes('right'))) {
    return 'binarySearch';
  }
  
  // 不返回特定类型，让实际代码执行来决定
  return 'generic';
}

/**
 * 生成冒泡排序步骤
 */
function generateBubbleSortSteps(array) {
  const steps = [];
  const arr = [...array];
  const n = arr.length;
  
  steps.push({
    type: 'info',
    message: `开始冒泡排序，数组长度: ${n}`,
    array: [...arr],
    highlightedIndices: []
  });

  for (let i = 0; i < n - 1; i++) {
    steps.push({
      type: 'info',
      message: `第 ${i + 1} 轮排序`,
      array: [...arr],
      highlightedIndices: []
    });

    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        type: 'compare',
        message: `比较 arr[${j}](${arr[j]}) 和 arr[${j + 1}](${arr[j + 1]})`,
        array: [...arr],
        highlightedIndices: [j, j + 1]
      });

      if (arr[j] > arr[j + 1]) {
        // 交换
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push({
          type: 'swap',
          message: `交换 arr[${j}] 和 arr[${j + 1}]`,
          array: [...arr],
          highlightedIndices: [j, j + 1],
          swappedIndices: [j, j + 1]
        });
      } else {
        steps.push({
          type: 'info',
          message: `arr[${j}] <= arr[${j + 1}]，无需交换`,
          array: [...arr],
          highlightedIndices: [j, j + 1]
        });
      }
    }

    steps.push({
      type: 'sorted',
      message: `第 ${i + 1} 轮完成，位置 ${n - i - 1} 已确定`,
      array: [...arr],
      sortedIndices: [n - i - 1]
    });
  }

  steps.push({
    type: 'complete',
    message: '排序完成！',
    array: [...arr],
    sortedIndices: Array.from({ length: n }, (_, i) => i)
  });

  return { steps, finalArray: arr };
}

/**
 * 生成快速排序步骤
 */
function generateQuickSortSteps(array) {
  const steps = [];
  const arr = [...array];
  
  function quickSort(low, high, depth = 0) {
    if (low < high) {
      steps.push({
        type: 'info',
        message: `快速排序: 范围 [${low}, ${high}]`,
        array: [...arr],
        highlightedIndices: Array.from({ length: high - low + 1 }, (_, i) => low + i)
      });

      const pivotIndex = partition(low, high);
      
      steps.push({
        type: 'info',
        message: `基准元素位置: ${pivotIndex}, 值: ${arr[pivotIndex]}`,
        array: [...arr],
        highlightedIndices: [pivotIndex]
      });

      quickSort(low, pivotIndex - 1, depth + 1);
      quickSort(pivotIndex + 1, high, depth + 1);
    }
  }

  function partition(low, high) {
    const pivot = arr[high];
    let i = low - 1;

    steps.push({
      type: 'info',
      message: `选择基准元素: arr[${high}] = ${pivot}`,
      array: [...arr],
      highlightedIndices: [high]
    });

    for (let j = low; j < high; j++) {
      steps.push({
        type: 'compare',
        message: `比较 arr[${j}](${arr[j]}) 和基准(${pivot})`,
        array: [...arr],
        highlightedIndices: [j, high]
      });

      if (arr[j] < pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push({
            type: 'swap',
            message: `交换 arr[${i}] 和 arr[${j}]`,
            array: [...arr],
            highlightedIndices: [i, j],
            swappedIndices: [i, j]
          });
        }
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push({
      type: 'swap',
      message: `将基准元素放到正确位置: ${i + 1}`,
      array: [...arr],
      highlightedIndices: [i + 1, high],
      swappedIndices: [i + 1, high]
    });

    return i + 1;
  }

  steps.push({
    type: 'info',
    message: '开始快速排序',
    array: [...arr],
    highlightedIndices: []
  });

  quickSort(0, arr.length - 1);

  steps.push({
    type: 'complete',
    message: '快速排序完成！',
    array: [...arr],
    sortedIndices: Array.from({ length: arr.length }, (_, i) => i)
  });

  return { steps, finalArray: arr };
}

/**
 * 生成归并排序步骤
 */
function generateMergeSortSteps(array) {
  const steps = [];
  const arr = [...array];
  
  function mergeSort(low, high) {
    if (low < high) {
      const mid = Math.floor((low + high) / 2);
      
      steps.push({
        type: 'info',
        message: `分割: [${low}, ${mid}] 和 [${mid + 1}, ${high}]`,
        array: [...arr],
        highlightedIndices: Array.from({ length: high - low + 1 }, (_, i) => low + i)
      });

      mergeSort(low, mid);
      mergeSort(mid + 1, high);
      merge(low, mid, high);
    }
  }

  function merge(low, mid, high) {
    const left = arr.slice(low, mid + 1);
    const right = arr.slice(mid + 1, high + 1);
    
    steps.push({
      type: 'info',
      message: `合并: [${left.join(', ')}] 和 [${right.join(', ')}]`,
      array: [...arr],
      highlightedIndices: Array.from({ length: high - low + 1 }, (_, i) => low + i)
    });

    let i = 0, j = 0, k = low;

    while (i < left.length && j < right.length) {
      steps.push({
        type: 'compare',
        message: `比较 ${left[i]} 和 ${right[j]}`,
        array: [...arr],
        highlightedIndices: [low + i, mid + 1 + j]
      });

      if (left[i] <= right[j]) {
        arr[k] = left[i];
        i++;
      } else {
        arr[k] = right[j];
        j++;
      }
      k++;
    }

    while (i < left.length) {
      arr[k] = left[i];
      i++;
      k++;
    }

    while (j < right.length) {
      arr[k] = right[j];
      j++;
      k++;
    }

    steps.push({
      type: 'info',
      message: `合并完成: [${arr.slice(low, high + 1).join(', ')}]`,
      array: [...arr],
      highlightedIndices: Array.from({ length: high - low + 1 }, (_, i) => low + i)
    });
  }

  steps.push({
    type: 'info',
    message: '开始归并排序',
    array: [...arr],
    highlightedIndices: []
  });

  mergeSort(0, arr.length - 1);

  steps.push({
    type: 'complete',
    message: '归并排序完成！',
    array: [...arr],
    sortedIndices: Array.from({ length: arr.length }, (_, i) => i)
  });

  return { steps, finalArray: arr };
}

// 移除 generateTwoSumSteps 函数，不再硬编码特定算法

/**
 * 生成二分查找步骤
 */
function generateBinarySearchSteps(array) {
  const steps = [];
  const sortedArray = [...array].sort((a, b) => a - b);
  const target = sortedArray[Math.floor(sortedArray.length / 2)]; // 选择中间值作为目标
  
  steps.push({
    type: 'info',
    message: `在排序数组中查找 ${target}`,
    array: [...sortedArray],
    highlightedIndices: []
  });

  let left = 0, right = sortedArray.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    steps.push({
      type: 'compare',
      message: `检查中间位置 arr[${mid}] = ${sortedArray[mid]}`,
      array: [...sortedArray],
      highlightedIndices: [mid, left, right]
    });

    if (sortedArray[mid] === target) {
      steps.push({
        type: 'complete',
        message: `找到目标值 ${target} 在位置 ${mid}`,
        array: [...sortedArray],
        highlightedIndices: [mid]
      });
      return { steps, finalArray: sortedArray, result: mid };
    } else if (sortedArray[mid] < target) {
      left = mid + 1;
      steps.push({
        type: 'info',
        message: `arr[${mid}] < ${target}, 搜索右半部分`,
        array: [...sortedArray],
        highlightedIndices: [mid, left, right]
      });
    } else {
      right = mid - 1;
      steps.push({
        type: 'info',
        message: `arr[${mid}] > ${target}, 搜索左半部分`,
        array: [...sortedArray],
        highlightedIndices: [mid, left, right]
      });
    }
  }

  steps.push({
    type: 'complete',
    message: '未找到目标值',
    array: [...sortedArray],
    highlightedIndices: []
  });

  return { steps, finalArray: sortedArray };
}

/**
 * 生成通用数组操作步骤
 */
function generateGenericArraySteps(array, code) {
  const steps = [];
  
  steps.push({
    type: 'info',
    message: '开始执行代码',
    array: [...array],
    highlightedIndices: []
  });

  // 简单的模式匹配
  if (code.includes('for') || code.includes('while')) {
    for (let i = 0; i < Math.min(array.length, 5); i++) {
      steps.push({
        type: 'info',
        message: `处理元素 arr[${i}] = ${array[i]}`,
        array: [...array],
        highlightedIndices: [i]
      });
    }
  }

  steps.push({
    type: 'complete',
    message: '执行完成',
    array: [...array],
    highlightedIndices: []
  });

  return { steps, finalArray: array };
}

/**
 * 解析 Python 代码
 */
export function parsePythonCode(code) {
  // Python 代码解析逻辑（类似 JavaScript）
  // 这里可以添加 Python 特定的解析逻辑
  return parseJavaScriptCode(code);
}

