import { MockServer } from './utils';

export default MockServer([
  {
    url: '/login',
    method: 'post',
    timeout: 100,
    response: ({ body }) => {
      if (body.username === 'admin') {
        return {
          success: true,
          data: {
            avatar: '',
            username: 'admin',
            nickname: '13100000000',
            // 一个用户可能有多个角色
            roles: ['admin'],
            // 按钮级别权限
            permissions: ['*:*:*'],
            accessToken: 'eyJhbGciOiJIUzUxMiJ9.admin',
            refreshToken: 'eyJhbGciOiJIUzUxMiJ9.adminRefresh',
            expires: '2030/10/30 00:00:00',
          },
        };
      } else {
        return {
          success: true,
          data: {
            avatar: '',
            username: 'common',
            nickname: '13100000001',
            roles: ['common'],
            permissions: ['permission:btn:add', 'permission:btn:edit'],
            accessToken: 'eyJhbGciOiJIUzUxMiJ9.common',
            refreshToken: 'eyJhbGciOiJIUzUxMiJ9.commonRefresh',
            expires: '2030/10/30 00:00:00',
          },
        };
      }
    },
  },
]);
