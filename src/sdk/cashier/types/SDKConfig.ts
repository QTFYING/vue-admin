// src/types/SDKConfig.ts

import type { HttpClient } from '../http/HttpClient';
import type { Logger } from './Logger';

/**
 * SDK 的全局配置
 */
export interface SDKConfig {
  /**
   * AppId / ProjectId / MerchantId 等（由业务定义）
   */
  appId: string;

  /**
   * SDK 运行环境
   * - dev
   * - test
   * - prod
   * - staging
   */
  env?: string;

  /**
   * 是否开启调试模式
   */
  debug?: boolean;

  /**
   * 外部注入的 HTTP 客户端
   */
  http: HttpClient;

  /**
   * 可选：外部注入的 Logger
   * 若不注入，将使用默认 logger
   */
  logger?: Logger;

  /**
   * 可选：额外透传参数（SDK 内部全部会带入 PluginContext.extra）
   * 例如：
   *  - userId
   *  - 设备信息
   *  - 地理位置
   *  - Session 信息
   */
  extra?: Record<string, any>;

  /**
   * 可扩展字段
   */
  [key: string]: any;
}
