// 模拟后端动态生成路由
import { permissionRouter, systemRouter } from './routes';
import { MockServer } from './utils';

export default MockServer([
  {
    url: '/get-async-routes',
    method: 'get',
    response: () => {
      return {
        success: true,
        data: [permissionRouter, systemRouter],
      };
    },
  },
]);
