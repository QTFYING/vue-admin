import { MockServer } from './utils';

export default MockServer([
  {
    url: '/pay/wechat/prepay',
    method: 'post',
    timeout: 100,
    response: ({ body }) => {
      if (body.chanel === 'wechat') {
        return {
          success: true,
          data: { timeStamp: '...', nonceStr: '...', package: 'prepay_id=xxx', signType: 'MD5', paySign: '...' },
        };
      } else {
        const formHtml = '<form id="payForm" action="https://openapi.alipay.com/gateway.do" method="post">...自动提交...</form>';
        return {
          success: true,
          data: { formHtml },
        };
      }
    },
  },
]);
