// src/plugins/PaymentPlugin.ts

import type { PaymentContext } from '../core/PaymentContext';
import type { HttpProxy } from '../http/HttpProxy';
import type { PaymentRequest, PaymentResult } from '../types';

export interface PaymentPlugin {
  name?: string;
  /**
   * 支付前置处理
   * 可以修改 request（例如积分抵扣、优惠券计算、签名等）
   */
  beforePay?(request: PaymentRequest, http: typeof HttpProxy, ctx?: PaymentContext): Promise<PaymentRequest> | PaymentRequest;

  /**
   * 支付后处理
   * 不能修改 result，但可以记录日志、上报埋点等
   */
  afterPay?(request: PaymentRequest, result: PaymentResult, http: typeof HttpProxy): Promise<void>;
}
