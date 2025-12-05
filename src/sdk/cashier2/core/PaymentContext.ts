import type { BaseStrategy } from '../strategies/BaseStrategy';
import type { HttpClient, PaymentContextState, PaymentPlugin, PaymentResult, UnifiedPaymentParams } from '../types';
import { PaymentErrorCode } from '../types';
import { createDefaultFetcher } from '../utils/http';
import { EventBus } from './EventBus';
import { PaymentError } from './PaymentError';
import { PluginDriver } from './PluginDriver';
import { PollingManager } from './PollingManager';

export interface SDKConfig {
  debug?: boolean;
  http?: HttpClient; // [新增] 依赖注入
}

export class PaymentContext extends EventBus {
  // [核心] 1. 策略池
  private strategies: Map<string, BaseStrategy> = new Map();

  // [核心] 2. 插件池 (替代 Middlewares)
  private plugins: PaymentPlugin[] = [];

  // [核心] 3. HTTP 客户端 (依赖注入)
  public readonly http: HttpClient;

  // [新增] 轮询管理器 (组合模式)
  private pollingManager: PollingManager;

  // 插件分发器
  public driver: PluginDriver;

  // 存个上下文，防止在轮询等待期间数据丢失
  private _lastContextState: Record<string, any> = {} as PaymentContextState;

  constructor(config: SDKConfig = {}) {
    super();

    const { http } = config ?? {};
    this.http = http ?? createDefaultFetcher();
    this.driver = new PluginDriver(this.plugins || []);
    // 初始化轮询管理器，并将 this 传给它
    this.pollingManager = new PollingManager(this);
  }

  /**
   * 注册策略 (use Strategy)
   */
  register(strategy: BaseStrategy): this {
    // @ts-ignore
    strategy.context = this;
    if (this.strategies.has(strategy.name)) {
      console.warn(`[PaymentContext] Strategy "${strategy.name}" overwritten.`);
    }
    this.strategies.set(strategy.name, strategy);
    return this;
  }

  /**
   * 注册插件 (use Plugin)
   */
  use(plugin: PaymentPlugin): this {
    plugin.enforce === 'pre' ? this.plugins.unshift(plugin) : this.plugins.push(plugin);
    return this;
  }

  async execute(strategyName: string, params: UnifiedPaymentParams): Promise<PaymentResult> {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new PaymentError(PaymentErrorCode.INVALID_CONFIG, `Strategy "${strategyName}" not registered.`);
    }

    // 0. 初始化运行时上下文
    const ctx: PaymentContextState = { params, state: {} };

    try {
      // --- Stage 1: 准备 (Bootstrap) ---
      // 场景：参数校验、权限检查、Loading 开启
      this.emit('beforePay', params);
      await this.driver.implant('onBeforePay', ctx);

      // --- Stage 2: 交互 (Negotiation) ---
      // 场景：Token 注入、URL 修改、签名
      await this.driver.implant('onBeforeSign', ctx);

      // 注意：Strategy 内部此时会调用 this.context.request 去请求后端
      await this.driver.implant('onAfterSign', ctx);

      // --- Stage 3: 适配 (Adaptation) ---
      // 场景：埋点上报、动态加载 JS-SDK 脚本
      await this.driver.implant('onBeforeInvoke', ctx);

      // --- Stage 4: 执行 (Execution) ---
      this.emit('payStart', { strategyName });

      // 传递 callback 给 strategy (可选支持)
      // const onStateChange = (status: PaymentStatus) => {
      //   ctx.currentStatus = status;
      //   this.emit('statusChange', { status, result: ctx.result });
      //   this.driver.implant('onStateChange', ctx, status);
      // };

      // 执行真实的支付逻辑 (Strategy.pay)
      // 传入 onStateChange 让 Strategy 在内部轮询时也能通知到插件
      // @ts-ignore
      const result = await strategy.pay(ctx.params /*, onStateChange */);
      ctx.result = result;

      // Stage 5: Settlement
      if (result.status === 'success') {
        this.emit('success', result);
        await this.driver.implant('onSuccess', ctx, result);
      } else {
        this.emit('fail', result);
        await this.driver.implant('onFail', ctx, result);
      }

      // [关键] 成功返回前，存档！
      this._lastContextState = ctx.state;
      return result;
    } catch (error: any) {
      // 归一化错误
      const errResult =
        error instanceof PaymentError ? error : new PaymentError(PaymentErrorCode.UNKNOWN, error.message || 'Unknown Error');

      this.emit('fail', {} as PaymentResult);
      await this.driver.implant('onFail', ctx, errResult);

      // [关键] 出错也要存档
      this._lastContextState = ctx.state;
      throw errResult;
    } finally {
      await this.driver.implant('onCompleted', ctx);
    }
  }

  // --- 轮询代理方法 (Delegation) ---

  /**
   * 手动开启轮询
   * 实际逻辑委托给 pollingManager
   */
  public startPolling(strategyName: string, orderId: string) {
    this.pollingManager.start(strategyName, orderId);
  }

  public stopPolling() {
    this.pollingManager.stop();
  }

  // --- 暴露给 PollingManager 的内部能力 (Internal APIs) ---

  /**
   * 获取指定策略
   */
  public getStrategy(name: string): BaseStrategy | undefined {
    return this.strategies.get(name);
  }

  /**
   * 获取最近一次的上下文状态 (用于状态恢复)
   */
  public getLastContextState(): Record<string, any> {
    return this._lastContextState;
  }
}
