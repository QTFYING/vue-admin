# Cashier SDK 设计思路

## 目录结构

```shell
Cashier/
├── src/
│   ├── core/
│   │   ├── PaymentSDK.ts       # SDK 入口类 (类似 ECharts 实例)
│   │   ├── Context.ts          # 全局配置上下文 (环境、商户ID等)
│   │   └── EventBus.ts         # 事件总线 (发布订阅)
│   ├── types/
│   │   ├── global.d.ts         # 全局类型定义
│   │   └── index.ts            # 核心 Interface 定义
│   ├── strategies/             # 策略层 (Strategy Pattern)
│   │   ├── PaymentStrategy.ts  # 抽象基类 (定义规范)
│   │   ├── WechatStrategy.ts   # 微信支付实现
│   │   └── AlipayStrategy.ts   # 支付宝实现
│   ├── utils/
│   │   ├── platform.ts         # 环境判断 (IsWechat, IsIOS...)
│   │   └── errors.ts           # 统一错误类
│   └── index.ts                # 统一导出
├── package.json
├── tsconfig.json
└── rollup.config.js            # 建议使用 Rollup 打包 SDK
```

## 核心设计思路
