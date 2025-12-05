import type { PaymentResult, PaymentStatus, StrategyOptions, UnifiedPaymentParams } from '../types';

export type StateCallBack = (status: PaymentStatus) => void;

/**
 * 策略抽象基类
 * 类似于 Passport.js 的 Strategy 类
 */
export abstract class BaseStrategy<TConfig = any> {
  // 策略名称，用于在 Context 中作为 Key (如 'wechat', 'alipay')
  public abstract readonly name: string;

  protected config: TConfig;
  protected options: StrategyOptions;

  constructor(config: TConfig, options: StrategyOptions = {}) {
    this.config = config;
    this.options = options;
  }

  /**
   * 核心抽象方法：执行支付
   * 子类必须实现这个方法
   */
  abstract pay(params: UnifiedPaymentParams, onStateChange?: StateCallBack): Promise<PaymentResult>;

  /**
   * 定义查单的标准接口
   */

  abstract getPaymentStatus(orderId: string): Promise<PaymentResult>;

  /**
   * 钩子方法：参数预校验
   * 子类可以覆盖此方法，或者直接使用父类的通用校验
   */
  validateParams(params: UnifiedPaymentParams): void {
    if (!params.orderId) {
      throw new Error(`[${this.name}] Order ID is missing.`);
    }
    if (params.amount <= 0) {
      throw new Error(`[${this.name}] Amount must be greater than 0.`);
    }
  }

  /**
   * 辅助方法：生成标准化的成功返回
   */
  protected success(transactionId: string, raw?: any): PaymentResult {
    return { status: 'success', transactionId, raw };
  }

  /**
   * 辅助方法：生成标准化的失败返回
   */
  protected fail(message: string, raw?: any): PaymentResult {
    return { status: 'fail', message, raw };
  }
}
