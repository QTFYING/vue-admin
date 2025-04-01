export const systemRouter = {
  path: '/system',
  meta: {
    title: '系统管理',
    icon: 'ep:lollipop',
    rank: 11,
  },
  children: [
    {
      path: '/system/users/index',
      name: 'SystemUser',
      meta: {
        title: '用户管理',
        roles: ['admin'],
      },
    },
    {
      path: '/system/roles/index',
      name: 'SystemRoles',
      meta: {
        title: '角色管理',
        roles: ['admin'],
      },
    },
    {
      path: '/system/menus/index',
      name: 'SystemMenus',
      meta: {
        title: '菜单管理',
        roles: ['admin'],
      },
    },
  ],
};
