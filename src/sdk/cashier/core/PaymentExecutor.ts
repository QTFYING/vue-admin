import type { HttpClient } from '../http/HttpClient';
import type { PaymentPlugin } from '../plugins/PaymentPlugin';
import type { PaymentProvider } from '../providers/PaymentProvider';
import type { PaymentRequest, PaymentResult } from '../types';
import type { IPluginContext } from '../types/PluginContext';
import { logger } from '../utils/logger';
import type { PaymentContext } from './PaymentContext';

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
            status: 'FAILED',
            message: `插件 beforePay 执行失败：${plugin.name || 'unknown'}`,
            raw: error,
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
        status: 'FAILED',
        message: '支付渠道执行失败',
        raw: error,
      };
    }

    // 3. 执行 afterPay 插件（不阻断主流程）
    for (const plugin of this.plugins) {
      if (plugin.afterPay) {
        plugin.afterPay(modifiedReq, result, this.http).catch((err) => {
          logger.log(`[plugin afterPay error] ${plugin.name}`, err);
        });
      }
    }

    return result;
  }
}
