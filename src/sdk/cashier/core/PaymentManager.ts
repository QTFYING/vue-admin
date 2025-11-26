import type { PaymentContext } from '../core/PaymentContext';
import { PaymentExecutor } from '../core/PaymentExecutor';
import type { PaymentPlugin } from '../plugins/PaymentPlugin';
import type { PaymentProvider, PaymentProviderType } from '../providers/PaymentProvider';
import { PaymentStatus, type HttpClient, type PaymentRequest, type PaymentResult } from '../types';

/**
 * @class PaymentManager
 * SDK 的核心协调器和门面 (Facade)。
 * 负责管理依赖、路由支付请求、执行插件链。
 */
export class PaymentManager {
  private readonly providers = new Map<PaymentProviderType, PaymentProvider>();
  private plugins: PaymentPlugin[] = [];
  private http!: HttpClient;
  /** 必需：业务方实现的客户端支付执行器 */
  private paymentCtx!: PaymentContext;

  /**
   * 初始化一个 SDK 实例（可支持多实例）
   */
  init(config: { http: HttpClient; context?: PaymentContext }) {
    this.http = config.http;
  }

  use(plugin: PaymentPlugin) {
    this.plugins.push(plugin);
    return this;
  }

  registerProvider(channel: PaymentProviderType, provider: PaymentProvider) {
    this.providers.set(channel, provider);
    return this;
  }

  /**
   * 调用支付：完全交由 PaymentExecutor 执行
   */
  async pay(request: PaymentRequest): Promise<PaymentResult> {
    const provider = this.providers.get(request.channel);

    if (!provider) {
      return {
        status: PaymentStatus['Failure'],
        channel: request.channel,
        orderId: request.orderId,
        message: `未找到支付渠道: ${request.channel}`,
      };
    }

    const executor = new PaymentExecutor(provider, this.plugins, this.http, this.paymentCtx);

    return executor.execute(request);
  }
}
