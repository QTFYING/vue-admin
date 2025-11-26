# 支付SDK设计方案

## 目录结构示例

```shell
your-payment-sdk/
├── src/
│   ├── core/
│   │   ├── PaymentContext.ts        # [Context] 策略上下文/调度中心
│   │   │                            # 职责：管理策略注册(.use)，对外暴露统一执行入口(.execute)
│   │   │
│   │   └── EventBus.ts              # [Observer] 事件总线
│   │   │                            # 职责：解耦业务逻辑，抛出 on('success') 等事件
│   │   │
│   ├── strategies/                  # [Strategy Implementation] 策略层
│   │   ├── BaseStrategy.ts          # [Abstract Class] 策略基类/接口定义
│   │   │                            # 职责：定义 abstract pay() 和通用校验逻辑
│   │   │
│   │   ├── WechatStrategy.ts        # [Concrete Strategy] 微信支付实现
│   │   └── AlipayStrategy.ts        # [Concrete Strategy] 支付宝支付实现
│   │
│   ├── adapters/                    # [Adapter] 适配层 (可选，视复杂度而定)
│   │   └── WechatAdapter.ts         # 职责：如果微信参数过于复杂，可在此单独处理数据清洗
│   │
│   ├── types/                       # [Type Definitions]
│   │   ├── index.ts                 # 汇总导出
│   │   ├── core.ts                  # SDK 配置、Context 相关类型
│   │   ├── middleware.ts            # 定义在中间件之间流转的“上下文”对象
│   │   └── protocol.ts              # 核心协议：UnifiedPaymentParams, PaymentResult
│   │
│   ├── utils/
│   │   ├── env.ts                   # 环境检测 (isWechat, isMobile)
│   │   ├── sign.ts                  # 签名算法工具 (MD5, SHA256)
│   │   ├── compose.ts               # 洋葱模型组合器，用于把数组形式的中间件 [fn1, fn2, fn3] 组合成一个可以执行的 Promise 链
│   │   └── errors.ts                # 自定义错误类 (PaymentError)
│   │
│   └── index.ts                     # [Entry] 库入口，负责导出 Context 和 Strategies
│
├── tests/                           # 测试用例 (Vitest/Jest)
│   ├── core/
│   └── strategies/
│
├── package.json
├── tsconfig.json
└── rollup.config.js                 # 打包配置 (ESM/CJS/UMD)
```

## SDK核心功能点

- 中间件和拦截器机制

```javascript
sdk.use(async (ctx, next) => {
  console.log('Middleware: 检查登录态');
  if (!isLoggedIn) throw new Error('Unauthorized');
  await next();
  console.log('Middleware: 支付结束耗时上报');
});
```

优势：扩展性爆炸式增长，业务方不需要侵入修改核心代码就能挂载逻辑

- 轮询查单机制
- 动态脚本加载
- 统一错误码映射
- Mock 模式
