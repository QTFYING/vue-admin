import type { PaymentResult, UnifiedPaymentParams } from '../types';
import { BaseStrategy } from './BaseStrategy';

// 定义支付宝策略需要的配置类型
interface AlipayConfig {
  appId: string;
  mchId: string;
  notifyUrl?: string;
}

export class AlipayStrategy extends BaseStrategy<AlipayConfig> {
  public readonly name = 'alipay';

  async pay(params: UnifiedPaymentParams): Promise<PaymentResult> {
    console.log(`[WechatStrategy] 开始处理订单: ${params.orderId}`);

    // 1. 这里写微信特有的逻辑：参数转换 -> 签名 -> 调起微信JSSDK
    // const payload = this.transformToWechatPayload(params);

    // 模拟返回
    return {
      status: 'success',
      transactionId: `wx_${Date.now()}`,
      message: '支付宝支付唤起成功',
    };
  }
}
