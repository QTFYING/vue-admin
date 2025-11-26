// src/providers/PaymentProvider.ts
import type { PaymentContext } from '../core/PaymentContext';
import type { HttpClient, PaymentRequest, PaymentResult } from '../types';

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
 * @interface PaymentProvider
 * 所有支付渠道（微信、支付宝、PayPal等）必须实现的统一接口。
 */
export interface PaymentProvider {
  /**
   * 核心支付方法
   * * @param request 统一的支付请求参数（订单号、金额等）
   * @param paymentCtx 插件上下文（包含 http 实例、配置等核心依赖）
   * @returns 返回标准化的支付结果
   */
  pay(request: PaymentRequest, http: HttpClient, paymentCtx: PaymentContext): Promise<PaymentResult>;
}
