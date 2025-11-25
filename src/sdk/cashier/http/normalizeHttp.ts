import { axiosAdapter } from './adapters/axiosAdapter';
import { fetchAdapter } from './adapters/fetchAdapter';
import { uniAdapter } from './adapters/uniAdapter';
import type { HttpClient } from './HttpClient';

export function normalizeHttp(httpInstance: any): HttpClient {
  // 1. axios 检测
  if (httpInstance?.request && httpInstance?.get) {
    return axiosAdapter(httpInstance);
  }

  // 2. fetch 检测
  if (typeof httpInstance === 'function') {
    return fetchAdapter(httpInstance);
  }

  // 3. uni.request 检测
  if (httpInstance?.request && !httpInstance.get) {
    return uniAdapter(httpInstance);
  }

  throw new Error('Unknown http client type: cannot normalize.');
}
