import type { PaymentResult, UnifiedPaymentParams } from './protocol';

/**
 * 运行时上下文
 * 这是中间件之间传递的数据载体
 */
export interface MiddlewareContext {
  // 当前请求的策略名称
  strategyName: string;

  // 支付入参 (中间件可以修改它，比如自动添加 token)
  params: UnifiedPaymentParams;

  // 支付结果 (初始为 undefined，执行完核心逻辑后会被填充)
  result?: PaymentResult;

  // 状态共享容器 (用于中间件之间传递自定义数据)
  state: Record<string, any>;

  // 挂载可能发生的错误
  error?: Error;
}

/**
 * next 函数定义
 * 调用它意味着“放行”，进入下一个中间件
 */
export type Next = () => Promise<void>;

/**
 * 中间件函数定义
 * 遵循 Koa 风格：async (ctx, next) => void
 */
export type Middleware = (ctx: MiddlewareContext, next: Next) => Promise<void>;
