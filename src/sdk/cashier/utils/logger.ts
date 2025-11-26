// src/utils/logger.ts

/**
 * @interface Logger
 * 日志接口，方便业务方注入自定义日志系统（如 Sentry、Logtail）
 */
export interface Logger {
  log(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

/**
 * @class DefaultLogger
 * 默认的日志实现，使用 console
 */
class DefaultLogger implements Logger {
  log(message: string, ...args: any[]): void {
    console.log(`[PaymentSDK][LOG] ${message}`, ...args);
  }
  warn(message: string, ...args: any[]): void {
    console.warn(`[PaymentSDK][WARN] ${message}`, ...args);
  }
  error(message: string, ...args: any[]): void {
    console.error(`[PaymentSDK][ERROR] ${message}`, ...args);
  }
}

/**
 * SDK 使用的 Logger 实例
 * 业务方可以通过 ManagerConfig 注入覆盖
 */
let currentLogger: Logger = new DefaultLogger();

export const logger = currentLogger;

/**
 * 允许在运行时替换 SDK 的日志实例
 */
export function setLogger(newLogger: Logger): void {
  currentLogger = newLogger;
}
