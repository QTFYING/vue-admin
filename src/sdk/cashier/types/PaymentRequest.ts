import type { PaymentProviderType } from '../providers/PaymentProvider';

/**
 * @interface PaymentRequest
 * 统一的支付请求对象。这是 PaymentManager 接收的入口参数。
 */
export interface PaymentRequest {
  /** 必需：指定本次支付使用的渠道 */
  channel: PaymentProviderType;
  /** 必需：本次支付的业务订单 ID */
  orderId: string;
  /** 必需：支付总金额 (单位：分) */
  amount: number;
  /** 可选：附加信息，会被传递给 Plugins 或 PaymentProvider */
  metadata?: Record<string, any>;
  /**
   * 可选：如果 Provider 需要特定的支付参数（如 AppId, SubType），
   * 可以在这里传递给 Provider。
   */
  providerSpecificParams?: Record<string, any>;
}
