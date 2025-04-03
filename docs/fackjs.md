# 说明

以下是 vite-plugin-fake-server 插件的所有参数及其含义：

```typescript
interface FakeServerOptions {
  /**
   * 是否启用插件
   * - 默认值: `true`
   */
  enable?: boolean;

  /**
   * 是否在生产环境启用
   * - 默认值: `false`
   */
  enableProd?: boolean;

  /**
   * Mock 文件的目录路径
   * - 默认值: `'mock'`
   * - 你可以指定一个自定义的目录来存放 Mock 数据
   */
  include?: string;

  /**
   * Mock 文件的后缀名
   * - 默认值: `['.ts', '.js']`
   * - 支持的文件类型，可以指定多个后缀
   */
  extensions?: string[];

  /**
   * Mock 路由的基础路径
   * - 默认值: `''`
   * - 例如：设置为 `/api`，则所有 Mock 路由都会以 `/api` 开头
   */
  basename?: string;

  /**
   * 是否在 Mock 路由中间件中打印日志
   * - 默认值: `true`
   * - 如果设置为 `false`，则不会在控制台输出 Mock 请求的日志
   */
  logger?: boolean;

  /**
   * 是否严格模式
   * - 默认值: `false`
   * - 如果启用严格模式，插件会对 Mock 数据的定义进行更严格的校验
   */
  strict?: boolean;

  /**
   * Mock 数据的延迟时间（单位：毫秒）
   * - 默认值: `0`
   * - 用于模拟网络延迟
   */
  delay?: number;

  /**
   * 是否启用热更新
   * - 默认值: `true`
   * - 如果设置为 `false`，修改 Mock 文件后需要手动重启服务才能生效
   */
  hot?: boolean;

  /**
   * 自定义 Mock 文件的解析逻辑
   * - 默认值: `undefined`
   * - 你可以通过此选项自定义如何加载和解析 Mock 文件
   */
  parser?: (filePath: string) => any;

  /**
   * 是否使用中缀名称
   * - 默认值: 'fake'
   * - mock/user/getUser.ts -> 生成路径 /mock/user/getUser
   */
  infixName?: boolean;
}
```
