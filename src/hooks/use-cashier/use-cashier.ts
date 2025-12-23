import type { PayParams, PayResult } from '@/sdk/cashier2';
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { useCashierContext } from './cashier-context';
import { PaymentStatusEnum } from './enums';
import type { CashierState, UseCashierOptions } from './types';

export function useCashier(options: UseCashierOptions = {}) {
  const { cashier } = useCashierContext();
  const orderId = ref('');

  const state = reactive<CashierState>({ loading: false, status: null, result: null, error: null, action: null });

  const handleSuccess = (res: PayResult) => {
    state.loading = false;
    state.status = 'success';
    state.result = res;
    state.action = null;
    options?.onSuccess?.(res);
    cashier.stopPolling();
  };

  const handleFail = (err: any) => {
    state.loading = false;
    state.status = 'fail';
    state.error = err;
    state.action = null;
    options?.onError?.(err);
  };

  const handleStatusChange = (payload: { status: string; result?: any }) => {
    options?.onStatusChange?.(payload.status, payload.result);
    state.status = payload.status as any;
  };

  onMounted(() => {
    cashier.on('success', handleSuccess);
    cashier.on('fail', handleFail);
    cashier.on('statusChange', handleStatusChange);
  });

  onBeforeUnmount(() => {
    cashier.off('success', handleSuccess);
    cashier.off('fail', handleFail);
    cashier.off('statusChange', handleStatusChange);
  });

  const pay = async (strategyName: string, params: PayParams) => {
    state.loading = true;
    state.error = null;
    state.status = 'processing';
    state.action = null;
    state.result = null;
    try {
      const res = await cashier.execute(strategyName, params);
      state.loading = false;
      state.status = res.status as any;
      state.result = res;
      state.action = (res as any).action || null;
      return res;
    } catch (err: any) {
      state.loading = false;
      state.error = err;
      state.status = 'fail';
      throw err;
    }
  };

  const reset = () => {
    state.loading = false;
    state.status = null;
    state.result = null;
    state.error = null;
    state.action = null;
  };

  const refund = async () => {};

  const create = async (params: any) => {
    const { orderId: id } = await cashier.http.post('/payment/create', params);
    orderId.value = id;
    return id;
  };

  const statusText = computed(() => (state.status ? PaymentStatusEnum[state.status] : ''));

  return {
    loading: computed(() => state.loading),
    result: computed(() => state.result),
    error: computed(() => state.error),
    status: computed(() => state.status),
    statusText,
    orderId,
    pay,
    reset,
    refund,
    create,
    cashier,
  };
}
