const Layout = () => import('@/layouts/index.vue');

export default [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/login/index.vue'),
    meta: {
      title: '登录',
      showLink: false,
      rank: 101,
    },
  },
  {
    path: '/redirect',
    component: Layout,
    meta: {
      title: '加载中...',
      showLink: false,
      rank: 102,
    },
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/layouts/redirect.vue'),
      },
    ],
  },
] satisfies Array<RouteConfigsTable>;
