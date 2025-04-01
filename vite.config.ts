import { type ConfigEnv, loadEnv, type ProxyOptions, type UserConfigExport } from 'vite';
import { exclude, include } from './build/optimize';
import { getPluginsList } from './build/plugins';
import { __APP_INFO__, alias, pathResolve, root, wrapperEnv } from './build/utils';

function getEnvConfig(viteEnv: ImportMetaEnv) {
  return {
    http: {
      proxy: viteEnv.VITE_HTTP_PROXY_PATH || '/api', // 默认代理路径
      url: viteEnv.VITE_HTTP_PROXY_URL || 'http://localhost:8848', // 默认代理目标地址
    },
  };
}

function createViteProxy(viteEnv: ImportMetaEnv) {
  const isOpenProxy = viteEnv.VITE_HTTP_PROXY === 'true';
  if (!isOpenProxy) return undefined;

  const { http } = getEnvConfig(viteEnv);

  const proxy: Record<string, string | ProxyOptions> = {
    [http.proxy]: {
      target: http.url,
      changeOrigin: true,
      rewrite: (path) => {
        return path.replace(new RegExp(`^${http.proxy}`), '/data');
      },
      secure: false, // 如果目标是 HTTPS，设置为 false
      bypass(req, res, options) {
        //@ts-ignore
        const proxyUrl = new URL(options.rewrite(req.url) || '', options.target as string)?.href || '';
        req.headers['x-req-proxyUrl'] = proxyUrl;
        res.setHeader('x-res-proxyUrl', proxyUrl);
      },
    },
  };
  return proxy;
}

export default ({ mode }: ConfigEnv): UserConfigExport => {
  const { VITE_CDN, VITE_PORT, VITE_COMPRESSION, VITE_PUBLIC_PATH } = wrapperEnv(loadEnv(mode, root));
  const viteEnv = loadEnv(mode, root) as ImportMetaEnv;
  return {
    base: VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias,
    },
    // 服务端渲染
    server: {
      // 端口号
      port: VITE_PORT,
      host: '0.0.0.0',
      // 本地跨域代理 https://cn.vitejs.dev/config/server-options.html#server-proxy
      proxy: createViteProxy(viteEnv),
      // proxy: {
      //   '/api': {
      //     target: 'http://10.10.34.110:8080', // 后台地址
      //     changeOrigin: true, // 表示开启代理, 允许跨域请求数据
      //     rewrite: (path) => {
      //       console.log('xxxx-1', path);
      //       return path.replace(/^\/api/, '/api');
      //     },
      //   },
      // },
      // 预热文件以提前转换和缓存结果，降低启动期间的初始页面加载时长并防止转换瀑布
      warmup: {
        clientFiles: ['./index.html', './src/{pages,components}/*'],
      },
    },
    plugins: getPluginsList(VITE_CDN, VITE_COMPRESSION),
    // https://cn.vitejs.dev/config/dep-optimization-options.html#dep-optimization-options
    optimizeDeps: {
      include,
      exclude,
    },
    build: {
      // https://cn.vitejs.dev/guide/build.html#browser-compatibility
      target: 'es2015',
      sourcemap: false,
      // 消除打包大小超过500kb警告
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        input: {
          index: pathResolve('./index.html', import.meta.url),
        },
        // 静态资源分类打包
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        },
      },
    },
    define: {
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
  };
};
