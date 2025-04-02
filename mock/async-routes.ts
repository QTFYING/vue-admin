// 模拟后端动态生成路由
import { permissionRouter, systemRouter } from './routes';
import { MockServer } from './utils';

export default MockServer([
  {
    url: '/resource/query',
    method: 'post',
    response: () => {
      return {
        success: true,
        data: [permissionRouter, systemRouter],
      };
    },
  },
  {
    url: '/resource/update',
    method: 'post',
    response: () => {
      return {
        success: true,
        data: null,
      };
    },
  },
]);
