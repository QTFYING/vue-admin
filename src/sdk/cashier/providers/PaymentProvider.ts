// src/providers/PaymentProvider.ts
import type { PaymentContext } from '../core/PaymentContext';
import type { HttpProxy } from '../http/HttpProxy';
import type { PaymentRequest, PaymentResult } from '../types';

export interface PaymentProvider {
  /**
   * 真正调用支付渠道的支付逻辑（如微信、支付宝、小程序、三方支付）
   */
  pay(request: PaymentRequest, http: typeof HttpProxy, paymentCtx: PaymentContext): Promise<PaymentResult>;
}
