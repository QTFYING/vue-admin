import type { HttpClient } from '../http/HttpClient';

export type RequestDecorator = (opts: {
  url: string;
  method: string;
  headers: Record<string, string>;
  data?: any;
}) => Promise<void> | void;
export type ResponseHandler = (res: any) => any;

export interface PaymentSDKConfig {
  http: HttpClient;
  apiBaseUrl: string;
  getToken?: () => string | Promise<string>;
  decorators?: RequestDecorator[]; // per-instance decorators
  onRequest?: RequestDecorator; // single instance-level hook
  onResponse?: ResponseHandler; // instance-level response transform
}

/**
 * PaymentContext: multi-instance context manager
 * - create(name, config)
 * - get(name)
 * - registerGlobalDecorator(decorator)
 */
export class PaymentContext {
  private static instances: Map<string, PaymentContext> = new Map();
  private static globalDecorators: RequestDecorator[] = [];

  private constructor(private config: PaymentSDKConfig) {}

  static create(name: string, config: PaymentSDKConfig) {
    const inst = new PaymentContext(config);
    PaymentContext.instances.set(name, inst);
    return inst;
  }

  static get(name: string) {
    const inst = PaymentContext.instances.get(name);
    if (!inst) throw new Error(`PaymentContext '${name}' not found`);
    return inst;
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

  async getToken(): Promise<string> {
    if (!this.config.getToken) return '';
    const t = this.config.getToken();
    return typeof t === 'string' ? t : await t;
  }

  getDecorators() {
    return [...PaymentContext.globalDecorators, ...(this.config.decorators || [])];
  }

  getConfig() {
    return this.config;
  }
}
