import type { PaymentResult, UnifiedPaymentParams } from '../types';
import { Poller } from '../utils/Poller';
import { BaseStrategy, type StateCallBack } from './BaseStrategy';

// 定义微信策略需要的配置类型
interface WechatConfig {
  appId: string;
  mchId: string;
  notifyUrl?: string;
}

export class WechatStrategy extends BaseStrategy<WechatConfig> {
  public readonly name = 'wechat';
  private startTime = Date.now();

  // 实现单次查单逻辑
  async getPaymentStatus(_orderId: string): Promise<PaymentResult> {
    // 模拟调用你的后端查单API
    // const res = await axios.get(`/api/pay/query?id=${orderId}`);
    // return normalize(res);

    // Mock逻辑：在首次调用后的 10 秒内返回 pending，之后返回 success

    const elapsed = Date.now() - this.startTime;

    if (elapsed < 10000) {
      return { status: 'pending', message: 'User is paying2' };
    }

    console.log('有订单号了，微信支付成功啦～');

    return this.success(`MOCK_11111`, { source: 'mock', elapsed });
  }

  /**
   * 扩展：带轮询能力的支付
   * 这种模式下，pay() 会一直挂起，直到用户扫码成功才 resolve
   */
  async payWithPolling(params: UnifiedPaymentParams, onStateChange: StateCallBack): Promise<PaymentResult> {
    // 1. 先获取二维码链接
    const prepareResult = await this.pay(params, onStateChange);

    // 如果不是 pending (比如直接失败了)，直接返回
    if (prepareResult.status !== 'pending') {
      return prepareResult;
    }

    console.log('二维码已获取，开始轮询查单...');

    // 2. 初始化轮询器 (指数退避，最长查 2 分钟)
    const poller = new Poller({ strategy: 'exponential', timeout: 120 * 1000 });

    try {
      // 3. 启动轮询
      const finalResult = await poller.start(
        // Task: 每次查单动作
        () => this.getPaymentStatus(params.orderId),

        // Validator: 什么时候停止？(成功或失败时停止，pending 继续查)
        (res) => res.status === 'success' || res.status === 'fail',
      );

      return finalResult;
    } catch (err) {
      // 超时或被手动停止
      return { status: 'fail', message: err.message || 'Polling timeout or cancelled' };
    }
  }

  async pay(params: UnifiedPaymentParams, onStateChange: StateCallBack): Promise<PaymentResult> {
    // 1. 调用父类通用校验
    this.validateParams(params);

    if (this.options.debug) {
      console.log(`[WechatStrategy] Preparing payment for Order: ${params.orderId}`);
    }

    if (onStateChange) onStateChange('pending');

    try {
      // --- 模拟：适配层逻辑 ---
      // 实际开发中，这里会调用后端 API 获取签名，或者调用 wx.chooseWXPay
      console.log(`[WechatStrategy] Signing with AppID: ${this.config.appId}...`);

      /** ---------------------- 去支付，这是一个http请求 ---------------------- **/
      await new Promise((resolve) => setTimeout(resolve, 500));

      //  Mock逻辑：在首次调用后的 10 秒内返回 pending，之后返回 success
      const elapsed = Date.now() - this.startTime;

      if (elapsed < 10000) {
        return { status: 'pending', message: 'User is paying1' };
      }

      return this.success(`MOCK_${params.orderId}`, { source: 'mock', elapsed });
    } catch (error: any) {
      return {
        status: 'fail',
        message: error.message || 'Unknown error inside WechatStrategy',
      };
    }
  }
}
