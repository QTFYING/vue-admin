import { MockServer } from './utils';

export default MockServer([
  {
    url: '/deduct',
    method: 'post',
    timeout: 100,
    response: () => {
      return {
        success: true,
        data: {
          total: 100,
        },
      };
    },
  },
]);
