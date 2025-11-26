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

  // “环绕”逻辑:全局 Loading 中间件
  cashier.useMiddleware(async (ctx, next) => {
    console.log('>>> [Loading Middleware] Loading Start', ' 开启遮罩');
    try {
      await next(); // 等待后续逻辑（包括真的去支付）执行完毕
    } finally {
      console.log('<<< [Loading Middleware] Loading End', ' 关闭遮罩');
    }
  });

  // “阻断”逻辑:前置校验拦截
  cashier.useMiddleware(async (ctx, next) => {
    console.log('>>> [Auth Middleware] Checking Login Start', '检查用户登录状态');

    if (2 < 1) {
      // 直接抛错，不再执行 next()，所有的后续支付流程都不会发生
      throw new Error('User not authorized');
    }

    // 修改入参：自动带上 token
    ctx.params.extra = { ...ctx.params.extra, token: 'xxxx-xxxx-xxxx-xxxx' };

    await next();

    console.log('<<< [Auth Middleware] Checking Login End', '用户登录成功');
  });

  // “结果读取”逻辑:日志上报
  cashier.useMiddleware(async (ctx, next) => {
    const startTime = Date.now();

    await next(); // 先让它去付

    const duration = Date.now() - startTime;
    console.log(`>>> [Logger Middleware] Start`, '开始上报支付日志');

    // 此时 ctx.result 已经被填充了，可以上报
    if (ctx.result) {
      console.log('日志上报插件', `支付耗时: ${duration}ms`, ctx.result.status);
    }

    console.log(`<<< [Logger Middleware] End`, '上报支付日志成功');
  });

  // 页面销毁或者组件销毁的时候可以调用这个方法
  // cashier.clear();

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
