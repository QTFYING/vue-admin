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
  import { checkVersion } from 'version-rocket';

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
    beforeCreate() {
      const { version, name: title } = __APP_INFO__.pkg;
      const { VITE_PUBLIC_PATH, MODE } = import.meta.env;
      if (MODE === 'production') {
        checkVersion(
          {
            pollingTime: 100 * 60 * 5, // 5分钟
            localPackageVersion: version,
            originVersionFileUrl: `${location.origin}${VITE_PUBLIC_PATH}version.json`,
          },
          // options
          { title, description: '检测到新版本', buttonText: '立即更新' },
        );
      }
    },
  });
</script>
