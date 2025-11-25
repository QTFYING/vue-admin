/**
 * HttpClient: 集成人员必须自己实现，且主动注入.
 * 客户端可根据需要自行封装诸如: axios/fetch/uni.request/wx.request.
 * 目的：定义SDK期望的HTTP抽象，供integrator.callGet/callPost为SDK内部使用的统一调用入口.
 */
export interface HttpClient {
  request?(opts: { method: string; url: string; headers?: Record<string, string>; data?: any; params?: any }): Promise<any>;
  get?(url: string, params?: any): Promise<any>;
  post?(url: string, params?: any): Promise<any>;
}
