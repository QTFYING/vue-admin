import type { HttpProxy } from '../core/HttpProxy';
import type { PaymentRequest } from './PaymentRequest';
import type { PaymentResult } from './PaymentResult';

export interface PaymentProvider {
  pay(req: PaymentRequest, http?: typeof HttpProxy): Promise<PaymentResult>;
}

export type { PaymentRequest } from './PaymentRequest';
export type { PaymentResult } from './PaymentResult';
