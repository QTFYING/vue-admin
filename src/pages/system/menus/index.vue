<template>
  <div>菜单管理</div>
</template>

<script setup lang="ts">
  import { initRouter } from '@/routes/utils';
  import { usePermissionStoreHook } from '@/stores/modules/permission';
  import { useUserStoreHook } from '@/stores/modules/user';
  import { storageLocal } from '@pureadmin/utils';
  import { computed, type CSSProperties, ref } from 'vue';

  defineOptions({ name: 'PermissionPage' });

  const elStyle = computed((): CSSProperties => {
    return {
      width: '85vw',
      justifyContent: 'start',
    };
  });

  const username = ref(useUserStoreHook()?.username);

  const options = [
    {
      value: 'admin',
      label: '管理员角色',
    },
    {
      value: 'common',
      label: '普通角色',
    },
  ];

  function onChange() {
    useUserStoreHook()
      .onLogin({ username: username.value, password: 'admin123' })
      .then((res) => {
        if (res.success) {
          storageLocal().removeItem('async-routes');
          usePermissionStoreHook().clearAllCachePage();
          initRouter();
        }
      });
  }
</script>
