// src/providers/PaymentProvider.ts
import type { PaymentContext } from '../core/PaymentContext';
import type { HttpClient } from '../http/HttpClient';
import type { PaymentRequest, PaymentResult } from '../types';

/**
 * @enum PaymentProviderType
 * 支付渠道的枚举类型
 */
export enum PaymentProviderType {
  Wechat = 'wechat',
  Alipay = 'alipay',
  // ... 更多渠道
}
/**
 * @interface BasePaymentProvider
 * 所有支付渠道 Provider 必须实现的基类接口
 */
export interface PaymentProvider {
  /**
   * 真正调用支付渠道的支付逻辑（如微信、支付宝、小程序、三方支付）
   */
  pay(request: PaymentRequest, http: HttpClient, paymentCtx: PaymentContext): Promise<PaymentResult>;
}
