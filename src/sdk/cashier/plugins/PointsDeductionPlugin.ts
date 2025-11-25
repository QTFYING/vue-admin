import type { PaymentContext } from '../core/PaymentContext';
import type { HttpProxy } from '../http/HttpProxy';
import type { PaymentPlugin } from '../plugins/PaymentPlugin';
import type { PaymentRequest } from '../types/PaymentRequest';

export class PointsDeductionPlugin implements PaymentPlugin {
  name = 'points-deduction';
  constructor(private opts: { endpoint: string }) {}

  async beforePay(req: PaymentRequest, http: typeof HttpProxy, ctx: PaymentContext) {
    try {
      const path = ctx.getConfig().apiBaseUrl + '/points' + this.opts.endpoint;
      const resp = await http.post(path, this.opts.endpoint, { userId: req.userId, amount: req.amount });
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
