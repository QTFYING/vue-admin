import type { PaymentProvider, PaymentRequest, PaymentResult } from '../types/PaymentProvider';
import type { PaymentPlugin } from '../types/PluginTypes';
import { HttpProxy } from './HttpProxy';

export class PaymentManager {
  /** channel → provider 映射 */
  private providers: Record<string, PaymentProvider> = {};

  /** 插件队列 */
  private plugins: PaymentPlugin[] = [];

  /** 注册支付 provider */
  registerProvider(channel: string, provider: PaymentProvider) {
    this.providers[channel] = provider;
    return this;
  }

  /** 插件注册：use() 是更语义化的写法 */
  use(plugin: PaymentPlugin) {
    this.plugins.push(plugin);
    return this; // 支持链式调用
  }

  /** 支付主流程 */
  async pay(request: PaymentRequest): Promise<PaymentResult> {
    const provider = this.providers[request.channel];
    console.log('xxx-1-2', HttpProxy);
    const http = HttpProxy;

    if (!http) {
      throw new Error('HttpClient 未注入，请调用 PaymentManager.setHttp()');
    }

    if (!provider) {
      return {
        status: 'FAILED',
        message: `未注册支付渠道: ${request.channel}`,
      };
    }

    let modified = { ...request };

    /** 1. beforePay 插件执行（可修改 request） */
    for (const plugin of this.plugins) {
      if (plugin.beforePay) {
        try {
          modified = await plugin.beforePay(modified, http);
        } catch (e) {
          return {
            status: 'FAILED',
            message: `插件执行失败(beforePay)：${(e as Error).message}`,
          };
        }
      }
    }

    /** 2. 调用 provider.pay */
    let result: PaymentResult;
    try {
      result = await provider.pay(modified, HttpProxy);
    } catch (e) {
      return {
        status: 'FAILED',
        message: `支付失败：${(e as Error).message}`,
      };
    }

    /** 3. afterPay 插件执行（不影响主流程） */
    for (const plugin of this.plugins) {
      if (plugin.afterPay) {
        try {
          await plugin.afterPay(modified, result, HttpProxy);
        } catch (e) {
          throw new Error(e);
        }
      }
    }

    return result;
  }
}
