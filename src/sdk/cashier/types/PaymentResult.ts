export interface PaymentResult {
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'UNKNOWN';
  message?: string;
  raw?: any;
}
