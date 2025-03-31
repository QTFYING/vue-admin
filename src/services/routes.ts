import { http } from '@/utils/http';

type Result = {
  success: boolean;
  data: Array<any>;
};

export const getAsyncRoutes = async () => {
  const res = await http.request<Result>('get', '/get-async-routes');
  window.GLOBAL = { ...window.GLOBAL, menus: res?.data };
  return Promise.resolve(res);
};
