import type { PaymentResult, UnifiedPaymentParams } from './protocol';

// 任何想接入 SDK 的渠道必须实现这个接口
export interface IPaymentProvider {
  name: string; // e.g., 'wechat'

  // 核心能力检查 (比如某些环境不支持 H5 支付)
  checkCompatibility(): boolean;

  // 核心支付动作
  pay(params: UnifiedPaymentParams): Promise<PaymentResult>;

  // 某些场景需要轮询查单 (如二维码支付)
  query?(orderId: string): Promise<PaymentResult>;
}
