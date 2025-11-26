// src/index.ts

// 导出核心类
export { PaymentContext } from './core/PaymentContext';

// 导出策略基类（方便用户自定义扩展）
export { BaseStrategy } from './strategies/BaseStrategy';

// 导出内置策略
export { WechatStrategy } from './strategies/WechatStrategy';
// export { AlipayStrategy } from './strategies/AlipayStrategy';

// 导出类型定义
export * from './types/protocol';
