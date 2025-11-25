import type { HttpProxy } from '../http/HttpProxy';
import type { PaymentRequest, PaymentResult } from '../types';
import type { PaymentProvider } from './PaymentProvider';

export class WechatPayProvider implements PaymentProvider {
  async pay(req: PaymentRequest, http: typeof HttpProxy): Promise<PaymentResult> {
    const prepay = await http.post('pay', '/pay/wechat/prepay', req);
    return { status: 'UNKNOWN', raw: prepay };
  }
}
