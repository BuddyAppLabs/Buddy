<script setup lang="ts">
  import PluginCard from '@/ui/components/home/PackageCard.vue';
  import { Alert } from '@coffic/cosy-ui/vue';
  import { useRemote } from '@/ui/composables/useRemote';
  import { onMounted } from 'vue';

  const { remotePackages, loadRemotePackages } = useRemote();

  onMounted(async () => {
    await loadRemotePackages();
  });
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <template v-if="remotePackages.length > 0">
      <PluginCard
        v-for="sendablePackage in remotePackages"
        :key="sendablePackage.id"
        :package="sendablePackage"
        type="remote" />
    </template>
    <Alert v-else message="没有可用的远程插件" />
  </div>
</template>
