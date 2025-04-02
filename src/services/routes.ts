import { http } from '@/utils/http';

type Result = {
  success: boolean;
  data: Array<any>;
};

export const getAsyncRoutes = async () => {
  return http.post<Result, object>('/resource/query').then((res) => {
    const routes = res.data;
    const loop = (data) => {
      const _data = data?.map((item, index) => {
        const { childrenList: children } = item;

        const _children = children?.map((record) => ({
          ...record,
          parentId: item.parentId,
          siblingsNo: item?.childrenList?.length ?? 0,
        }));

        const options = {
          id: item.id,
          path: item.path,
          name: item.name, // 组件名称，必填
          meta: {
            title: item.title,
            roles: ['common'],
            auths: item.buttonList ?? [],
            rank: index + 1,
            showParent: item.siblingsNo === 1,
          },
        };

        if (_children?.length > 0) {
          Object.assign(options, { children: loop(_children) });
        }

        return options;
      });
      return _data;
    };
    return loop(routes);
  });
};
