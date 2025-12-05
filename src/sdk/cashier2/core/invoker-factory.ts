import { WebInvoker } from '../invokers';
import { UniAppInvoker } from '../invokers/uni-invoker';
import type { PaymentInvoker } from '../types';

// Ensure uni is declared for environment detection
declare const uni: any;

export type InvokerType = 'uniapp' | 'web' | 'mini' | '';

export class InvokerFactory {
  /**
   * 自动感知环境，返回最合适的执行器
   * @param channel
   * @param type
   */
  static create(channel: string, type?: InvokerType): PaymentInvoker {
    // 1.优先判断 UniApp (因为它全局对象比较特殊)
    if (type === 'uniapp' && uni.requestPayment) {
      return new UniAppInvoker(channel as any);
    }

    if (type === 'web') {
      return new WebInvoker(channel);
    }

    // 3. 默认回退到 Web H5
    return new WebInvoker(channel);
  }
}
