<template>
  <el-config-provider :locale="currentLocale">
    <router-view />
    <ReDialog />
  </el-config-provider>
</template>

<script lang="ts">
  import { ReDialog } from '@/components/ReDialog';
  import { ElConfigProvider } from 'element-plus';
  import zhCn from 'element-plus/es/locale/lang/zh-cn';
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'app',
    components: {
      [ElConfigProvider.name]: ElConfigProvider,
      ReDialog,
    },
    computed: {
      currentLocale() {
        return zhCn;
      },
    },
  });
</script>
