// --- HTTP 辅助方法 ---

import type { HttpClient } from '../types';

/**
 * 提供给 Strategy 调用的 HTTP 快捷入口
 * 自动解包 Axios 风格的响应
 */
export const request = async function <T>(method: 'get' | 'post', url: string, payload?: any): Promise<T> {
  try {
    const res: any = method === 'get' ? await this.http.get(url, payload) : await this.http.post(url, payload);

    // 智能解包：如果返回了 axios 结构 { data: ... }，则取 data
    if (res && typeof res === 'object' && 'data' in res && 'status' in res) {
      return res.data;
    }
    return res;
  } catch (error) {
    // 这里的错误通常由宿主的拦截器处理，SDK 只是透传
    throw error;
  }
};

export const createDefaultFetcher = function (): HttpClient {
  return {
    get: (url) => fetch(url).then((r) => r.json()),
    post: (url, body) => fetch(url, { method: 'POST', body: JSON.stringify(body) }).then((r) => r.json()),
  };
};
