/**
 * API 客户端
 * 用于与远程后端 API 通信
 */

import { API_BASE_URL } from '../config/dataBackend';

export async function apiFetch(url, options = {}) {
  // 如果没有配置 API，返回一个失败的响应
  if (!API_BASE_URL) {
    return new Response(null, { status: 503, statusText: 'Service Unavailable' });
  }

  // 构建完整的 URL
  const fullUrl = url.startsWith('/') ? `${API_BASE_URL}${url}` : url;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      credentials: 'include'
    });
    return response;
  } catch (error) {
    console.error('API 请求失败:', error);
    return new Response(null, { status: 500, statusText: 'Internal Server Error' });
  }
}

export async function apiGet(url, params = {}) {
  const urlParams = new URLSearchParams(params);
  const fullUrl = `${url}?${urlParams.toString()}`;
  return apiFetch(fullUrl, { method: 'GET' });
}

export async function apiPost(url, body = {}) {
  return apiFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}

export async function apiPut(url, body = {}) {
  return apiFetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}

export async function apiDelete(url) {
  return apiFetch(url, { method: 'DELETE' });
}
