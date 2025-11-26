/**
 * HttpClient: 集成人员必须自己实现，且主动注入.
 * 客户端可根据需要自行封装诸如: axios/fetch/uni.request/wx.request.
 * 目的：定义SDK期望的HTTP抽象，供integrator.callGet/callPost为SDK内部使用的统一调用入口.
 */

/**
 * @interface HttpClient
 * 抽象的 HTTP 客户端接口。
 * 业务方必须实现此接口，以提供 SDK 所需的 HTTP 请求能力。
 * 这样可以避免 SDK 强依赖特定的 HTTP 库（如 axios 或 fetch）。
 */
export interface HttpClient {
  /**
   * 发起 GET 请求
   * @param url 请求的 URL
   * @param options 可选的配置项（如 headers, timeout 等）
   */
  request?(opts: { method: string; url: string; headers?: Record<string, string>; data?: any; params?: any }): Promise<any>;
  /**
   * 发起 GET 请求
   * @param url 请求的 URL
   * @param options 可选的配置项（如 headers, timeout 等）
   */
  get<T = any>(url: string, options?: any): Promise<T>;
  /**
   * 发起 POST 请求
   * @param url 请求的 URL
   * @param data 要发送的数据体
   * @param options 可选的配置项
   */
  post<T = any>(url: string, data?: any, options?: any): Promise<T>;

  // ‌‌RESTful API‌ 需要补全 put, delete 等其他方法
}
