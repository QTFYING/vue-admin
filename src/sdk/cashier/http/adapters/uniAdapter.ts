import type { HttpClient } from '../HttpClient';

export function uniAdapter(uni: any): HttpClient {
  return {
    request: (config) =>
      new Promise((resolve, reject) =>
        uni.request({
          ...config,
          success: resolve,
          fail: reject,
        }),
      ),
    get: (url, cfg) => uni.request({ ...cfg, url, method: 'GET' }),
    post: (url, data, cfg) => uni.request({ ...cfg, url, data, method: 'POST' }),
  };
}
