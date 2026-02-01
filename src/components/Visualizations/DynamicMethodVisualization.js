import React, { useMemo } from 'react';
import { detectAlgorithmPattern } from './algorithmPatterns';
import {
  SingleLoopViz,
  DoubleLoopViz,
  LoopWithConditionViz,
  StepByStepViz,
  GenericFallback,
} from './VizComponents';

/**
 * 根据方法体自动检测算法模式，并渲染对应的通用可视化组件。
 * 支持：双重循环、单循环+判断、单循环、步骤执行、通用占位。
 */
function DynamicMethodVisualization({ methodKey, method, getParam, getRuns, onReturnValue, returnBoxRef, scrollToRunIndex, onCenterView }) {
  const patternInfo = useMemo(
    () => detectAlgorithmPattern(method?.body || [], method?.params),
    [method?.body, method?.params]
  );
  const { pattern } = patternInfo;

  const commonProps = { methodKey, method, getParam, getRuns, patternInfo };

  if (pattern === 'step_execution') {
    return (
      <StepByStepViz
        {...commonProps}
        onReturnValue={onReturnValue}
        returnBoxRef={returnBoxRef}
        scrollToRunIndex={scrollToRunIndex}
        onCenterView={onCenterView}
      />
    );
  }

  if (pattern === 'double_loop') {
    return (
      <DoubleLoopViz
        {...commonProps}
        onReturnValue={onReturnValue}
        returnBoxRef={returnBoxRef}
      />
    );
  }

  if (pattern === 'loop_with_condition') {
    return (
      <LoopWithConditionViz
        {...commonProps}
        onReturnValue={onReturnValue}
        returnBoxRef={returnBoxRef}
      />
    );
  }

  if (pattern === 'single_loop') {
    return (
      <SingleLoopViz
        {...commonProps}
        onReturnValue={onReturnValue}
        returnBoxRef={returnBoxRef}
      />
    );
  }

  if (pattern === 'condition_only') {
    return (
      <LoopWithConditionViz
        {...commonProps}
        onReturnValue={onReturnValue}
        returnBoxRef={returnBoxRef}
      />
    );
  }

  return (
    <GenericFallback
      {...commonProps}
      onReturnValue={onReturnValue}
      returnBoxRef={returnBoxRef}
    />
  );
}

export default DynamicMethodVisualization;
