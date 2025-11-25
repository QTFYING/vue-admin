import type { PaymentPlugin } from '../plugins/PaymentPlugin';
import type { PaymentRequest } from '../types/PaymentRequest';
import type { PaymentResult } from '../types/PaymentResult';

export class RebatePlugin implements PaymentPlugin {
  name = 'rebate';
  constructor(private opts: { endpoint: string; ratio?: number }) {}

  async afterPay(req: PaymentRequest, res: PaymentResult, http?: any) {
    if (res.status === 'SUCCESS') {
      try {
        const rebate = (req.amount || 0) * (this.opts.ratio ?? 0.02);
        await http.HttpProxy.post('points', this.opts.endpoint, { userId: req.userId, orderId: req.orderId, rebate });
      } catch (e) {
        throw new Error(e);
      }
    }
  }
}
