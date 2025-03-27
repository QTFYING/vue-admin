import Mock from 'mockjs';
import { MockServer } from './utils';

export default MockServer([
  {
    url: '/mock/get-user-info',
    response: () => {
      return Mock.mock({
        id: '@guid',
        username: '@first',
        email: '@email',
        avatar: '@image("200x200")',
        role: 'admin',
      });
    },
  },
]);
