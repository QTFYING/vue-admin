import type { PaymentContext } from '../core/PaymentContext';
import type { HttpClient } from '../http/HttpClient';
import type { PaymentPlugin } from '../plugins/PaymentPlugin';
import type { PaymentRequest } from '../types/PaymentRequest';

export class PointsDeductionPlugin implements PaymentPlugin {
  name = 'points-deduction';
  constructor(private opts: { endpoint: string }) {}

  async beforePay(req: PaymentRequest, http: HttpClient, ctx: PaymentContext) {
    try {
      const path = ctx.getConfig().apiBase + '/api' + this.opts.endpoint;
      // 此时的http方法则是直接调用传入过来的，SDK中不进行任何处理
      const resp = await http.post(path, { userId: req.userId, amount: req.amount });
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
