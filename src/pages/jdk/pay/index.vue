<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>支付三个阶段</span>
        </div>
      </template>
      <div>
        <p class="text item">支付前：优惠券、积分</p>
        <p class="text item">去支付：支付中、支付成功（核销优惠券、积分等）、支付失败（回滚优惠券、积分等）</p>
        <p class="text item">支付后：积分返点</p>
      </div>
    </el-card>

    <el-card style="margin-top: 12px">
      <template #header>
        <div class="card-header">
          <span>设计思路（策略模式 & 单例模式）</span>
        </div>
      </template>
      <div>
        <p class="text item">抵扣计算</p>
        <p class="text item">支付上下文</p>
        <p class="text item">订单服务</p>
        <p class="text item">支付策略</p>
        <p class="text item">积分返点</p>
      </div>
    </el-card>

    <el-card style="margin-top: 12px">
      <template #header>
        <div class="card-header">
          <span>兼容性</span>
        </div>
      </template>
      <div>
        <p class="text item">平台差异（微信小程序、支付宝小程序、UniAPP、Taro等）</p>
        <p class="text item">HTTP请求方式的差异</p>
        <p class="text item">不能支付的登陆问题</p>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
  import axios from 'axios';
  import { PaymentContext } from '../src/core/PaymentContext';
  import { PaymentManager } from '../src/manager/PaymentManager';
  import { PointsDeductionPlugin } from '../src/plugins/PointsDeductionPlugin';
  import { RebatePlugin } from '../src/plugins/RebatePlugin';
  import { WechatPayProvider } from '../src/providers/WechatPayProvider';

  // create axios adapter implementing HttpClient contract
  const axiosAdapter = {
    get: (url: string, opts?: any) => axios.get(url, { headers: opts?.headers, params: opts?.params }).then((r) => r.data),
    post: (url: string, data?: any, opts?: any) =>
      axios.post(url, data, { headers: opts?.headers, params: opts?.params }).then((r) => r.data),
  };

  // register contexts
  PaymentContext.create('pay', {
    http: axiosAdapter,
    apiBaseUrl: 'https://pay-api.example.com',
    getToken: () => localStorage.getItem('pay_token') || '',
  });

  // optional: register points service context
  PaymentContext.create('points', {
    http: axiosAdapter,
    apiBaseUrl: 'https://points-api.example.com',
    getToken: () => localStorage.getItem('points_token') || '',
  });

  // register global decorator (e.g. geo + signature)
  PaymentContext.registerGlobalDecorator(async ({ headers }) => {
    // compute dynamic headers here (call navigator.geolocation or platform-specific)
    headers['X-Client-Version'] = '1.2.3';
    // signature logic left to integrator or global decorator
  });

  // use manager
  const mgr = new PaymentManager();
  mgr.use(new PointsDeductionPlugin({ endpoint: '/deduct' }));
  mgr.use(new RebatePlugin({ endpoint: '/rebate', ratio: 0.03 }));
  mgr.registerProvider('wechat', new WechatPayProvider());

  // call pay
  const res = await mgr.pay({ channel: 'wechat', orderId: 'O1', amount: 100, userId: 'U1' });
  // integrator receives prepay in res.raw and triggers platform payment (wx/uni/web) using their own PaymentExecutor
</script>

<style lang="scss" scoped>
  .text.item {
    line-height: 30px;
    color: #999;
  }

  .enhanced-payment-container {
    max-width: 400px;
    padding: 20px;
    margin: 0 auto;
  }

  .amount-section {
    padding: 15px;
    margin: 10px 0;
    border: 1px solid #eee;
  }

  .amount-row {
    display: flex;
    justify-content: space-between;
    margin: 5px 0;
  }

  .discount {
    color: #f56c6c;
  }

  .final-amount {
    padding-top: 10px;
    margin-top: 10px;
    font-size: 1.2em;
    font-weight: bold;
    border-top: 1px solid #eee;
  }

  .deduction-options,
  .payment-methods {
    padding: 15px;
    margin: 20px 0;
    border: 1px solid #eee;
    border-radius: 4px;
  }

  .pay-button {
    width: 100%;
    padding: 12px;
    font-size: 16px;
    color: white;
    cursor: pointer;
    background-color: #409eff;
    border: none;
    border-radius: 4px;
  }

  .pay-button:disabled {
    cursor: not-allowed;
    background-color: #c0c4cc;
  }

  .full-deduction {
    margin: 10px 0;
    font-weight: bold;
    color: #67c23a;
    text-align: center;
  }
</style>
