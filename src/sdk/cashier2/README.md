# 支付SDK设计方案

## 目录结构示例

```shell
your-payment-sdk/
├── src/
│   ├── adapters/                    # [Adapter] 适配层 (可选，视复杂度而定)
│   │   └── WechatAdapter.ts         # 职责：如果微信参数过于复杂，可在此单独处理数据清洗
│   │   │
│   ├── core/                        # [Core] SDK Core
│   │   ├── EventBus.ts              # [Observer] 事件总线，职责：解耦业务逻辑，抛出 on('success') 等事件
│   │   ├── InvokerFactory.ts        # [Invoker] 协调用哪一种方案拉起支付控件
│   │   ├── PaymentContext.ts        # [Context] 策略上下文/调度中心，职责：管理策略注册(.use)，对外暴露统一执行入口(.execute)
│   │   ├── PaymentError.ts          # [Error] 支付错误类
│   │   ├── PluginDriver.ts          # [Plugin] 插件编排
│   │   └── PollingManager.ts        # [Polling] 轮询查单管理器
│   │   │
│   ├── invokers/                    # [Invoker] 调用器层，职责：通过用户传入的调用器类型或根据环境自动推导出对应的调用器实例
│   │   ├── UniAppInvoker.ts         # [Concrete Invoker] UniApp 调用器
│   │   └── WebInvoker.ts            # [Concrete Invoker] Web 调用器
│   │
│   ├── strategies/                  # [Strategy] 策略层
│   │   ├── BaseStrategy.ts          # [Abstract Class] 策略基类/接口定义，职责：定义 abstract pay() 和通用校验逻辑
│   │   ├── WechatStrategy.ts        # [Concrete Strategy] 微信支付策略
│   │   └── AlipayStrategy.ts        # [Concrete Strategy] 支付宝支付策略
│   │
│   ├── types/                       # [Type Definitions]
│   │   ├── errors.ts                # Payment Error Code
│   │   ├── http.ts                  # 最小的HttpClient
│   │   ├── index.ts                 # 汇总导出
│   │   ├── invoker.ts               # 支付执行器接口
│   │   ├── lifecycle.ts             # 插件中维护的状态机类型和支付上下文状态
│   │   ├── plugin.ts                # PluginAbortError，插件流转中的专用错误
│   │   └── protocol.ts              # 核心协议：UnifiedPaymentParamsPaymentResult
│   │
│   ├── utils/
│   │   ├── env.ts                   # 环境检测 (isWechat, isMobile)
│   │   ├── http.ts                  # 使用原生fetch方法，封装一个简单的GET/POST请求，封装成createDefaultFetcher函数
│   │   ├── Poller.ts                # 轮询查单机
│   │   ├── ScriptLoader.ts          # 脚本动态加载器
│   │   └── sign.ts                  # 签名算法工具 (MD5, SHA256)
│   │
│   └── index.ts                     # [Entry] 库入口，负责导出 Context 和 Strategies
│
├── tests/                           # 测试用例 (Vitest/Jest)
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
