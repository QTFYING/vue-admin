export type RequestDecorator = (opts: {
  url: string;
  method: string;
  headers: Record<string, string>;
  data?: unknown;
}) => Promise<void> | void;

export type ResponseHandler<T = any, R = any> = (res: T) => R;

export interface PaymentSDKConfig {
  apiBase: string;
  getToken?: () => string | Promise<string | null | undefined>;
  decorators?: RequestDecorator[];
  onRequest?: RequestDecorator;
  onResponse?: ResponseHandler;
}

export class PaymentContext {
  // --- 静态注册表区域 (Optional Registry) ---
  private static instances: Map<string, PaymentContext> = new Map();
  private static globalDecorators: RequestDecorator[] = [];

  // --- 实例区域 (Instance Logic) ---

  // 核心修改：构造函数现在是 public 的！
  public constructor(private readonly config: PaymentSDKConfig) {}

  /**
   * 快捷工厂方法：创建并自动注册 (兼容以前的写法)
   */
  static create(name: string, config: PaymentSDKConfig): PaymentContext {
    const inst = new PaymentContext(config);
    PaymentContext.register(name, inst);
    return inst;
  }

  /**
   * 手动注册一个已存在的实例 (适合配合 new 使用)
   */
  static register(name: string, context: PaymentContext): void {
    if (PaymentContext.instances.has(name)) {
      console.warn(`[PaymentSDK] Context '${name}' is being overwritten.`);
    }
    PaymentContext.instances.set(name, context);
  }

  /**
   * 获取已注册的实例
   */
  static get(name: string): PaymentContext {
    const inst = PaymentContext.instances.get(name);
    if (!inst) {
      throw new Error(`[PaymentSDK] Context '${name}' not found. Ensure it is created or registered.`);
    }
    return inst;
  }

  static remove(name: string): boolean {
    return PaymentContext.instances.delete(name);
  }

  getConfig(): PaymentSDKConfig {
    return this.config;
  }

  getBaseUrl(): string {
    return this.config.apiBase;
  }

  async getToken(): Promise<string | undefined> {
    if (!this.config.getToken) return undefined;
    const t = this.config.getToken();
    const tokenStr = t instanceof Promise ? await t : t;
    return tokenStr || undefined;
  }

  static registerGlobalDecorator(d: RequestDecorator): void {
    PaymentContext.globalDecorators.push(d);
  }

  getDecorators(): RequestDecorator[] {
    // 1. 全局装饰器
    const list = [...PaymentContext.globalDecorators];

    // 2. 实例级数组装饰器
    if (this.config.decorators) {
      list.push(...this.config.decorators);
    }

    // 3. 实例级单钩子 (onRequest)
    if (this.config.onRequest) {
      list.push(this.config.onRequest);
    }

    return list;
  }

  getResponseHandler(): ResponseHandler | undefined {
    return this.config.onResponse;
  }
}
