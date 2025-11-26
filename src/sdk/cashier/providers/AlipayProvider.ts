import type { PaymentContext } from '../core/PaymentContext';
import type { HttpClient } from '../http/HttpClient';
import { PaymentStatus, type PaymentRequest, type PaymentResult } from '../types';
import { BaseProvider } from './BaseProvider';
import { PaymentProviderType, type PaymentProvider } from './PaymentProvider';

// 声明支付宝小程序全局变量
declare const my: any;

export interface AlipayOptions {
  /**
   * 支付模式
   * - mp: 支付宝小程序原生
   * - h5: 手机网站支付 (Form表单提交)
   * - uniapp: UniApp 框架
   */
  mode: 'mp' | 'h5' | 'uniapp';
}

export class AlipayProvider extends BaseProvider implements PaymentProvider {
  constructor(
    private http: HttpClient,
    private mode: 'mp' | 'h5' | 'uniapp',
  ) {
    super();
  }

  async pay(req: PaymentRequest, http: HttpClient, ctx: PaymentContext): Promise<PaymentResult> {
    switch (this.mode) {
      case 'uniapp':
        return this.handleUniApp(req, ctx);
      case 'mp':
        return this.handleMiniProgram(req, ctx);
      case 'h5':
        return this.handleH5Form(req, ctx);
      default:
        throw new Error(`[Alipay] 不支持的支付模式: ${this.mode}`);
    }
  }

  // ---------------------------------------------------------
  // 🔵 模式 1: UniApp 框架
  // ---------------------------------------------------------
  private async handleUniApp(req: PaymentRequest, _ctx: PaymentContext): Promise<PaymentResult> {
    // 支付宝在 UniApp 中通常只需要一个 orderStr (字符串)
    const orderStr = await this.http.post('/pay/alipay/uniapp', req);

    // 复用父类逻辑，参数传 'alipay'
    const result = await this.commonUniAppPay('alipay', orderStr);
    return { ...result, orderId: req.orderId };
  }

  // ---------------------------------------------------------
  // 🔵 模式 2: 支付宝小程序原生 (my.tradePay)
  // ---------------------------------------------------------
  private async handleMiniProgram(req: PaymentRequest, _ctx: PaymentContext): Promise<PaymentResult> {
    // 🛡️ 健壮性检查
    if (typeof my === 'undefined') {
      throw new Error('[Alipay] 未检测到 my 全局对象，请确保在支付宝小程序环境中运行。');
    }

    const tradeNO = await this.http.post('/pay/alipay/mp', req);

    return new Promise((resolve) => {
      my.tradePay({
        tradeNO: tradeNO, // 或者是 orderStr，视业务后端实现而定
        success: (res: any) => {
          // 支付宝 resultCode: 9000 成功
          if (res.resultCode === '9000') {
            resolve({
              status: PaymentStatus['Success'],
              channel: PaymentProviderType['Alipay'],
              orderId: req.orderId,
              rawResponse: res,
            });
          } else if (res.resultCode === '6001') {
            resolve({
              status: PaymentStatus['Canceled'],
              channel: PaymentProviderType['Alipay'],
              orderId: req.orderId,
              message: '用户取消',
            });
          } else {
            resolve({
              status: PaymentStatus['Failure'],
              channel: PaymentProviderType['Alipay'],
              orderId: req.orderId,
              message: res.memo || '支付失败',
            });
          }
        },
        fail: (err: any) => {
          resolve({
            status: PaymentStatus['Failure'],
            channel: PaymentProviderType['Alipay'],
            orderId: req.orderId,
            rawResponse: err,
          });
        },
      });
    });
  }

  // ---------------------------------------------------------
  // 🔵 模式 3: H5 表单提交 (手机网站支付)
  // ---------------------------------------------------------
  private async handleH5Form(req: PaymentRequest, _ctx: PaymentContext): Promise<PaymentResult> {
    // 🛡️ 健壮性检查
    if (!this.isBrowser()) throw new Error('[Alipay] H5 模式需要浏览器环境');

    // 后端返回支付宝的 HTML Form 代码
    const formHtml = await this.http.post('/pay/alipay/h5', req);

    if (!formHtml || typeof formHtml !== 'string') {
      return {
        status: PaymentStatus['Failure'],
        channel: PaymentProviderType['Alipay'],
        orderId: req.orderId,
        message: 'Invalid form html',
      };
    }

    // 创建 DOM 节点并自动提交
    const div = document.createElement('div');
    div.innerHTML = formHtml;
    div.style.display = 'none';
    document.body.appendChild(div);

    const form = document.forms[0];
    if (form) {
      form.submit();
      return {
        status: PaymentStatus['Pending'],
        channel: PaymentProviderType['Alipay'],
        orderId: req.orderId,
        message: '正在跳转支付宝...',
      };
    }

    return {
      status: PaymentStatus['Failure'],
      channel: PaymentProviderType['Alipay'],
      orderId: req.orderId,
      message: '无法解析支付宝表单',
    };
  }
}
