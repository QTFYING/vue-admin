<template>
  <component :is="isExternalLink ? 'a' : 'router-link'" v-bind="getLinkProps(to)">
    <slot />
  </component>
</template>

<script setup lang="ts">
  import { menuType } from '@/layouts/types';
  import { isUrl } from '@pureadmin/utils';
  import { computed } from 'vue';

  const props = defineProps<{ to: menuType }>();

  const isExternalLink = computed(() => isUrl(props.to.name));

  const getLinkProps = (item: menuType) => {
    if (isExternalLink.value) {
      return {
        href: item.name,
        target: '_blank',
        rel: 'noopener',
      };
    }
    return { to: item };
  };
</script>
