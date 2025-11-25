import type { HttpProxy } from '../http/HttpProxy';
import type { PaymentRequest, PaymentResult } from '../types';
import type { PaymentProvider } from './PaymentProvider';

export class WechatPayProvider implements PaymentProvider {
  async pay(req: PaymentRequest, http: typeof HttpProxy): Promise<PaymentResult> {
    // Use HttpProxy to call backend prepay; integrator will use the returned prepay data to call platform payment
    const prepay = await http.post('pay', '/pay/wechat/prepay', req);
    // Return raw prepay to integrator. SDK doesn't trigger platform payment directly.
    return { status: 'UNKNOWN', raw: prepay };
  }
}
