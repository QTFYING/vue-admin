import type { BaseStrategy } from '../strategies/BaseStrategy';
import type { Middleware, MiddlewareContext, PaymentPlugin, PaymentResult, UnifiedPaymentParams } from '../types';
import { compose } from '../utils/compose';
import { Poller } from '../utils/Poller';
import { EventBus } from './EventBus';

export class PaymentContext extends EventBus {
  // 策略存储池：Key 是策略名，Value 是策略实例
  private strategies: Map<string, BaseStrategy> = new Map();
  // 存储注册的中间件
  private middlewares: Middleware[] = [];
  private activePoller: Poller | null = null;
  private plugins: PaymentPlugin[] = [];

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
   * 开启轮询模式
   * 适合场景：二维码展示后，由业务层手动调用，或者做成一个 Middleware 自动调用
   */
  startPolling(strategyName: string, orderId: string) {
    // 1. 防御性编程：先停掉上一个（防止多开）
    this.stopPolling();

    const strategy = this.strategies.get(strategyName);
    if (!strategy) return;

    // 2. 创建实例
    this.activePoller = new Poller({ interval: 5000 });

    console.log(`[PaymentContext] Start polling for order: ${orderId}`);
    let count = 1;

    // 3. 跑起来
    this.activePoller
      .start(
        // Task
        async () => {
          // 调用 Strategy 的查单接口
          const res = await strategy.getPaymentStatus(orderId);
          // 每查一次，抛出一个事件，UI 可以用来做“正在查询...”的动画
          this.emit('statusChange', { status: res.status, result: res });
          console.log('开始轮询查询订单状态，这是第', count++, '次查询');
          return res;
        },
        // Validator
        (res) => res.status === 'success' || res.status === 'fail',
      )
      .then((finalResult) => {
        // 4. 最终拿到结果，抛出 success/fail 事件
        if (finalResult.status === 'success') {
          this.emit('success', finalResult);
        } else {
          this.emit('fail', finalResult);
        }
      })
      .catch((err) => {
        console.warn('[PaymentContext] Polling stopped:', err.message);
      });
  }

  // 停止轮询
  stopPolling() {
    if (this.activePoller) {
      this.activePoller.stop();
      this.activePoller = null;
    }
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
