import type { HttpClient } from '../types';

export function axiosAdapter(axiosInstance: any): HttpClient {
  return {
    request: (config) => axiosInstance.request(config),
    get: (url, cfg) => axiosInstance.get(url, cfg),
    post: (url, data, cfg) => axiosInstance.post(url, data, cfg),
  };
}
