<template>
  <div class="mx-auto p-6 bg-white">
    <div class="mb-1">
      <p class="text-2xl font-semibold m-0 text-gray-900">在线收银台</p>
      <p class="text-gray-500 mt-1">请选择支付方式并完成付款</p>
    </div>

    <el-divider />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      <el-card shadow="never" class="border-gray-100 flex flex-col justify-center">
        <div class="relative min-h-[340px]">
          <transition name="el-fade-in">
            <div v-if="loading && !isCreated" class="absolute inset-0 z-20 bg-white/60 backdrop-blur-[1px] pt-4 rounded">
              <el-skeleton :rows="6" animated />
            </div>
          </transition>

          <el-form :model="form" layout="vertical" label-position="top">
            <el-form-item label="订单号">
              <span class="font-mono text-gray-400 text-xs">{{ orderId || '订单号创建中～' }}</span>
            </el-form-item>

            <el-form-item label="支付方式">
              <el-radio-group v-model="form.channel" class="custom-radio-group">
                <el-radio-button value="alipay">
                  <div class="flex items-center justify-center w-28">
                    <i class="i-ant-design:alipay-circle-outlined mr-2 text-lg text-[#1677ff]" />
                    <span>支付宝</span>
                  </div>
                </el-radio-button>
                <el-radio-button value="wechat">
                  <div class="flex items-center justify-center w-28">
                    <i class="i-ant-design:wechat-outlined mr-2 text-lg text-[#52c41a]" />
                    <span>微信</span>
                  </div>
                </el-radio-button>
              </el-radio-group>
            </el-form-item>

            <transition name="el-zoom-in-top">
              <el-form-item v-if="isCreated" label="支付状态">
                <div class="min-h-[60px] w-full">
                  <div class="flex items-center gap-2 mb-2">
                    <el-tag :type="statusTagType" effect="light">{{ statusText || '等待中' }}</el-tag>
                  </div>
                  <el-alert v-if="status === 'pending'" type="info" :closable="false" show-icon title="请按指引完成支付" />
                  <el-alert v-if="status === 'success'" type="success" :closable="false" show-icon title="支付已完成" />
                  <el-alert v-if="status === 'fail'" type="error" :closable="false" show-icon title="支付遇到问题，请重试" />
                </div>
              </el-form-item>
            </transition>

            <div v-if="!isCreated" class="h-[92px]" />

            <el-form-item class="mb-0 mt-4">
              <div class="flex items-center gap-3">
                <el-button type="primary" size="large" :loading="loading" :disabled="btnDisabled" class="w-32" @click="onFinish">
                  {{ btnText }}
                </el-button>
                <el-button
                  v-if="form.channel === 'wechat' && status !== 'success' && isCreated"
                  size="large"
                  :disabled="loading"
                  @click="onRefreshQr"
                >
                  刷新二维码
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </el-card>

      <el-card shadow="never" class="border-gray-100 flex flex-col">
        <div class="flex flex-col items-center justify-center min-h-[340px] h-full w-full relative">
          <transition name="el-fade-in" mode="out-in">
            <div v-if="status === 'success'" class="w-full animate-fade-in">
              <el-result icon="success" title="支付成功" sub-title="订单处理完成" />
            </div>

            <div v-else-if="form.channel === 'wechat'" class="flex flex-col items-center animate-fade-in w-full">
              <p class="text-xl font-medium text-gray-800 mb-0">微信扫码支付</p>

              <div
                class="my-4 relative flex justify-center items-center w-[216px] h-[216px] border border-gray-100 rounded-lg bg-white overflow-hidden"
              >
                <el-skeleton v-if="loading && !qrValue" animated>
                  <template #template>
                    <el-skeleton-item variant="image" style="width: 216px; height: 216px" />
                  </template>
                </el-skeleton>

                <div v-else class="relative p-2 bg-white">
                  <qrcode-vue
                    :value="qrValue"
                    :size="190"
                    level="H"
                    render-as="svg"
                    :class="['transition-all duration-300', isQrExpired ? 'filter blur-[3px] opacity-10' : 'opacity-100']"
                  />

                  <transition name="el-fade-in">
                    <div v-if="isQrExpired" class="absolute inset-0 flex flex-col items-center justify-center bg-white/60">
                      <p class="text-sm text-gray-800 font-bold mb-2">二维码已过期</p>
                      <el-button type="primary" size="small" link @click="onRefreshQr">点击刷新</el-button>
                    </div>
                  </transition>
                </div>
              </div>

              <div class="flex flex-col items-center gap-2 min-h-[50px]">
                <span class="text-gray-500">请使用微信扫描二维码完成支付</span>
                <div v-if="expireAt && !isQrExpired" class="flex items-center text-sm text-gray-500">
                  <span>有效期：</span>
                  <el-countdown
                    :value="expireAt"
                    format="mm:ss"
                    value-style="font-size: 14px; color: #666; font-weight: normal"
                    @finish="isQrExpired = true"
                  />
                </div>
              </div>
            </div>

            <div v-else class="flex flex-col items-center justify-center text-center animate-fade-in">
              <span class="text-gray-400 mb-4">
                {{ form.channel === 'alipay' ? '支付宝支付将跳转新窗口' : '选择支付方式后显示' }}
              </span>
              <div class="w-32 h-32 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                <i class="i-ant-design:qrcode-outlined text-4xl" />
              </div>
            </div>
          </transition>
        </div>
      </el-card>
    </div>

    <el-divider />

    <el-card shadow="never" class="border-gray-100">
      <template #header>
        <div class="text-sm font-medium text-gray-500">调试信息</div>
      </template>
      <div class="max-h-64 overflow-y-auto bg-gray-50 p-4 rounded border border-gray-100">
        <pre v-if="isCreated && result" class="text-xs font-mono text-gray-600 m-0 leading-relaxed">{{ debugInfo }}</pre>
        <span v-else class="text-gray-400 text-xs">暂无调试数据</span>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { useCashier } from '@/hooks/use-cashier';
  import { ElMessage } from 'element-plus';
  import QrcodeVue from 'qrcode.vue';
  import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';

  const { reset, pay, orderId, create, loading, status, result, statusText, cashier } = useCashier();

  const form = reactive({ channel: 'alipay' });
  const isCreated = ref(false);
  const isQrExpired = ref(false);

  // --- 逻辑计算 ---

  // 获取支付链接
  const qrValue = computed(() => {
    const action = result.value?.action;
    if (action?.type === 'qrcode' && action.value) return action.value;
    return result.value?.raw?.code_url || '';
  });

  const expireAt = computed(() => result.value?.raw?.expired_time);

  const btnText = computed(() => {
    if (status.value === 'success') return '下一单';
    if (isCreated.value) return '重新支付';
    return '去支付';
  });

  const btnDisabled = computed(() => {
    if (status.value === 'success') return false;
    return loading.value;
  });

  const statusTagType = computed(() => {
    const map: Record<string, string> = {
      success: 'success',
      fail: 'danger',
      processing: 'warning',
      pending: 'info',
    };
    return (map[status.value!] || 'info') as any;
  });

  // --- 核心方法 ---

  const onFinish = async () => {
    if (status.value === 'success') {
      handleReset();
      return;
    }

    try {
      const id = await create({ amount: 100, productId: 'A123456789' });
      isCreated.value = true;

      const base = { amount: 100, orderId: id };
      const extraMap: Record<string, any> = {
        wechat: { extra: { body: '测试商品', tradeType: 'NATIVE' } },
        alipay: { extra: { subject: '测试商品', mode: 'pc' } },
      };

      const payload = { ...base, ...(extraMap[form.channel] || {}) };
      await pay(form.channel as any, payload);

      isQrExpired.value = false;
    } catch (err: any) {
      ElMessage.error(err.message || '支付发起失败');
    }
  };

  const handleReset = () => {
    isCreated.value = false;
    isQrExpired.value = false;
    reset();
  };

  const onRefreshQr = () => onFinish();

  // --- 轮询 ---
  watch(
    [() => form.channel, qrValue, status, orderId],
    ([ch, qr, st, oid]) => {
      if (ch === 'wechat' && qr && (st === 'pending' || st === 'processing')) {
        cashier.startPolling('wechat', oid as string);
      } else if (st === 'success' || st === 'fail') {
        cashier.stopPolling();
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => cashier.stopPolling());

  const debugInfo = computed(() => JSON.stringify(result.value, null, 2));
</script>

<style scoped>
  :deep(.custom-radio-group .el-radio-button__inner) {
    height: 40px;
    padding: 0 20px;
    line-height: 40px;
  }

  .animate-fade-in {
    animation: fade-in 0.4s ease-out forwards;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(4px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
