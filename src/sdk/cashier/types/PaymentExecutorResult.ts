/**
 * @interface PaymentExecutorResult
 * 定义执行器执行完毕后的标准化返回结果
 */
export interface PaymentExecutorResult {
  /**
   * 支付状态
   * SUCCESS: 支付成功
   * FAILURE: 支付失败（余额不足、网络失败等）
   * CANCELED: 用户主动取消
   * PENDING: 处理中（例如跳转到了 H5 页面，无法立即获知结果）
   */
  status: 'SUCCESS' | 'FAILURE' | 'CANCELED' | 'PENDING';

  /**
   * 错误信息或提示信息
   */
  message?: string;

  /**
   * 原始数据
   * 用于保留底层 SDK 返回的完整对象（如 uni.requestPayment 的 res），
   * 方便业务方在极少数情况下需要访问原生数据。
   */
  raw?: any;
}
