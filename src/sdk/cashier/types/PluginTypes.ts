import type { HttpProxy } from '../core/HttpProxy';
import type { PaymentRequest } from './PaymentRequest';
import type { PaymentResult } from './PaymentResult';

export interface PaymentPlugin {
  name?: string;
  beforePay?: (req: PaymentRequest, http: typeof HttpProxy) => Promise<PaymentRequest> | PaymentRequest;
  afterPay?: (req: PaymentRequest, res: PaymentResult, http?: typeof HttpProxy) => Promise<PaymentResult> | Promise<void>;
}
