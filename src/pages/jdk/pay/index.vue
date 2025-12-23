<template>
  <PayContent />
</template>

<script setup lang="ts">
  import { useCashierProvider } from '@/hooks/use-cashier';
  import { http } from '@/utils/http';
  import { defineAsyncComponent } from 'vue';

  /**
   * 核心适配器：将客户端的 service 包装成 SDK 预期的“纯净版” HttpClient
   */
  const httpInstance = {
    post: async <T = any,>(url: string, data?: any): Promise<T> => {
      // 1. 调用原始 service
      // 这里的 res 可能是 { code: 200, data: { orderStr: '...' } }
      // 也可能是 { orderStr: '...' } 直接返回
      const res = await http.request<any>('post', url, { data });

      // 2. 自动脱壳逻辑
      // 如果发现有 code 和 data 字段，说明是包装形态，只返回内部的 data
      if (res && typeof res === 'object' && 'code' in res && 'data' in res) {
        return res.data as T;
      }

      // 3. 否则，说明已经是纯净数据或特殊结构，原样返回
      return res as T;
    },

    // 同理处理 get (如果 SDK 内部用到)
    get: async <T = any,>(url: string, params?: any): Promise<T> => {
      const res = await http.get<any, any>(url, { params });
      return res && 'code' in res && 'data' in res ? res.data : res;
    },
  };

  useCashierProvider({ config: { http: httpInstance, debug: true, invokerType: 'web' } });

  const PayContent = defineAsyncComponent(() => import('./pay-content.vue'));
</script>
