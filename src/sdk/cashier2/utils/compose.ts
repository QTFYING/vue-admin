import type { Middleware, MiddlewareContext, Next } from '../types/middleware';

/**
 * 组合中间件 (The Onion Model Engine)
 * 核心逻辑：递归调用
 */
export function compose(middleware: Middleware[]) {
  return function (context: MiddlewareContext, next?: Next) {
    let index = -1;

    function dispatch(i: number): Promise<void> {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));
      index = i;

      let fn = middleware[i];

      // 如果已经是最后一个中间件，尝试调用外部传入的 next (通常是核心支付逻辑)
      if (i === middleware.length) fn = next as any;

      if (!fn) return Promise.resolve();

      try {
        // 执行当前中间件，并将 dispatch(i + 1) 作为 next 传进去
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  };
}
