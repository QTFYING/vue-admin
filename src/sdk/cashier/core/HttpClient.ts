/**
 * HttpClient: 集成人员必须自己实现，且主动注入.
 * 客户端可根据需要自行封装诸如: axios/fetch/uni.request/wx.request.
 * 目的：定义SDK期望的HTTP抽象，供integrator.callGet/callPost为SDK内部使用的统一调用入口.
 */
export interface HttpClient {
  request?(opts: { method: string; url: string; headers?: Record<string, string>; data?: any; params?: any }): Promise<any>;
  get?(url: string, opts?: { headers?: Record<string, string>; params?: any }): Promise<any>;
  post?(url: string, data?: any, opts?: { headers?: Record<string, string>; params?: any }): Promise<any>;
}

export function callGet(http: HttpClient, url: string, opts?: any) {
  if (http.get) return http.get(url, opts);
  if (http.request) return http.request({ method: 'GET', url, headers: opts?.headers, params: opts?.params });
  throw new Error('HttpClient must implement get or request');
}

export function callPost(http: HttpClient, url: string, data?: any, opts?: any) {
  if (http.post) return http.post(url, data, opts);
  if (http.request) return http.request({ method: 'POST', url, headers: opts?.headers, data, params: opts?.params });
  throw new Error('HttpClient must implement post or request');
}
