import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { visualizer } from 'rollup-plugin-visualizer';
import Icons from 'unplugin-icons/vite';
import type { PluginOption } from 'vite';
import { vitePluginFakeServer } from 'vite-plugin-fake-server';
import removeConsole from 'vite-plugin-remove-console';
import removeNoMatch from 'vite-plugin-router-warn';
import svgLoader from 'vite-svg-loader';
import { cdn } from './cdn';
import { configCompressPlugin } from './compress';
import { viteBuildInfo } from './info';

export function getPluginsList(
  VITE_CDN: boolean,
  VITE_COMPRESSION: ViteCompression,
  VITE_ENABLE_HTTP_PROXY: `${boolean}`,
): PluginOption[] {
  const lifecycle = process.env.npm_lifecycle_event;
  return [
    vue(),
    // jsx、tsx语法支持
    vueJsx(),
    tailwindcss(),
    /**
     * 在页面上按住组合键时，鼠标在页面移动即会在 DOM 上出现遮罩层并显示相关信息，点击一下将自动打开 IDE 并将光标定位到元素对应的代码位置
     * Mac 默认组合键 Option + Shift
     * Windows 默认组合键 Alt + Shift
     * 更多用法看 https://inspector.fe-dev.cn/guide/start.html
     */
    codeInspectorPlugin({
      bundler: 'vite',
      hideConsole: true,
    }),
    viteBuildInfo(),
    /**
     * 开发环境下移除非必要的vue-router动态路由警告No match found for location with path
     * 非必要具体看 https://github.com/vuejs/router/issues/521 和 https://github.com/vuejs/router/issues/359
     * vite-plugin-router-warn只在开发环境下启用，只处理vue-router文件并且只在服务启动或重启时运行一次，性能消耗可忽略不计
     */
    removeNoMatch(),
    // mock支持
    vitePluginFakeServer({
      logger: false,
      include: 'mock',
      infixName: false,
      basename: 'api',
      enableProd: false,
      enableDev: !(`${VITE_ENABLE_HTTP_PROXY}` === 'true'),
      timeout: 1000,
    }),
    // svg组件化支持
    svgLoader(),
    // 自动按需加载图标
    Icons({ compiler: 'vue3', scale: 1 }),
    VITE_CDN ? cdn : null,
    configCompressPlugin(VITE_COMPRESSION),
    // 线上环境删除console
    removeConsole({ external: ['src/assets/iconfont/iconfont.js'] }),
    // 打包分析
    lifecycle === 'report' ? visualizer({ open: true, brotliSize: true, filename: 'report.html' }) : (null as any),
    // API代理
    {
      /**
       * 配置服务器中间件
       *
       * @param server 服务器实例
       */
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const env: string = req?.headers?.['x-request-env'] as '';

          const enums = {
            qa: 'http://ops.citsgbt.com',
            dev: 'http://ops.citsgbt.com',
          };

          const target = env ? enums[env] : '';

          if (target && env && env !== 'me') {
            const proxy = createProxyMiddleware({
              target: enums[env],
              changeOrigin: true,
              pathRewrite: { '^/api': '/api' },
            });

            return proxy(req, res, next);
          }

          next();
        });
      },
    },
  ];
}
