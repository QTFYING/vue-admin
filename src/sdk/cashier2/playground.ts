// playground.ts
import { PaymentContext } from './core/PaymentContext';
import { WechatStrategy } from './strategies/WechatStrategy';

async function main() {
  // 1. 初始化 Context
  const cashier = new PaymentContext();

  // 2. 组装策略 (Strategy Configuration)
  // 这里注入的是具体的配置，比如不同环境的 AppID
  const wechatProd = new WechatStrategy({ appId: 'wx888888', mchId: '123456' }, { debug: true });

  // 3. 注册 (Registration)
  cashier.use(wechatProd);

  cashier.on('beforePay', (params) => {
    console.log('准备支付，金额：', params.amount);
    // 这里搞点自己的事情，比如弹框让用户安全认证
    console.log('去扫脸认证～');
  });

  cashier.once('success', (res) => {
    // 这里的 res 自动推导为 PaymentResult 类型
    console.log('支付成功，上报埋点', res.transactionId);
  });

  // 页面销毁或者组件销毁的时候可以调用这个方法
  // sdk.clear();

  // 4. 业务层调用 (Execution)
  // 业务层完全不知道 WechatStrategy 内部发生了什么，只管传标准参数
  const result = await cashier.execute('wechat', {
    orderId: 'ORDER_2025_001',
    amount: 100, // 1元
    description: 'Premium Subscription',
  });

  if (result.status === 'success') {
    console.log('支付成功，流水号:', result.transactionId);
  } else {
    console.error('支付失败:', result.message);
  }
}

main();
