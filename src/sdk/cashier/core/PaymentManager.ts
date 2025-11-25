import type { PaymentContext } from '../core/PaymentContext';
import { PaymentExecutor } from '../core/PaymentExecutor';
import type { HttpClient } from '../http/HttpClient';
import type { PaymentPlugin } from '../plugins/PaymentPlugin';
import type { PaymentProvider } from '../providers/PaymentProvider';
import { PaymentStatus, type PaymentRequest, type PaymentResult } from '../types';
import type { IPluginContext } from '../types/PluginContext';

export class PaymentManager {
  private providers: Record<string, PaymentProvider> = {};
  private plugins: PaymentPlugin[] = [];
  private http!: HttpClient;
  private paymentCtx!: PaymentContext;
  private pluginsCtx!: IPluginContext;

  /**
   * 初始化一个 SDK 实例（可支持多实例）
   */
  init(config: { http: HttpClient; context?: PaymentContext }) {
    this.http = config.http;
    this.paymentCtx = config.context;
  }

  use(plugin: PaymentPlugin) {
    this.plugins.push(plugin);
    return this;
  }

  registerProvider(channel: string, provider: PaymentProvider) {
    this.providers[channel] = provider;
    return this;
  }

  /**
   * 调用支付：完全交由 PaymentExecutor 执行
   */
  async pay(request: PaymentRequest): Promise<PaymentResult> {
    const provider = this.providers[request.channel];
    if (!provider) {
      return {
        channel: request.channel,
        status: PaymentStatus['Failure'],
        orderId: request.orderId,
        message: `未找到支付渠道: ${request.channel}`,
      };
    }

    const executor = new PaymentExecutor(provider, this.plugins, this.http, this.paymentCtx, this.pluginsCtx);

    return executor.execute(request);
  }
}
