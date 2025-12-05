// 导出核心类
export { PaymentContext } from './core/payment-context';

// 导出策略基类（方便用户自定义扩展）
export { PayError } from './core/payment-error';
export { BaseStrategy } from './strategies/base-strategy';
export { ScriptLoader } from './utils/script-loader';

// 导出内置策略
export { AlipayStrategy, WechatStrategy } from './strategies';

// 导出类型定义
export * from './types/errors';
export * from './types/lifecycle';
export * from './types/protocol';
