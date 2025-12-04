import { PaymentStatus, type PaymentResult } from '../types';
import { PaymentProviderType } from './PaymentProvider';

// 声明全局变量防止 TS 报错 (Duck Typing)
declare const uni: any;

export abstract class BaseProvider {
  /**
   * 通用的 UniApp 支付调用逻辑
   * 微信和支付宝都可以直接复用这个方法，无需复制粘贴
   * * @param providerName uni.requestPayment 的 provider 参数 ('wxpay' | 'alipay')
   * @param orderInfo 支付参数 (微信是 Object, 支付宝是 String)
   */
  protected async commonUniAppPay(providerName: 'wxpay' | 'alipay' | 'appleiap', orderInfo: any): Promise<PaymentResult> {
    // ---------------------------------------------------------
    // 🛡️ 健壮性检查：防止在非 UniApp 环境（如纯 Web）调用导致报错
    // ---------------------------------------------------------
    if (typeof uni === 'undefined') {
      throw new Error(`[SDK] 当前环境未找到 'uni' 对象，无法使用 uniapp 模式。请检查是否在 UniApp 项目中运行。`);
    }

    console.log(`[SDK] 正在调用 UniApp 支付: provider=${providerName}`);

    return new Promise((resolve) => {
      uni.requestPayment({
        provider: providerName,
        orderInfo: orderInfo,
        success: (res: any) => {
          resolve({
            status: PaymentStatus['Success'],
            channel: providerName === 'wxpay' ? PaymentProviderType['Wechat'] : PaymentProviderType['alipay'],
            rawResponse: res,
            orderId: '', // 上层调用者负责回填
          });
        },
        fail: (err: any) => {
          // 统一判断用户取消行为
          // 不同平台的取消错误码或信息可能不同，这里做模糊匹配
          const errMsg = err.errMsg || err.message || JSON.stringify(err);
          const isCancel = errMsg.indexOf('cancel') > -1 || errMsg.indexOf('取消') > -1;

          resolve({
            status: isCancel ? PaymentStatus['Canceled'] : PaymentStatus['Failure'],
            channel: providerName === 'wxpay' ? PaymentProviderType['Wechat'] : PaymentProviderType['alipay'],
            message: errMsg,
            rawResponse: err,
            orderId: '',
          });
        },
      });
    });
  }

  /**
   * 辅助方法：检查是否在浏览器环境
   */
  protected isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }
}
