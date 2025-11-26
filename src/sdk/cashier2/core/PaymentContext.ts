import type { BaseStrategy } from '../strategies/BaseStrategy';
import type { PaymentResult, UnifiedPaymentParams } from '../types/protocol';
import { EventBus } from './EventBus';

export class PaymentContext extends EventBus {
  // 策略存储池：Key 是策略名，Value 是策略实例
  private strategies: Map<string, BaseStrategy> = new Map();

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
   * 核心执行方法 (execute)
   * 根据 strategyName 动态分发任务
   */
  async execute(strategyName: string, params: UnifiedPaymentParams): Promise<PaymentResult> {
    // 1. 触发 beforePay
    this.emit('beforePay', params);

    const strategy = this.strategies.get(strategyName);

    if (!strategy) {
      const available = Array.from(this.strategies.keys()).join(', ');
      throw new Error(`[PaymentContext] Strategy "${strategyName}" not found. Available strategies: [${available}]`);
    }

    // 这里可以添加全局的前置拦截逻辑 (Global Interceptors)
    // console.log('Global Log: Payment Started');

    try {
      const result = await strategy.pay(params);
      this.emit('success', result);
      return result;
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
