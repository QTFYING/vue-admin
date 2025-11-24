import { HttpProxy } from '../core/HttpProxy';
import type { PaymentProvider, PaymentRequest, PaymentResult } from '../types/PaymentProvider';

export class WechatPayProvider implements PaymentProvider {
  async pay(req: PaymentRequest, http?: typeof HttpProxy): Promise<PaymentResult> {
    // Use HttpProxy to call backend prepay; integrator will use the returned prepay data to call platform payment
    const prepay = await (http ?? HttpProxy).post('pay', '/pay/wechat/prepay', req);
    // Return raw prepay to integrator. SDK doesn't trigger platform payment directly.
    return { status: 'UNKNOWN', raw: prepay };
  }
}
