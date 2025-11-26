import type { PaymentContext } from '../core/PaymentContext';
import type { PaymentPlugin } from '../plugins/PaymentPlugin';
import type { HttpClient, PaymentRequest, PaymentResult } from '../types';

export class RebatePlugin implements PaymentPlugin {
  name = 'rebate';
  constructor(private opts: { endpoint: string; ratio?: number }) {}

  async afterPay(req: PaymentRequest, _res: PaymentResult, http: HttpClient, ctx: PaymentContext) {
    try {
      const rebate = (req.amount || 0) * (this.opts.ratio ?? 0.02);
      const path = ctx.getConfig().apiBase + '/api' + this.opts.endpoint;
      await http.post(path, { orderId: req.orderId, rebate });
    } catch (e) {
      throw new Error(e);
    }
  }
}
