<script setup lang="ts">
  import { useNav } from '@/layouts/hooks/useNav';
  import { ref, watch } from 'vue';

  const screenIcon = ref();
  const { toggle, isFullscreen, Fullscreen, ExitFullscreen } = useNav();

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

<template>
  <span class="fullscreen-icon navbar-bg-hover" @click="toggle">
    <IconifyIconOffline :icon="screenIcon" />
  </span>
</template>
