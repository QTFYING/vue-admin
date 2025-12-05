// src/index.ts

// 导出核心类
export { PaymentContext } from './core/payment-context';

// 导出策略基类（方便用户自定义扩展）
export { BaseStrategy } from './strategies/base-strategy';

// 导出内置策略
export { AlipayStrategy, WechatStrategy } from './strategies';

// 导出类型定义
export * from './types/protocol';
