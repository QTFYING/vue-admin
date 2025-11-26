import type { HttpClient } from '../types';

// src/adapters/uniAdapter.ts

// 假设 uni.request 的配置类型 (简化)
export interface UniRequestConfig {
  url: string;
  data?: any;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  header?: { [key: string]: string };
  // ... 其他 uni.request 参数
}

/**
 * 客户端需要传入 uni 对象 (通常是全局的 uni)。
 * @param uni 小程序环境下的 uni 对象
 * @returns 实现了 HttpClient 接口的对象
 */
export function uniAdapter(uni: {
  request: (config: UniRequestConfig & { success: (res: any) => void; fail: (res: any) => void }) => void;
}): HttpClient {
  // 核心请求封装函数，将 uni.request 转换为 Promise
  const request = (config: UniRequestConfig): Promise<any> => {
    return new Promise((resolve, reject) => {
      uni.request({
        ...config,
        success: (res) => {
          // uni.request 成功时返回状态码 200 的数据体
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            // 将非 2xx 状态码作为请求失败处理
            reject(new Error(`HTTP error! Status: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          // 网络连接或请求配置错误
          reject(err);
        },
      });
    });
  };

  return {
    async get<T>(url: string, options?: any): Promise<T> {
      return request({
        ...options,
        url,
        method: 'GET',
      });
    },

    async post<T>(url: string, data?: any, options?: any): Promise<T> {
      return request({
        ...options,
        url,
        data,
        method: 'POST',
      });
    },
  };
}
