import type { BaseStrategy } from '../strategies/BaseStrategy';
import { PaymentErrorCode } from '../types';
import { Poller } from '../utils/Poller';
import { EventBus } from './EventBus';
import { PaymentError } from './PaymentError';

// 引入新架构的类型定义
import type {
  HttpClient,
  PaymentContextState,
  PaymentPlugin,
  PaymentResult,
  PaymentStatus,
  UnifiedPaymentParams,
} from '../types';
import { createDefaultFetcher } from '../utils/http';

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

  // 轮询器实例
  private activePoller: Poller | null = null;

  // 存个上下文，防止在轮询等待期间数据丢失
  private _lastContext = {} as PaymentContextState;

  constructor(config?: SDKConfig) {
    super();
    const { http } = config ?? {};
    this.http = http ?? createDefaultFetcher();
  }

  /**
   * 注册策略 (use Strategy)
   */
  registerStrategy(strategy: BaseStrategy): this {
    // 关键：注入 Context 引用，让 Strategy 能调用 this.context.request
    // @ts-ignore
    strategy.context = this;

    if (this.strategies.has(strategy.name)) {
      console.warn(`[PaymentContext] Strategy "${strategy.name}" is being overwritten.`);
    }
    this.strategies.set(strategy.name, strategy);
    return this;
  }

  /**
   * 注册插件 (use Plugin)
   * 替代了原本的 useMiddleware
   */
  use(plugin: PaymentPlugin): this {
    // 处理排序逻辑 (enforce: pre/post)
    if (plugin.enforce === 'pre') {
      this.plugins.unshift(plugin);
    } else {
      this.plugins.push(plugin);
    }
    return this;
  }

  /**
   * [新增] Hook 执行引擎
   * 串行执行所有插件的指定生命周期钩子
   */
  private async applyHook(hookName: keyof PaymentPlugin, ctx: PaymentContextState, ...args: any[]) {
    for (const plugin of this.plugins) {
      const hook = plugin[hookName];
      if (typeof hook === 'function') {
        try {
          // @ts-ignore
          await hook.call(plugin, ctx, ...args);
        } catch (error) {
          console.error(`[Plugin Error] Plugin "${plugin.name}" failed at hook "${hookName}"`, error);

          // 关键生命周期报错直接阻断
          if (['onBeforePay', 'onBeforeSign', 'onBeforeInvoke'].includes(hookName)) {
            throw error;
          }
        }
      }
    }
  }

  /**
   * 核心执行方法 (execute)
   * 严格遵循 5 阶段生命周期
   */
  async execute(strategyName: string, params: UnifiedPaymentParams): Promise<PaymentResult> {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new PaymentError(PaymentErrorCode.INVALID_CONFIG, `Strategy "${strategyName}" not registered.`);
    }

    // 0. 初始化运行时上下文
    const ctx: PaymentContextState = {
      params,
      state: {},
    };

    try {
      // --- Stage 1: 准备 (Bootstrap) ---
      // 场景：参数校验、权限检查、Loading 开启
      this.emit('beforePay', params);
      await this.applyHook('onBeforePay', ctx);

      // --- Stage 2: 交互 (Negotiation) ---
      // 场景：Token 注入、URL 修改、签名
      await this.applyHook('onBeforeSign', ctx);
      // 注意：Strategy 内部此时会调用 this.context.request 去请求后端
      await this.applyHook('onAfterSign', ctx);

      // --- Stage 3: 适配 (Adaptation) ---
      // 场景：埋点上报、动态加载 JS-SDK 脚本
      await this.applyHook('onBeforeInvoke', ctx);

      // --- Stage 4: 执行 (Execution) ---
      this.emit('payStart', { strategyName });

      // 定义状态变更回调 (用于轮询通知插件)
      const onStateChange = (status: PaymentStatus) => {
        ctx.currentStatus = status;
        this.emit('statusChange', { status, result: ctx.result });
        this.applyHook('onStateChange', ctx, status);
      };

      // 执行真实的支付逻辑 (Strategy.pay)
      // 传入 onStateChange 让 Strategy 在内部轮询时也能通知到插件
      // @ts-ignore
      const result = await strategy.pay(ctx.params, onStateChange);
      ctx.result = result;

      // --- Stage 5: 结算 (Settlement - Success) ---
      if (result.status === 'success') {
        this.emit('success', result);

        await this.applyHook('onSuccess', ctx, result);
      } else {
        // Cancel 也可以视为一种 Fail
        this.emit('fail', result);
        await this.applyHook('onFail', ctx, result);
      }

      return result;
    } catch (error: any) {
      // --- Stage 5: 结算 (Settlement - Error) ---
      // 归一化错误
      const errResult = {
        code: error.code || PaymentErrorCode.UNKNOWN,
        transactionId: error.transactionId || 'PaymentError',
        status: error.status,
        raw: error.raw,
      };

      this.emit('fail', errResult);
      await this.applyHook('onFail', ctx, errResult);

      throw errResult;
    } finally {
      // --- Finalize ---
      this._lastContext = ctx;
      // 无论成功失败，必须执行 (如关闭 Loading)
      await this.applyHook('onCompleted', ctx);
    }
  }

  /**
   * 手动开启轮询模式
   * 保留此方法以支持二维码扫码场景
   */
  startPolling(strategyName: string, orderId: string) {
    this.stopPolling(); // 防御性编程

    const strategy = this.strategies.get(strategyName);
    if (!strategy) return;

    this.activePoller = new Poller({ interval: 3000 });
    console.log(`[PaymentContext] Manual polling started for: ${orderId}`);

    // 构建上下文，以便触发插件钩子
    const ctx: PaymentContextState = { ...this._lastContext };

    this.activePoller
      .start(
        async () => {
          // 使用 Strategy 的查单接口 (内部会走 HTTP 注入)
          const res = await strategy.getPaymentStatus(orderId);

          // 触发 Hook 和 事件
          this.emit('statusChange', { status: res.status, result: res });
          this.applyHook('onStateChange', ctx, res.status);

          return res;
        },
        (res) => res.status === 'success' || res.status === 'fail',
      )
      .then((finalResult) => {
        ctx.result = finalResult;

        if (finalResult.status === 'success') {
          this.emit('success', finalResult);
          this.applyHook('onSuccess', ctx, finalResult);
        } else {
          this.emit('fail', finalResult);
          this.applyHook('onFail', ctx, finalResult);
        }
        this.applyHook('onCompleted', ctx);
      })
      .catch((err) => {
        console.warn('[PaymentContext] Polling stopped:', err.message);
      });
  }

  stopPolling() {
    if (this.activePoller) {
      this.activePoller.stop();
      this.activePoller = null;
    }
  }

  getRegisteredStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
}
