/**
 * 数据后端配置
 * 用于配置远程 API 后端
 */

// 检查是否配置了 API
export function isApiConfigured() {
  // 默认返回 false，表示不使用远程 API
  // 如果需要配置远程 API，可以在这里添加配置逻辑
  return false;
}

// API 基础 URL（如果配置了的话）
export const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// 检查 API 是否可用
export function isApiAvailable() {
  return isApiConfigured() && API_BASE_URL;
}
