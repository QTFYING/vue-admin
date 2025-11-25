import { PaymentContext } from '../core/PaymentContext';
import { callGet, callPost } from './HttpClient';

/**
 * HttpProxy: unified network entry for the SDK.
 * - handles token injection
 * - executes registered decorators (global + instance)
 * - calls instance.onRequest / onResponse hooks
 * - calls client's get/post/request via HttpClient
 */
export const HttpProxy = {
  async request(ctxName: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, data?: any, opts?: any) {
    const ctx = PaymentContext.get(ctxName);
    const http = ctx.getHttp();
    const base = ctx.getBaseUrl();
    const fullUrl = url.startsWith('http') ? url : `${base}${url}`;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    // token injection
    try {
      const token = await ctx.getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {
      // ignore token errors
      throw new Error(e);
    }

    // execute decorators
    const decorators = ctx.getDecorators();
    for (const d of decorators) {
      try {
        await d({ url: fullUrl, method, headers, data });
      } catch (e) {
        throw new Error(e);
        // decorator errors shouldn't block main flow
      }
    }

    // instance onRequest
    try {
      await ctx.getConfig().onRequest?.({ url: fullUrl, method, headers, data });
    } catch (e) {
      throw new Error(e);
    }

    // perform request
    let res: any;
    switch (method) {
      case 'GET':
        res = await callGet(http, fullUrl, { headers, params: opts?.params });
        break;
      case 'POST':
        res = await callPost(http, fullUrl, data, { headers, params: opts?.params });
        break;
      case 'PUT':
        res = await callPost(http, fullUrl, data, { headers, params: opts?.params });
        break;
      case 'DELETE':
        res = await callGet(http, fullUrl, { headers, params: opts?.params });
        break;
      default:
        throw new Error('Unsupported method');
    }

    // response hook
    try {
      return ctx.getConfig().onResponse ? ctx.getConfig().onResponse?.(res) : res;
    } catch (e) {
      throw new Error(e);
      return res;
    }
  },

  get(ctxName: string, url: string, opts?: any) {
    return this.request(ctxName, 'GET', url, undefined, opts);
  },

  post(ctxName: string, url: string, data?: any, opts?: any) {
    return this.request(ctxName, 'POST', url, data, opts);
  },
};
