<script setup lang="ts">
  //   import PluginPage from '@/ui/components/home/PluginPage.vue';
  import { useLocal } from '@/ui/composables/useLocal';

  const { localPackages } = useLocal();
</script>

<template>
  <div class="w-full h-full flex flex-col overflow-hidden">
    <div class="flex-1">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-12">
        <div v-for="plugin in localPackages" :key="plugin.id">
          <!-- <PluginPage :plugin="plugin" /> -->
        </div>
      </div>
    </div>
  </div>
</template>
