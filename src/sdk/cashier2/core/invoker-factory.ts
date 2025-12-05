import { WebInvoker } from '../invokers';
import { UniAppInvoker } from '../invokers/uni-invoker';
import type { PaymentInvoker } from '../types';

declare const uni: any;

export class InvokerFactory {
  /**
   * 自动感知环境，返回最合适的执行器
   */
  static create(channel: 'wxpay' | 'alipay'): PaymentInvoker {
    // 1. 优先判断 UniApp (因为它全局对象比较特殊)
    if (typeof uni !== 'undefined' && uni.requestPayment) {
      return new UniAppInvoker(channel);
    }

    // 3. 默认回退到 Web H5
    return new WebInvoker(channel);
  }

  public logger() {}
}
