// src/types/Logger.ts

/**
 * SDK 的日志接口（可选）
 * 使用方可注入自己的 logger，如 Sentry、内部埋点、ELK 等
 */
export interface Logger {
  info?(message: string, ...args: any[]): void;
  warn?(message: string, ...args: any[]): void;
  error?(message: string | Error, ...args: any[]): void;
  debug?(message: string, ...args: any[]): void;
}

/**
 * SDK 默认 logger（使用 console.*）
 * 若用户不传入 logger，将自动使用此默认 logger
 */
export const DefaultLogger: Logger = {
  info: (...args) => console.info('[SDK]', ...args),
  warn: (...args) => console.warn('[SDK]', ...args),
  error: (...args) => console.error('[SDK]', ...args),
  debug: (...args) => console.debug('[SDK]', ...args),
};
