import type { PaymentContext } from '../core/PaymentContext';
import type { HttpClient, PaymentRequest, PaymentResult } from '../types';
import { PaymentStatus } from '../types';
import { BaseProvider } from './BaseProvider';
import type { PaymentProvider } from './PaymentProvider';
import { PaymentProviderType } from './PaymentProvider';

// 声明全局变量 (防止 TS 报错)
declare const wx: any;

export class WechatPayProvider extends BaseProvider implements PaymentProvider {
  constructor(
    private http: HttpClient,
    private mode: 'mp' | 'h5' | 'mweb' | 'uniapp',
  ) {
    super();
  }

  async pay(req: PaymentRequest, http: HttpClient, ctx: PaymentContext): Promise<PaymentResult> {
    // 1. 根据模式分发到具体的处理函数
    switch (this.mode) {
      case 'uniapp':
        return this.handleUniApp(req, ctx);
      case 'mp':
        return this.handleMiniProgram(req, ctx);
      case 'h5':
        return this.handleH5JSAPI(req, ctx);
      case 'mweb':
        return this.handleMWeb(req, ctx);
      default:
        throw new Error(`[WechatPay] 不支持的支付模式: ${this.mode}`);
    }
  }

  // ---------------------------------------------------------
  // 🟢 模式 1: UniApp 框架
  // ---------------------------------------------------------
  private async handleUniApp(req: PaymentRequest, _ctx: PaymentContext): Promise<PaymentResult> {
    // 请求业务后端获取 UniApp 格式的支付参数
    const orderInfo = await this.http.post('/pay/wechat/uniapp', req);

    // 复用父类逻辑
    const result = await this.commonUniAppPay('wxpay', orderInfo);
    return { ...result, orderId: req.orderId };
  }

  // ---------------------------------------------------------
  // 🟢 模式 2: 微信小程序原生 (wx.requestPayment)
  // ---------------------------------------------------------
  private async handleMiniProgram(req: PaymentRequest, _ctx: PaymentContext): Promise<PaymentResult> {
    // 🛡️ 健壮性检查
    if (typeof wx === 'undefined') {
      throw new Error('[WechatPay] 未检测到 wx 全局对象，请确保在微信小程序环境中运行。');
    }

    const params = await this.http.post('/pay/wechat/mp', req);

    return new Promise((resolve) => {
      wx.requestPayment({
        ...params, // timeStamp, nonceStr, package, signType, paySign
        success: (res: any) =>
          resolve({
            status: PaymentStatus['Success'],
            channel: PaymentProviderType['Wechat'],
            orderId: req.orderId,
            rawResponse: res,
          }),
        fail: (err: any) => {
          const isCancel = err.errMsg && err.errMsg.indexOf('cancel') > -1;
          resolve({
            status: isCancel ? PaymentStatus['Canceled'] : PaymentStatus['Failure'],
            channel: PaymentProviderType['Wechat'],
            orderId: req.orderId,
            message: err.errMsg,
          });
        },
      });
    });
  }

  // ---------------------------------------------------------
  // 🟢 模式 3: H5 JSAPI (公众号内支付)
  // ---------------------------------------------------------
  private async handleH5JSAPI(req: PaymentRequest, _ctx: PaymentContext): Promise<PaymentResult> {
    // 🛡️ 健壮性检查
    if (!this.isBrowser()) {
      throw new Error('[WechatPay] JSAPI 模式必须在浏览器环境(window)运行');
    }

    const params = await this.http.post('/pay/wechat/jsapi', req);

    const onBridgeReady = () => {
      return new Promise<PaymentResult>((resolve) => {
        (window as any).WeixinJSBridge.invoke('getBrandWCPayRequest', params, (res: any) => {
          if (res.err_msg === 'get_brand_wcpay_request:ok') {
            resolve({ status: PaymentStatus['Success'], channel: PaymentProviderType['Wechat'], orderId: req.orderId });
          } else if (res.err_msg === 'get_brand_wcpay_request:cancel') {
            resolve({ status: PaymentStatus['Success'], channel: PaymentProviderType['Wechat'], orderId: req.orderId });
          } else {
            resolve({
              status: PaymentStatus['Success'],
              channel: PaymentProviderType['Wechat'],
              message: res.err_msg,
              orderId: req.orderId,
            });
          }
        });
      });
    };

    if (typeof (window as any).WeixinJSBridge === 'undefined') {
      return new Promise((resolve) => {
        document.addEventListener('WeixinJSBridgeReady', async () => {
          resolve(await onBridgeReady());
        });
      });
    } else {
      return onBridgeReady();
    }
  }

  // ---------------------------------------------------------
  // 🟢 模式 4: H5 外部浏览器跳转 (MWEB)
  // ---------------------------------------------------------
  private async handleMWeb(req: PaymentRequest, _ctx: PaymentContext): Promise<PaymentResult> {
    // 🛡️ 健壮性检查
    if (!this.isBrowser()) throw new Error('[WechatPay] MWEB 模式需要浏览器环境');

    const res = await this.http.post('/pay/wechat/mweb', req);

    if (res.mweb_url) {
      window.location.href = res.mweb_url;
      // 注意：跳转后当前页面可能会卸载，PENDING 状态仅供参考
      return {
        status: PaymentStatus['Success'],
        channel: PaymentProviderType['Wechat'],
        orderId: req.orderId,
        message: '正在跳转微信支付...',
      };
    }

    return {
      status: PaymentStatus['Success'],
      channel: PaymentProviderType['Wechat'],
      orderId: req.orderId,
      message: '服务端未返回 mweb_url',
    };
  }
}
