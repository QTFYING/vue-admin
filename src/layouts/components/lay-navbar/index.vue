/** vertical 版菜单栏右侧 */

<template>
  <div class="navbar bg-[#fff] shadow-xs shadow-[rgba(0,21,41,0.08)]">
    <LaySidebarTopCollapse
      v-if="device === 'mobile'"
      class="hamburger-container"
      :is-active="pureApp.sidebar.opened"
      @toggleClick="toggleSideBar"
    />

    <LaySidebarBreadCrumb v-if="layout !== 'mix' && device !== 'mobile'" class="breadcrumb-container" />

    <LayNavMix v-if="layout === 'mix'" />

    <div v-if="layout === 'vertical'" class="vertical-header-right">
      <!-- 菜单搜索 -->
      <LaySearch id="header-search" />

      <!-- 全屏 -->
      <LaySidebarFullScreen id="full-screen" />

      <!-- 消息通知 -->
      <LayNotice id="header-notice" />

      <!-- 退出登录 -->
      <el-dropdown trigger="hover">
        <span class="el-dropdown-link navbar-bg-hover select-none">
          <img :src="userAvatar" />
          <p v-if="username" class="dark:text-white">{{ username }}</p>
        </span>

        <template #dropdown>
          <el-dropdown-menu class="logout">
            <el-dropdown-item @click="logout">
              <IconifyIconOffline :icon="LogoutCircleRLine" style="margin: 5px" />
              退出系统
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <span class="set-icon navbar-bg-hover" title="打开系统配置" @click="onPanel">
        <IconifyIconOffline :icon="Setting" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useNav } from '@/layouts/hooks/use-nav';
  import LayNotice from '../lay-notice/index.vue';
  import LaySearch from '../lay-search/index.vue';
  import LayNavMix from '../lay-sidebar/nav-mix.vue';
  import LaySidebarBreadCrumb from '../lay-sidebar/components/sidebar-bread-crumb.vue';
  import LaySidebarFullScreen from '../lay-sidebar/components/sidebar-full-screen.vue';
  import LaySidebarTopCollapse from '../lay-sidebar/components/sidebar-top-collapse.vue';

  import LogoutCircleRLine from '~icons/ri/logout-circle-r-line';
  import Setting from '~icons/ri/settings-3-line';

  const { layout, device, logout, onPanel, pureApp, username, userAvatar, toggleSideBar } = useNav();
</script>

<style lang="scss" scoped>
  .navbar {
    width: 100%;
    height: var(--pure-menu-bar-height);
    overflow: hidden;

    .hamburger-container {
      float: left;
      height: 100%;
      line-height: 48px;
      cursor: pointer;
    }

    .vertical-header-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      min-width: 280px;
      height: 48px;
      color: #000000d9;

      .el-dropdown-link {
        display: flex;
        align-items: center;
        justify-content: space-around;
        height: 48px;
        padding: 10px;
        color: #000000d9;
        cursor: pointer;

        p {
          font-size: 14px;
        }

        img {
          width: 22px;
          height: 22px;
          border-radius: 50%;
        }
      }
    }

    .breadcrumb-container {
      float: left;
      margin-left: 16px;
    }
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
