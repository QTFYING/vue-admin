<template>
  <PayContent />
</template>

<script setup lang="ts">
  import { useCashierProvider } from '@/hooks/use-cashier';
  import { http } from '@/utils/http';
  import { defineAsyncComponent } from 'vue';

  useCashierProvider({ config: { http } });

  const PayContent = defineAsyncComponent(() => import('./pay-content.vue'));
</script>
