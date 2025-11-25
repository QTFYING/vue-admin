import type { HttpClient } from '../HttpClient';

export function fetchAdapter(fetchFn: any): HttpClient {
  return {
    request: async (config) => {
      const res = await fetchFn(config.url, {
        method: config.method,
        headers: config.headers,
        body: JSON.stringify(config.data),
      });
      return res.json();
    },
    get: async (url, config) => {
      fetchFn(url, { method: 'GET', headers: config.headers }).then((r) => r.json());
    },
    post: async (url, data, config) => {
      fetchFn(url, { method: 'POST', headers: config.headers, body: JSON.stringify(data) }).then((r) => r.json());
    },
  };
}
