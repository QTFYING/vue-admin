// src/providers/PaymentProvider.ts
import type { PaymentContext } from '../core/PaymentContext';
import type { HttpClient } from '../http/HttpClient';
import type { PaymentRequest, PaymentResult } from '../types';

export interface PaymentProvider {
  /**
   * 真正调用支付渠道的支付逻辑（如微信、支付宝、小程序、三方支付）
   */
  pay(request: PaymentRequest, http: HttpClient, paymentCtx: PaymentContext): Promise<PaymentResult>;
}
