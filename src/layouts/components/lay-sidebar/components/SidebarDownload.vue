<!-- 下载中心 -->
<template>
  <span class="fullscreen-icon navbar-bg-hover" @click="toggle">
    <IconifyIconOffline :icon="DownloadIcon" style="font-weight: 900; font-size: 18px" />
  </span>
</template>

<script setup lang="ts">
  import { useNav } from '@/layouts/hooks/useNav';
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
