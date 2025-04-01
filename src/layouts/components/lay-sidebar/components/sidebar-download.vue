<!-- 下载中心 -->
<template>
  <span class="fullscreen-icon navbar-bg-hover" @click="toggle">
    <IconifyIconOffline :icon="DownloadIcon" style="font-size: 18px; font-weight: 900" />
  </span>
</template>

<script setup lang="ts">
  import { useNav } from '@/layouts/hooks/use-nav';
  import { ref, watch } from 'vue';

  const screenIcon = ref();
  const { toggle, isFullscreen, Fullscreen, ExitFullscreen, DownloadIcon } = useNav();

  isFullscreen.value = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );

  watch(
    isFullscreen,
    (full) => {
      screenIcon.value = full ? ExitFullscreen : Fullscreen;
    },
    {
      immediate: true,
    },
  );
</script>
