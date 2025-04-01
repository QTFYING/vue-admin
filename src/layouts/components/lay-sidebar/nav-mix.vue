/** mix 版菜单栏右侧 */
<template>
  <div v-if="device !== 'mobile'" v-loading="usePermissionStoreHook().wholeMenus.length === 0" class="horizontal-header">
    <el-menu
      ref="menuRef"
      router
      mode="horizontal"
      popper-class="pure-scrollbar"
      class="horizontal-header-menu"
      :default-active="defaultActive"
    >
      <el-menu-item
        v-for="route in usePermissionStoreHook().wholeMenus"
        :key="route.path"
        :index="resolvePath(route) || route.redirect"
      >
        <template #title>
          <strong class="text-base" :style="getDivStyle">
            <span class="select-none">
              {{ route.meta.title }}
            </span>
            <LaySidebarExtraIcon :extraIcon="route.meta.extraIcon" />
          </strong>
        </template>
      </el-menu-item>
    </el-menu>

    <div class="horizontal-header-right">
      <!-- 下载中心 -->
      <LaySidebarDownload id="download-center" />

      <!-- 菜单搜索 -->
      <LaySearch id="header-search" />

      <!-- 全屏 -->
      <LaySidebarFullScreen id="full-screen" />

      <!-- 消息通知 -->
      <LayNotice id="header-notice" />

      <!-- 退出登录 -->
      <el-dropdown trigger="click">
        <el-space>
          <img :src="userAvatar" width="24" style="border: 1px solid #999; border-radius: 15px" />
          <p v-if="username" class="dark:text-white">{{ username }}</p>
        </el-space>

        <template #dropdown>
          <el-dropdown-menu class="logout">
            <el-dropdown-item @click="logout">
              <IconifyIconOffline :icon="LogoutCircleRLine" style="margin: 5px" />
              退出系统
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useNav } from '@/layouts/hooks/use-nav';
  import { findRouteByPath, getParentPaths } from '@/routes/utils';
  import { usePermissionStoreHook } from '@/stores/modules/permission';
  import { isAllEmpty } from '@pureadmin/utils';
  import { nextTick, onMounted, ref, watch } from 'vue';
  import LayNotice from '../lay-notice/index.vue';
  import LaySearch from '../lay-search/index.vue';
  import LaySidebarDownload from '../lay-sidebar/components/sidebar-download.vue';
  import LaySidebarExtraIcon from '../lay-sidebar/components/sidebar-extra-icon.vue';
  import LaySidebarFullScreen from '../lay-sidebar/components/sidebar-full-screen.vue';

  import LogoutCircleRLine from '~icons/ri/logout-circle-r-line';

  const menuRef = ref();
  const defaultActive = ref(null);

  const { route, device, logout, onPanel, resolvePath, username, userAvatar, getDivStyle } = useNav();

  function getDefaultActive(routePath) {
    const wholeMenus = usePermissionStoreHook().wholeMenus;
    /** 当前路由的父级路径 */
    const parentRoutes = getParentPaths(routePath, wholeMenus)[0];
    defaultActive.value = !isAllEmpty(route.meta?.activePath)
      ? route.meta.activePath
      : findRouteByPath(parentRoutes, wholeMenus)?.children[0]?.path;
  }

  onMounted(() => {
    getDefaultActive(route.path);
  });

  nextTick(() => {
    menuRef.value?.handleResize();
  });

  watch(
    () => [route.path, usePermissionStoreHook().wholeMenus],
    () => {
      getDefaultActive(route.path);
    },
  );
</script>

<style lang="scss" scoped>
  :deep(.el-loading-mask) {
    opacity: 0.45;
  }

  .logout {
    width: 120px;

    ::v-deep(.el-dropdown-menu__item) {
      display: inline-flex;
      flex-wrap: wrap;
      min-width: 100%;
    }
  }
</style>
