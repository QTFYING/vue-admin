import type { HttpProxy } from '../HttpProxy';

export function axiosAdapter(axiosInstance: any): typeof HttpProxy {
  return {
    request: (config) => axiosInstance.request(config),
    get: (url, cfg) => axiosInstance.get(url, cfg),
    post: (url, data, cfg) => axiosInstance.post(url, data, cfg),
  };
}
