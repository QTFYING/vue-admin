import { http } from '@/utils/http';

export type UserResult = {
  success: boolean;
  data: {
    /** 头像 */
    avatar: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 当前登录用户的角色 */
    roles: Array<string>;
    /** 按钮级别权限 */
    permissions: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http
    .request<any>('post', '/login', { data }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    .then((res) => {
      const { username, mobile, boundRoleList, token } = res.data;
      return {
        ...res,
        data: {
          avatar: '',
          username,
          nickname: mobile,
          roles: boundRoleList ?? ['admin'],
          permissions: ['*:*:*'],
          accessToken: token,
          refreshToken: undefined,
          expires: undefined,
        },
      };
    });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>('post', '/refresh-token', { data });
};
