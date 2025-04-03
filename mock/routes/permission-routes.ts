export const permissionRouter = {
  id: 11,
  parentId: 0,
  title: '权限管理',
  path: '/permission',
  childrenList: [
    {
      id: 111,
      parentId: 11,
      title: '页面权限',
      name: 'PermissionPage',
      path: '/permission/page/index',
      bound: ['admin'],
    },
    {
      id: 112,
      parentId: 11,
      title: '按钮权限',
      path: '/permission/button',
      childrenList: [
        {
          id: 1121,
          parentId: 112,
          title: '路由返回按钮权限',
          name: 'PermissionButtonMenus',
          path: '/permission/button/router',
          buttonList: ['permission:btn:add', 'permission:btn:edit', 'permission:btn:delete'],
        },
        {
          id: 1122,
          parentId: 112,
          title: '登录接口返回按钮权限',
          name: 'PermissionButtonPerms',
          path: '/permission/button/perms',
        },
      ],
    },
  ],
};
