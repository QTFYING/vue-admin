import { http } from '@/utils/http';

type Result = {
  success: boolean;
  data: Array<any>;
};

export const getAsyncRoutes = async () => {
  return http.post<Result, object>('/resource/query').then((res) => {
    const routes = res.data;

    // 路由加工
    const loop = (data) => {
      const _data = data?.map((item, index) => {
        const { childrenList: children } = item;

        const _children = children?.map((record) => ({
          ...record,
          siblingsNo: item?.childrenList?.length ?? 0,
        }));

        const options = {
          path: item.path,
          meta: { title: item.title },
        };

        if (_children?.length > 0) {
          Object.assign(options, { meta: { ...options.meta, rank: index + 1 }, children: loop(_children) });
        } else {
          Object.assign(options, {
            name: item.name,
            meta: {
              ...options.meta,
              roles: ['admin'],
              showParent: item.siblingsNo === 1,
              auths: item.buttonList ?? [],
            },
          });
        }

        if (item?.parentId === 0) {
          Object.assign(options, { showLink: true });
        }

        return options;
      });

      return _data;
    };

    console.log('后台返回路由', loop(routes));

    // return loop(routes);

    // todo: 临时数据，后续替换为后台返回的路由

    return [
      {
        path: '/system',
        meta: {
          title: '系统管理',
          rank: 7,
        },
        children: [
          {
            path: '/system/users/index',
            name: 'SystemUser',
            meta: {
              title: '用户管理',
              roles: ['admin'],
              showParent: true,
              name: 'SystemUser',
              auths: [],
            },
          },
        ],
        showLink: false,
      },
    ];
  });
};
