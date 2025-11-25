import type { HttpProxy } from '../http/HttpProxy';
import type { PaymentPlugin } from '../plugins/PaymentPlugin';
import type { PaymentRequest } from '../types/PaymentRequest';
import type { PluginContext } from '../types/PluginContext';

export class PointsDeductionPlugin implements PaymentPlugin {
  name = 'points-deduction';
  constructor(private opts: { endpoint: string }) {}

  async beforePay(req: PaymentRequest, http: typeof HttpProxy, _ctx: PluginContext) {
    try {
      const resp = await http.post('points', this.opts.endpoint, { userId: req.userId, amount: req.amount });
      if (resp?.deductedAmount) {
        return {
          ...req,
          amount: req.amount - resp.deductedAmount,
          extraParams: { ...req.extraParams, pointsUsed: resp.pointsUsed },
        };
      }
      return req;
    } catch (e) {
      console.warn(e);
      return req; // fail-open: don't block payment if deduction fails
    }
  }
}
