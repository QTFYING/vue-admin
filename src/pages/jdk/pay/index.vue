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

  // 注入插件的上下文
  PaymentContext.create('payment-methods-1', {
    http: axiosAdapter(http),
    apiBaseUrl: 'https://pay-api1.example.com',
    getToken: () => localStorage.getItem('pay_token') || '',
  });

  const mgr = new PaymentManager();
  mgr.init({ http: axiosAdapter(http), context: PaymentContext.get('payment-methods-1') });
  mgr.use(new PointsDeductionPlugin({ endpoint: '/deduct' }));
  mgr.use(new RebatePlugin({ endpoint: '/rebate', ratio: 0.03 }));

  mgr.registerProvider('wechat', new WechatPayProvider()); // 执行微信支付

  // 发起支付
  const handleAliPay = async () => {
    await mgr.pay({ channel: 'alipay', orderId: 'O1', amount: 100, userId: 'U1' });
  };

  const handleWeChat = async () => {
    await mgr.pay({ channel: 'wechat', orderId: 'O2', amount: 100, userId: 'U1' });
  };

  const handleUniApp = async () => {
    await mgr.pay({ channel: 'uniapp', orderId: 'O3', amount: 100, userId: 'U1' });
  };
</script>
