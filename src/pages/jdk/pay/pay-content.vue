<template>
  <div class="max-w-6xl mx-auto p-6" :key="orderId">
    <p class="text-2xl font-semibold m-0">在线收银台</p>
    <p class="text-gray-500">请选择支付方式并完成付款</p>
    <el-divider />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      <el-card class="shadow-sm flex flex-col justify-center">
        <div class="relative min-h-[340px]">
          <div v-if="loading" class="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] pt-4 rounded">
            <el-skeleton :rows="6" animated />
          </div>

          <el-form :model="form" label-position="top" @submit.prevent>
            <el-form-item label="订单号">
              <span class="text-gray-400 text-xs">{{ orderId || '订单号创建中～' }}</span>
            </el-form-item>

            <el-form-item label="支付方式">
              <el-radio-group v-model="form.channel" class="w-full">
                <el-radio-button label="alipay" class="mr-4 text-center w-32 h-10 leading-10">支付宝</el-radio-button>
                <el-radio-button label="wechat" class="text-center w-32 h-10 leading-10">微信</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="isCreated" label="支付状态">
              <div class="min-h-[60px]">
                <div class="flex items-center gap-2 mb-2">
                  <el-tag :type="statusTagType">{{ statusText }}</el-tag>
                </div>
                <el-alert v-if="status === 'pending'" type="info" :closable="false" description="请按指引完成支付" />
                <el-alert v-if="status === 'success'" type="success" :closable="false" description="支付已完成" />
                <el-alert v-if="status === 'fail'" type="error" :closable="false" description="支付遇到问题，请重试" />
              </div>
            </el-form-item>

            <div v-if="!isCreated" class="h-[92px]" />

            <el-form-item class="mb-0 mt-4">
              <div class="flex items-center gap-3">
                <el-button type="primary" size="large" :loading="loading" :disabled="btnDisabled" class="w-32" @click="onFinish">
                  {{ btnText }}
                </el-button>
                <el-button v-if="form.channel === 'wechat' && status !== 'success'" size="large" :disabled="loading" @click="onRefreshQr">
                  刷新二维码
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </el-card>

      <el-card class="shadow-sm flex flex-col">
        <div class="flex flex-col items-center justify-center min-h-[340px] h-full w-full relative">
          <template v-if="status === 'success'">
            <el-result icon="success" title="支付成功" sub-title="订单处理完成" class="py-4" />
          </template>
          <template v-else-if="form.channel === 'wechat'">
            <p class="text-lg font-medium">微信扫码支付</p>
            <div class="my-4 relative flex justify-center items-center w-216px h-216px">
              <template v-if="loading || !qrValue">
                <el-skeleton-item variant="image" style="width: 216px; height: 216px" />
              </template>
              <template v-else>
                <img :src="qrImageSrc" :class="isQrExpired ? 'opacity-50' : ''" alt="QR" class="w-[216px] h-[216px]" />
              </template>
            </div>
            <div class="flex flex-col items-center gap-2 min-h-[50px]">
              <span class="text-gray-600">请使用微信扫描二维码完成支付</span>
              <div :class="expireAt && !isQrExpired ? '' : 'invisible'">
                <el-countdown :value="expireAt" format="mm:ss" title="有效期" @finish="isQrExpired = true" />
              </div>
            </div>
          </template>
          <template v-else>
            <div class="flex flex-col items-center justify-center w-full">
              <span class="text-gray-400 mb-4">
                {{ form.channel === 'alipay' ? '支付宝支付将跳转新窗口' : '选择支付方式后显示' }}
              </span>
              <div class="w-32 h-32 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                <span class="text-gray-300">No QR</span>
              </div>
            </div>
          </template>
        </div>
      </el-card>
    </div>

    <el-divider />

    <el-card header="调试信息" class="shadow-sm">
      <div class="max-h-64 overflow-y-auto bg-gray-50 p-4 rounded border border-gray-100">
        <template v-if="isCreated && result">
          <pre class="text-xs whitespace-pre-wrap m-0 font-mono text-gray-600">{{ debugInfo }}</pre>
        </template>
        <template v-else>
          <span class="text-gray-400 text-xs">暂无调试数据</span>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { useCashier } from '@/hooks/use-cashier';
  import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';

  const { reset, pay, orderId, create, loading, status, result, statusText, cashier } = useCashier();

  const form = reactive<{ channel: 'alipay' | 'wechat' }>({ channel: 'alipay' });
  const isCreated = ref(false);
  const isQrExpired = ref(false);

  const qrValue = computed(() => {
    const action = result.value?.action;
    if (action?.type === 'qrcode' && action.value) return action.value;
    return result.value?.raw?.code_url;
  });
  const expireAt = computed(() => result.value?.raw?.expired_time);
  const qrImageSrc = computed(() =>
    qrValue.value ? `https://api.qrserver.com/v1/create-qr-code/?size=216x216&data=${encodeURIComponent(qrValue.value)}` : '',
  );

  const btnText = computed(() => {
    if (status.value === 'success') return '下一单';
    if (isCreated.value) return '重新支付';
    return '去支付';
  });
  const btnDisabled = computed(() => loading.value);

  const statusTagType = computed(() => {
    const st = status.value;
    if (st === 'success') return 'success';
    if (st === 'fail') return 'danger';
    if (st === 'processing') return 'warning';
    return 'info';
  });

  const onFinish = async () => {
    if (status.value === 'success') {
      handleReset();
      return;
    }
    const id = await create({ amount: 100, productId: 'A123456789' });
    isCreated.value = true;
    const base = { amount: 100 };
    const extraMap: Record<string, any> = {
      wechat: { extra: { body: '测试商品', tradeType: 'NATIVE' } },
      alipay: { extra: { subject: '测试商品', mode: 'pc' } },
    };
    const payload = Object.assign({}, base, { orderId: id }, extraMap[form.channel] || {});
    await pay(form.channel, payload);
    isQrExpired.value = false;
  };

  const onRefreshQr = async () => {
    await onFinish();
  };

  const handleReset = () => {
    isCreated.value = false;
    isQrExpired.value = false;
    reset();
  };

  watch([() => form.channel, qrValue, status, orderId], ([ch, qr, st, oid]) => {
    if (ch === 'wechat' && qr && (st === 'pending' || st === 'processing')) {
      cashier.startPolling('wechat', oid as string);
    } else if (st === 'success' || st === 'fail') {
      cashier.stopPolling();
    }
  });

  onBeforeUnmount(() => {
    cashier.stopPolling();
  });

  const debugInfo = computed(() => JSON.stringify(result.value, null, 2));
</script>
