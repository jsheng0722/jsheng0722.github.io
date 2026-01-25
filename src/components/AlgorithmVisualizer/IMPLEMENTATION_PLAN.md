# 算法可视化系统 - 详细实现计划

## 📋 当前状态总结

### ✅ 已完成功能
- [x] 代码语言自动识别（JavaScript/Python）
- [x] 函数和参数提取
- [x] Python 到 JavaScript 转换
- [x] 基础步骤跟踪（数组访问、比较、交换）
- [x] 基础可视化展示
- [x] 播放控制（播放/暂停/上一步/下一步/重置）
- [x] 速度调节

### ⚠️ 部分完成功能
- [~] 步骤跟踪（已实现基础跟踪，需要增强）
- [~] 可视化效果（已实现基础效果，需要动画）

### ❌ 待实现功能
- [ ] 交换动画效果
- [ ] 比较结果可视化
- [ ] 变量值变化跟踪
- [ ] 返回值跟踪
- [ ] 错误处理优化

---

## 🎯 阶段一：核心功能完善（优先级：高）

### 任务 1.1：完善步骤跟踪机制

#### 1.1.1 实现变量值变化跟踪
**目标**：跟踪循环变量和临时变量的值变化

**实现步骤**：
1. 在 `codeExecutor.js` 中增强变量跟踪
2. 插桩循环变量赋值
3. 在可视化中显示变量值

**代码位置**：
- `src/components/AlgorithmVisualizer/codeExecutor.js` (第 103-141 行)
- 需要添加：循环变量插桩逻辑

**具体实现**：
```javascript
// 跟踪循环变量变化
instrumentedCode = instrumentedCode.replace(
  /for\s*\(let\s+(\w+)\s*=\s*([^;]+);/g,
  (match, varName, initValue) => {
    return `for (let ${varName} = (${initValue}, _trackVariableChange('${varName}', undefined, ${initValue}));`;
  }
);

// 跟踪循环变量递增
instrumentedCode = instrumentedCode.replace(
  /(\w+)\+\+/g,
  (match, varName) => {
    return `(_trackVariableChange('${varName}', ${varName}, ${varName} + 1), ${varName}++)`;
  }
);
```

**验收标准**：
- [ ] 循环变量变化能被跟踪
- [ ] 变量值在可视化中显示
- [ ] 不影响代码执行

---

#### 1.1.2 实现返回值跟踪
**目标**：跟踪函数返回值

**实现步骤**：
1. 已添加 `trackReturn` 函数
2. 需要完善 return 语句插桩
3. 在可视化中显示返回值

**代码位置**：
- `src/components/AlgorithmVisualizer/codeExecutor.js` (第 132-141 行)
- 需要修改：return 语句插桩逻辑（第 199 行附近）

**具体实现**：
```javascript
// 改进 return 语句跟踪
instrumentedCode = instrumentedCode.replace(
  /return\s+([^;]+);/g,
  (match, returnValue) => {
    // 避免在跟踪函数内部跟踪
    if (match.includes('_trackReturn')) return match;
    return `_trackReturn(${returnValue});\nreturn ${returnValue};`;
  }
);
```

**验收标准**：
- [ ] return 语句能被正确跟踪
- [ ] 返回值在可视化中显示
- [ ] 不影响代码执行

---

#### 1.1.3 实现条件判断结果跟踪
**目标**：显示条件判断的结果（true/false）

**实现步骤**：
1. 已添加 `trackCondition` 函数
2. 需要完善条件插桩
3. 在可视化中显示判断结果

**代码位置**：
- `src/components/AlgorithmVisualizer/codeExecutor.js` (第 184-199 行)
- 需要修改：条件跟踪逻辑

**具体实现**：
```javascript
// 改进条件跟踪
Object.keys(arrays).forEach(arrName => {
  instrumentedCode = instrumentedCode.replace(
    new RegExp(`if\\s*\\(([^)]*${arrName}\\[[^\\]]+\\][^)]*)\\)\\s*\\{`, 'g'),
    (match, condition) => {
      // 提取索引用于高亮
      const indexMatches = condition.match(new RegExp(`${arrName}\\s*\\[([^\\]]+)\\]`, 'g'));
      const indices = indexMatches ? indexMatches.map(m => {
        const idxMatch = m.match(/\[([^\]]+)\]/);
        return idxMatch ? idxMatch[1] : null;
      }).filter(Boolean) : [];
      
      return `${match}\n_trackCondition('${condition}', ${condition}, ${arrName}, [${indices.join(', ')}]);`;
    }
  );
});
```

**验收标准**：
- [ ] 条件判断结果能被跟踪
- [ ] 判断结果在可视化中显示
- [ ] 相关数组元素被高亮

---

### 任务 1.2：改进可视化效果

#### 1.2.1 实现交换动画
**目标**：添加流畅的元素交换动画

**实现步骤**：
1. 在 `ArrayVisualizer.js` 中添加交换动画状态
2. 使用 CSS transform 实现位置交换动画
3. 添加动画过渡效果

**代码位置**：
- `src/components/AlgorithmVisualizer/visualizers/ArrayVisualizer.js`

**具体实现**：
```javascript
// 添加交换动画状态
const [swapping, setSwapping] = useState(false);
const [swapFrom, setSwapFrom] = useState(null);
const [swapTo, setSwapTo] = useState(null);

// 检测交换步骤
useEffect(() => {
  if (steps.length > 0 && currentStep < steps.length) {
    const step = steps[currentStep];
    if (step.type === 'swap' && step.swappedIndices && step.swappedIndices.length === 2) {
      const [i, j] = step.swappedIndices;
      setSwapping(true);
      setSwapFrom(i);
      setSwapTo(j);
      
      // 动画完成后重置
      setTimeout(() => {
        setSwapping(false);
        setSwapFrom(null);
        setSwapTo(null);
      }, 500);
    }
  }
}, [currentStep, steps]);

// 在渲染时应用动画
<div
  className={`... ${swapping && (index === swapFrom || index === swapTo) ? 'animate-swap' : ''}`}
  style={{
    transform: swapping && index === swapFrom ? 'translateX(100px)' : 
               swapping && index === swapTo ? 'translateX(-100px)' : 'translateX(0)',
    transition: 'transform 0.5s ease-in-out'
  }}
>
```

**CSS 动画**（添加到全局样式）：
```css
@keyframes swap {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateY(-20px); }
}

.animate-swap {
  animation: swap 0.5s ease-in-out;
  z-index: 10;
}
```

**验收标准**：
- [ ] 交换时有流畅的动画效果
- [ ] 动画不影响其他元素
- [ ] 动画时长可配置

---

#### 1.2.2 实现比较结果可视化
**目标**：显示比较操作的结果（大于/小于/等于）

**实现步骤**：
1. 在步骤数据中添加比较结果
2. 在可视化中显示比较符号
3. 使用不同颜色表示不同结果

**代码位置**：
- `src/components/AlgorithmVisualizer/codeExecutor.js` (trackCompare 函数)
- `src/components/AlgorithmVisualizer/visualizers/ArrayVisualizer.js`

**具体实现**：
```javascript
// 在 trackCompare 中添加比较结果
const trackCompare = (arr, i, j, arrName = 'arr') => {
  if (Array.isArray(arr)) {
    const comparison = arr[i] > arr[j] ? '>' : arr[i] < arr[j] ? '<' : '===';
    const result = arr[i] > arr[j] ? 'greater' : arr[i] < arr[j] ? 'less' : 'equal';
    steps.push({
      type: 'compare',
      message: `比较 ${arrName}[${i}](${arr[i]}) ${comparison} ${arrName}[${j}](${arr[j]})`,
      array: [...arr],
      highlightedIndices: [i, j],
      stepIndex: stepIndexRef.current++,
      comparisonResult: result, // 新增
      comparisonSymbol: comparison // 新增
    });
  }
};

// 在可视化中显示比较结果
{step.type === 'compare' && step.comparisonSymbol && (
  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
    <div className={`px-2 py-1 rounded text-white text-sm ${
      step.comparisonResult === 'greater' ? 'bg-red-500' :
      step.comparisonResult === 'less' ? 'bg-blue-500' :
      'bg-green-500'
    }`}>
      {step.comparisonSymbol}
    </div>
  </div>
)}
```

**验收标准**：
- [ ] 比较结果能正确显示
- [ ] 不同结果使用不同颜色
- [ ] 比较符号清晰可见

---

#### 1.2.3 改进高亮效果
**目标**：更清晰的高亮和过渡效果

**实现步骤**：
1. 添加渐变过渡效果
2. 改进颜色方案
3. 添加边框高亮

**代码位置**：
- `src/components/AlgorithmVisualizer/visualizers/ArrayVisualizer.js`

**具体实现**：
```javascript
const getBarStyle = (index) => {
  const step = steps[currentStep];
  const baseStyle = {
    height: `${(value / maxValue) * 100}%`,
    minHeight: '30px',
    transition: 'all 0.3s ease-in-out',
  };
  
  // 添加边框高亮
  if (highlightedIndices.includes(index)) {
    baseStyle.boxShadow = '0 0 10px rgba(255, 255, 0, 0.8)';
    baseStyle.border = '2px solid yellow';
  }
  
  return baseStyle;
};
```

**验收标准**：
- [ ] 高亮效果更明显
- [ ] 过渡动画流畅
- [ ] 不影响性能

---

### 任务 1.3：完善错误处理

#### 1.3.1 优化错误提示
**目标**：提供更友好和详细的错误信息

**实现步骤**：
1. 改进错误消息格式
2. 添加错误位置信息
3. 提供修复建议

**代码位置**：
- `src/components/AlgorithmVisualizer/codeExecutor.js`
- `src/components/AlgorithmVisualizer/AlgorithmVisualizer.js`

**具体实现**：
```javascript
// 改进错误处理
catch (error) {
  let errorMessage = error.message;
  let errorDetails = '';
  
  // 解析错误信息
  if (error instanceof SyntaxError) {
    errorDetails = '语法错误：请检查代码格式';
  } else if (error instanceof ReferenceError) {
    errorDetails = '引用错误：变量未定义';
  } else if (error instanceof TypeError) {
    errorDetails = '类型错误：数据类型不匹配';
  }
  
  return {
    steps: [{
      type: 'error',
      message: `执行错误: ${errorMessage}`,
      details: errorDetails,
      array: steps.length > 0 ? steps[steps.length - 1].array : null,
      highlightedIndices: []
    }],
    finalArray: null
  };
}
```

**验收标准**：
- [ ] 错误信息清晰易懂
- [ ] 提供错误类型和位置
- [ ] 有修复建议

---

#### 1.3.2 添加执行超时控制
**目标**：防止代码执行时间过长

**实现步骤**：
1. 添加超时机制
2. 显示超时提示
3. 允许用户取消执行

**代码位置**：
- `src/components/AlgorithmVisualizer/codeExecutor.js`

**具体实现**：
```javascript
// 添加超时控制
const EXECUTION_TIMEOUT = 10000; // 10秒

try {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('代码执行超时（超过10秒）')), EXECUTION_TIMEOUT);
  });
  
  const executionPromise = new Promise((resolve, reject) => {
    try {
      const executeFunction = new Function(...Object.keys(context), instrumentedCode);
      executeFunction(...Object.values(context));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
  
  await Promise.race([executionPromise, timeoutPromise]);
} catch (error) {
  // 处理超时或执行错误
}
```

**验收标准**：
- [ ] 超时能被正确检测
- [ ] 显示超时提示
- [ ] 不影响正常执行

---

## 🎨 阶段二：用户体验提升（优先级：中）

### 任务 2.1：添加代码高亮显示

#### 2.1.1 实现当前执行行高亮
**目标**：在代码中高亮当前执行的代码行

**实现步骤**：
1. 在步骤中记录代码行号
2. 使用代码高亮库显示代码
3. 高亮当前执行行

**代码位置**：
- `src/components/AlgorithmVisualizer/AlgorithmVisualizer.js`

**验收标准**：
- [ ] 当前执行行能被高亮
- [ ] 代码可读性好
- [ ] 不影响性能

---

### 任务 2.2：添加执行进度显示

#### 2.2.1 实现进度条
**目标**：显示算法执行进度

**实现步骤**：
1. 计算执行进度
2. 显示进度条
3. 显示百分比

**代码位置**：
- `src/components/AlgorithmVisualizer/AlgorithmVisualizer.js`

**验收标准**：
- [ ] 进度条准确显示
- [ ] 进度更新及时
- [ ] 界面美观

---

### 任务 2.3：添加参数预设模板

#### 2.3.1 实现参数模板
**目标**：提供常用算法的参数模板

**实现步骤**：
1. 定义参数模板
2. 添加模板选择界面
3. 一键填充参数

**验收标准**：
- [ ] 模板覆盖常用算法
- [ ] 模板选择方便
- [ ] 模板可自定义

---

## 🚀 阶段三：功能扩展（优先级：低）

### 任务 3.1：支持更多算法类型

#### 3.1.1 实现树遍历可视化
**目标**：支持二叉树遍历算法

**验收标准**：
- [ ] 支持前序、中序、后序遍历
- [ ] 显示遍历过程
- [ ] 节点高亮清晰

---

#### 3.1.2 实现链表操作可视化
**目标**：支持链表操作算法

**验收标准**：
- [ ] 支持插入、删除、反转
- [ ] 显示指针移动
- [ ] 动画流畅

---

### 任务 3.2：性能优化

#### 3.2.1 优化大量步骤的显示
**目标**：处理大量步骤时保持流畅

**实现步骤**：
1. 实现虚拟滚动
2. 延迟渲染
3. 步骤合并

**验收标准**：
- [ ] 1000+ 步骤流畅显示
- [ ] 内存占用合理
- [ ] 不影响交互

---

## 📝 实施建议

### 开发顺序
1. **第一周**：完成阶段一的任务 1.1 和 1.2
2. **第二周**：完成阶段一的任务 1.3 和阶段二的任务 2.1
3. **第三周**：完成阶段二剩余任务
4. **第四周**：完成阶段三任务（可选）

### 测试策略
- 每个任务完成后进行单元测试
- 集成测试覆盖主要功能
- 用户测试收集反馈

### 代码规范
- 遵循现有代码风格
- 添加必要的注释
- 保持代码可读性

---

## 🎯 成功标准

### 功能完整性
- [ ] 所有高优先级任务完成
- [ ] 核心功能稳定运行
- [ ] 错误处理完善

### 用户体验
- [ ] 界面直观易用
- [ ] 动画流畅自然
- [ ] 反馈及时准确

### 性能指标
- [ ] 1000+ 步骤流畅运行
- [ ] 动画 60fps
- [ ] 内存占用 < 100MB

---

## 📚 参考资料

- React 动画库：framer-motion
- 代码高亮：react-syntax-highlighter（已使用）
- 算法可视化参考：VisuAlgo, Algorithm Visualizer

---

**最后更新**：2024年
**负责人**：开发团队
**状态**：进行中

