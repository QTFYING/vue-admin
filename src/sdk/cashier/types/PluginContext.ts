// src/types/PluginContext.ts

import type { HttpClient } from './HttpClient';
import type { Logger } from './Logger';
import type { SDKConfig } from './SDKConfig';

/**
 * 插件运行时上下文（PluginContext）
 *
 * 所有插件在 beforePay / afterPay 中，都会收到同一个上下文对象。
 * 上下文不随插件变化，是 SDK 为插件提供的“能力注入点”。
 */
export interface IPluginContext {
  /**
   * 客户端传入的 HTTP 实例（Axios/uni.request/Fetch 封装）
   */
  http: HttpClient;

  /**
   * 可选：日志系统（用户可根据需要传入）
   * 若不传入，则 SDK 可以提供一个 console-based 的默认 logger
   */
  logger?: Logger;

  /**
   * SDK 的全局配置
   * 包含 appId、env、密钥、debug 模式等信息
   */
  config: SDKConfig;

  /**
   * 环境 dev | prod | test
   */
  env: string;

  /**
   * SDK 版本号
   */
  version?: string;

  /**
   * 可扩展的 context 字段
   * 比如：
   *  - 当前用户 userId
   *  - 当前经纬度
   *  - 终端类型（web/mp/ios/android）
   */
  extra?: Record<string, any>;
}
