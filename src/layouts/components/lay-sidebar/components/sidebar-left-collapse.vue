<template>
  <div class="left-collapse">
    <IconifyIconOffline
      v-tippy="{
        content: isActive ? '点击折叠' : '点击展开',
        theme: tooltipEffect,
        hideOnClick: 'toggle',
        placement: 'right',
      }"
      :icon="MenuFold"
      :class="[iconClass, themeColor === 'light' ? '' : 'text-primary']"
      :style="{ transform: isActive ? 'none' : 'rotateY(180deg)' }"
      @click="toggleClick"
    />
  </div>
</template>

<script setup lang="ts">
  import { useNav } from '@/layouts/hooks/use-nav';
  import { useGlobal } from '@pureadmin/utils';
  import { computed } from 'vue';

  import MenuFold from '~icons/ri/menu-fold-fill';

  interface Props {
    isActive: boolean;
  }

  withDefaults(defineProps<Props>(), {
    isActive: false,
  });

  const { tooltipEffect } = useNav();

  const iconClass = computed(() => {
    return ['mb-1', 'w-[20px]', 'h-[20px]', 'cursor-pointer', 'duration-[100ms]'];
  });

  const { $storage } = useGlobal<GlobalPropertiesApi>();
  const themeColor = computed(() => $storage.layout?.themeColor);

  const emit = defineEmits<{
    (e: 'toggleClick'): void;
  }>();

  const toggleClick = () => {
    emit('toggleClick');
  };
</script>

<style lang="scss" scoped>
  .left-collapse {
    position: absolute;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 40px;
    line-height: 40px;
    box-shadow: 0 0 6px -3px var(--el-color-primary);
  }
</style>
