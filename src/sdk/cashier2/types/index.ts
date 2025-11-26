// 1. 定义支持的支付渠道枚举
export type PaymentChannel = 'wechat' | 'alipay' | 'stripe' | 'custom';

// 2. 统一支付入参 (Normalization Input)
// 无论哪个渠道，用户只需要传这些核心数据
export interface UnifiedPaymentParams {
  orderId: string;
  amount: number; // 建议统一为“分”或最小币种单位，避免浮点数问题
  currency?: string;
  description?: string;
  extra?: Record<string, any>; // 允许透传特殊渠道参数
}

// 3. 统一支付结果 (Normalization Output)
// 屏蔽渠道差异，返回标准结构
export interface PaymentResult {
  status: 'success' | 'fail' | 'cancel' | 'pending';
  transactionId?: string; // 第三方流水号
  raw?: any; // 保留原始返回，以此作为逃生舱
  message?: string;
}

// 4. 定义 Provider 接口标准
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
