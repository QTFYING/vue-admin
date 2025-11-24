export interface PaymentExecutor {
  execute(params: any): Promise<any>;
}
