import type { PaymentContext } from '../core/PaymentContext';
import type { HttpClient } from '../http/HttpClient';
import { PaymentStatus, type PaymentRequest, type PaymentResult } from '../types';
import type { PaymentProvider } from './PaymentProvider';

export class UniAppProvider implements PaymentProvider {
  async pay(req: PaymentRequest, http: HttpClient, ctx: PaymentContext): Promise<PaymentResult> {
    const path = ctx.getConfig().apiBase + '/api' + '/pay/wechat/prepay';
    const prepay = await http.post(path, req);
    return { channel: req.channel, status: PaymentStatus['Success'], orderId: prepay.orderId };
  }
}
