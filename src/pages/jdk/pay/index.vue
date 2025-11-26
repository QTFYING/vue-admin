<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>支付三个阶段</span>
        </div>
      </template>
      <div>
        <el-button type="primary" @click="handleAliPay">支付宝</el-button>
        <el-button type="primary" @click="handleWeChat">微信</el-button>
        <el-button type="primary" @click="handleUniApp">UniApp支付</el-button>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
  import {
    axiosAdapter,
    PaymentContext,
    PaymentManager,
    PaymentProviderType,
    PointsDeductionPlugin,
    RebatePlugin,
    WechatPayProvider,
  } from '@/sdk/cashier';
  import { http } from '@/utils/http';

  // create axios adapter implementing HttpClient contract
  // const axiosAdapter = {
  //   get: (url: string, opts?: any) => axios.get(url, { headers: opts?.headers, params: opts?.params }).then((r) => r.data),
  //   post: (url: string, data?: any, opts?: any) =>
  //     axios.post(url, data, { headers: opts?.headers, params: opts?.params }).then((r) => r.data),
  // };

  // 注入支付上下文 - v1版本，其他页面可以注册v2版本，可以根据不同的页面注册不同的版本
  const paymentV1 = PaymentContext.create('v1', { apiBase: 'http://localhost:8848' });

  const mgr = new PaymentManager();
  mgr.init({ http: axiosAdapter(http), context: paymentV1 });
  mgr.use(new PointsDeductionPlugin({ endpoint: '/deduct' }));
  mgr.use(new RebatePlugin({ endpoint: '/rebate', ratio: 0.03 }));

  // mgr.registerProvider('wechat', new WechatPayProvider(axiosAdapter(http), myExecutor)); // 执行微信支付

  mgr.registerProvider('wechat', new WechatPayProvider(axiosAdapter(http), 'h5')); // 执行微信支付

  // 发起支付
  const handleAliPay = async () => {
    await mgr.pay({ channel: PaymentProviderType['Wechat'], orderId: 'O1', amount: 100 });
  };

  const handleWeChat = async () => {
    await mgr.pay({ channel: PaymentProviderType['Wechat'], orderId: 'O2', amount: 100 });
  };

  const handleUniApp = async () => {
    await mgr.pay({ channel: PaymentProviderType['Wechat'], orderId: 'O3', amount: 100 });
  };
</script>
