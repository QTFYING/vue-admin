import type { PaymentProviderType } from '../providers/PaymentProvider';

/**
 * @enum PaymentStatus
 * 支付操作的最终状态
 */
export enum PaymentStatus {
  Success = 'SUCCESS', // 支付成功
  Pending = 'PENDING', // 支付中（例如：等待用户授权）
  Failure = 'FAILURE', // 支付失败（如：余额不足、密码错误）
  Canceled = 'CANCELED', // 用户取消支付
  Error = 'ERROR', // 系统级错误（如：网络错误、参数错误）
}

/**
 * @interface PaymentResult
 * 统一的支付结果对象。这是 PaymentManager 返回的最终结果。
 */
export interface PaymentResult {
  /** 必需：本次支付的渠道 */
  channel: PaymentProviderType;
  /** 必需：支付状态 */
  status: PaymentStatus;
  /** 必需：业务订单 ID */
  orderId: string;
  /** 可选：渠道返回的交易流水号 */
  transactionId?: string;
  /** 可选：支付失败时的错误信息或原因 */
  message?: string;
  /** 可选：提供给业务方额外的渠道原始数据 */
  rawResponse?: Record<string, any>;
}
