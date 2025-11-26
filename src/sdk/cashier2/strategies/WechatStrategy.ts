// src/strategies/WechatStrategy.ts
import type { PaymentResult, UnifiedPaymentParams } from '../types';
import { BaseStrategy } from './BaseStrategy';

// 定义微信策略需要的配置类型
interface WechatConfig {
  appId: string;
  mchId: string;
  notifyUrl?: string;
}

export class WechatStrategy extends BaseStrategy<WechatConfig> {
  public readonly name = 'wechat';

  async pay(params: UnifiedPaymentParams): Promise<PaymentResult> {
    // 1. 调用父类通用校验
    this.validateParams(params);

    if (this.options.debug) {
      console.log(`[WechatStrategy] Preparing payment for Order: ${params.orderId}`);
    }

    try {
      // --- 模拟：适配层逻辑 ---
      // 实际开发中，这里会调用后端 API 获取签名，或者调用 wx.chooseWXPay
      console.log(`[WechatStrategy] Signing with AppID: ${this.config.appId}...`);

      // 模拟异步 IO
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 假设这是微信 SDK 返回的原始数据
      const mockWechatResponse = {
        err_code: 'SUCCESS',
        transaction_id: '420000100020251126',
      };

      // 2. 结果标准化 (Normalization)
      if (mockWechatResponse.err_code === 'SUCCESS') {
        return this.success(mockWechatResponse.transaction_id, mockWechatResponse);
      } else {
        return this.fail('Wechat payment failed', mockWechatResponse);
      }
    } catch (error: any) {
      return {
        status: 'fail',
        message: error.message || 'Unknown error inside WechatStrategy',
      };
    }
  }
}
