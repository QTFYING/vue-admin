import type { BaseStrategy } from '../strategies/BaseStrategy';
import type { Middleware, MiddlewareContext } from '../types/middleware';
import type { PaymentResult, UnifiedPaymentParams } from '../types/protocol';
import { compose } from '../utils/compose';
import { EventBus } from './EventBus';

export class PaymentContext extends EventBus {
  // 策略存储池：Key 是策略名，Value 是策略实例
  private strategies: Map<string, BaseStrategy> = new Map();
  // 存储注册的中间件
  private middlewares: Middleware[] = [];

  /**
   * 注册策略 (use)
   * 允许链式调用: ctx.use(s1).use(s2)
   */
  use(strategy: BaseStrategy): this {
    if (this.strategies.has(strategy.name)) {
      console.warn(`[PaymentContext] Strategy "${strategy.name}" is being overwritten.`);
    }
    this.strategies.set(strategy.name, strategy);
    return this;
  }

  /**
   * [新增] 注册中间件
   * 类似 Koa 的 app.use()
   */
  useMiddleware(fn: Middleware): this {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!');
    this.middlewares.push(fn);
    return this;
  }

  /**
   * 核心执行方法 (execute)
   * 根据 strategyName 动态分发任务
   */
  async execute(strategyName: string, params: UnifiedPaymentParams): Promise<PaymentResult> {
    // 1. 触发 beforePay
    this.emit('beforePay', params);

    const strategy = this.strategies.get(strategyName);

    if (!strategy) {
      throw new Error(`Strategy "${strategyName}" not found. `);
    }

    // 1. 初始化运行时上下文
    const ctx: MiddlewareContext = { strategyName, params, state: {}, result: undefined };

    // 2. 构造洋葱圈的核心：真实支付动作
    // 这个函数会作为“最后一个 next”被调用
    const corePaymentAction = async () => {
      this.emit('payStart', { strategyName });
      // 执行具体策略
      ctx.result = await strategy.pay(ctx.params);
    };

    try {
      // 3. 组合并执行
      // compose 返回一个 runner，我们把 corePaymentAction 传进去作为终点
      const runner = compose(this.middlewares);
      await runner(ctx, corePaymentAction);

      // 4. 确保有结果 (如果中间件拦截了但没给结果，或者策略报错)
      if (!ctx.result) {
        throw new Error('Payment flow completed but no result was returned.');
      }

      // 5. 触发成功事件 (此时已经是所有中间件跑完之后了)
      if (ctx.result.status === 'success') {
        this.emit('success', ctx.result);
      } else {
        this.emit('fail', ctx.result);
      }

      return ctx.result;
    } catch (error) {
      console.warn('Some error occurred:', error);
      return { status: 'fail', message: 'Internal SDK Error' };
    }
  }

  /**
   * 获取已注册的策略列表
   */
  getRegisteredStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
}
