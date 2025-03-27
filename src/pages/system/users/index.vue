<template>
  <div>用户管理</div>
</template>

<script setup lang="ts">
  import { getAuths, hasAuth } from '@/routes/utils';

  defineOptions({
    name: 'PermissionButtonRouter',
  });
</script>
