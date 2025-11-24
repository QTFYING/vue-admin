export interface PaymentRequest {
  channel: string;
  orderId: string;
  amount: number;
  currency?: string;
  userId?: string;
  extraParams?: Record<string, string>;
}
