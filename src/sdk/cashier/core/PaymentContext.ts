import type { HttpProxy } from '../http/HttpProxy';

export type RequestDecorator = (opts: {
  url: string;
  method: string;
  headers: Record<string, string>;
  data?: unknown;
}) => Promise<void> | void;

export type ResponseHandler<T = any, R = any> = (res: T) => R;

export interface PaymentSDKConfig {
  http: typeof HttpProxy;
  apiBaseUrl: string;
  getToken?: () => string | Promise<string | null | undefined>;
  decorators?: RequestDecorator[];
  onRequest?: RequestDecorator;
  onResponse?: ResponseHandler;
}

/**
 * PaymentContext: multi-instance context manager
 */
export class PaymentContext {
  private static instances: Map<string, PaymentContext> = new Map();
  private static globalDecorators: RequestDecorator[] = [];

  private constructor(private config: PaymentSDKConfig) {}

  static create(name: string, config: PaymentSDKConfig) {
    if (PaymentContext.instances.has(name)) {
      console.warn(`[PaymentSDK] Context '${name}' already exists. It will be overwritten.`);
    }
    const inst = new PaymentContext(config);
    PaymentContext.instances.set(name, inst);
    return inst;
  }

  static get(name: string) {
    const inst = PaymentContext.instances.get(name);
    if (!inst) throw new Error(`PaymentContext '${name}' not found. Make sure to call create() first.`);
    return inst;
  }

  static remove(name: string) {
    return PaymentContext.instances.delete(name);
  }

  static registerGlobalDecorator(d: RequestDecorator) {
    PaymentContext.globalDecorators.push(d);
  }

  getHttp() {
    return this.config.http;
  }

  getBaseUrl() {
    return this.config.apiBaseUrl;
  }

  // 优化 5: 更严谨的 Token 获取逻辑
  async getToken(): Promise<string | undefined> {
    if (!this.config.getToken) return undefined;

    const t = this.config.getToken();
    const tokenStr = t instanceof Promise ? await t : t;

    return tokenStr || undefined;
  }

  getDecorators(): RequestDecorator[] {
    const list = [...PaymentContext.globalDecorators];

    if (this.config.decorators) {
      list.push(...this.config.decorators);
    }

    if (this.config.onRequest) {
      list.push(this.config.onRequest);
    }

    return list;
  }

  getConfig() {
    return this.config;
  }
}
