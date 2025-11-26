import type { HttpClient } from '../http/HttpClient';
import type { PaymentPlugin } from '../plugins/PaymentPlugin';
import type { PaymentProvider } from '../providers/PaymentProvider';
import type { PaymentRequest, PaymentResult } from '../types';
import type { PaymentExecutorResult } from '../types/PaymentExecutorResult';
import { PaymentStatus } from '../types/PaymentResult';
import type { IPluginContext } from '../types/PluginContext';
import { logger } from '../utils/logger';
import type { PaymentContext } from './PaymentContext';

/**
 * @interface IPaymentExecutor
 * 核心执行器接口。
 * * 它的职责是：接收“支付参数”，唤起“支付界面”，返回“支付结果”。
 * 具体的实现（如 UniAppExecutor, H5Executor）由业务方或 SDK 的 presets 目录提供。
 */
export interface IPaymentExecutor {
  /**
   * 执行支付
   * @param params 支付参数 (由 PaymentProvider 生成，例如微信的 timeStamp, nonceStr 等)
   * @returns 返回一个 Promise，解析为标准化的结果
   */
  execute(params: any): Promise<PaymentExecutorResult>;
}

/**
 * 支付执行器：负责 orchestrate 支付全流程（插件前置 → provider.pay → 插件后置）
 */
export class PaymentExecutor {
  constructor(
    private provider: PaymentProvider,
    private plugins: PaymentPlugin[],
    private http: HttpClient,
    private paymentCtx: PaymentContext, // 单次支付上下文
    private pluginCtx: IPluginContext, // 插件运行上下文
  ) {}

  /**
   * 统一执行支付流程
   */
  async execute(request: PaymentRequest): Promise<PaymentResult> {
    let modifiedReq = { ...request };

    // 1. 执行 beforePay 插件
    for (const plugin of this.plugins) {
      if (plugin.beforePay) {
        try {
          modifiedReq = await plugin.beforePay(modifiedReq, this.http, this.paymentCtx);
        } catch (error) {
          return {
            channel: request.channel,
            orderId: request.orderId,
            status: PaymentStatus['Failure'],
            message: error.message ?? '失败',
          };
        }
      }
    }

    // 2. 执行 provider 的支付方法
    let result: PaymentResult;

    try {
      result = await this.provider.pay(modifiedReq, this.http, this.paymentCtx);
    } catch (error) {
      return {
        channel: request.channel,
        orderId: request.orderId,
        status: PaymentStatus['Failure'],
        message: error.message ?? '失败',
      };
    }

    // 3. 执行 afterPay 插件（不阻断主流程）
    for (const plugin of this.plugins) {
      if (plugin.afterPay) {
        plugin.afterPay(modifiedReq, result, this.http, this.paymentCtx).catch((err) => {
          logger.log(`[plugin afterPay error] ${plugin.name}`, err);
        });
      }
    }

    return result;
  }
}
