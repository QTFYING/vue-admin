<script lang="ts" setup>
  import { getConfig } from '@/config';

  const TITLE = getConfig('Title');
</script>

<template>
  <footer class="layout-footer text-[rgba(0,0,0,0.6)] dark:text-[rgba(220,220,242,0.8)]">
    Copyright © 2025
    <span class="hover:text-primary" target="_blank"> &nbsp;{{ TITLE }} </span>
  </footer>
</template>

<style lang="scss" scoped>
  .layout-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0 0 8px;
    font-size: 14px;
  }
</style>
