import type { ProxyOptions } from 'vite';

// @ts-ignore
function getEnvConfig(viteEnv: ImportMetaEnv) {
  return {
    http: {
      proxy: viteEnv.VITE_HTTP_PROXY_PATH || '/api', // 默认代理路径
      url: viteEnv.VITE_HTTP_PROXY_URL || 'http://localhost:8848', // 默认代理目标地址
    },
  };
}

// @ts-ignore
function createViteProxy(viteEnv: ImportMetaEnv) {
  const isOpenProxy = viteEnv.VITE_ENABLE_HTTP_PROXY === 'true';
  if (!isOpenProxy) return undefined;

  const { http } = getEnvConfig(viteEnv);

  const proxy: Record<string, string | ProxyOptions> = {
    [http.proxy]: {
      target: http.url,
      changeOrigin: true,
      rewrite: (path) => {
        return path.replace(new RegExp(`^${http.proxy}`), '/api');
      },
      // secure: false, // 如果目标是 HTTPS，设置为 false
      // configure: (proxy, options) => {
      //   proxy.on('proxyReq', function (proxyReq, _req, _res) {
      //     const env = req.query.env;
      //     proxyReq.setHeader('Host', 'ops.citsgbt.com');
      //     if (env === 'qa') {
      //       options.target = 'http://qa.example.com';
      //     } else if (env === 'dev') {
      //       options.target = 'http://dev.example.com';
      //
      //   });
      // },
      bypass(req, res, options: any) {
        const proxyUrl = new URL(options.rewrite(req.url) || '', options.target as string)?.href || '';
        req.headers['x-req-proxyUrl'] = proxyUrl;
        res?.setHeader('x-res-proxyUrl', proxyUrl);
      },
    },
  };
  return proxy;
}

export { createViteProxy };
