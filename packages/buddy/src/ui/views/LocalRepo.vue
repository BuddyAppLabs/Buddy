<script setup lang="ts">
  import PluginCard from '@/ui/components/home/PackageCard.vue';
  import { Alert, Container } from '@coffic/cosy-ui/vue';
  import { useLocal } from '@/ui/composables/useLocal';
  import ButtonRefresh from '@/ui/components/cosy/ButtonRefresh.vue';
  import ButtonFolder from '@/ui/components/cosy/ButtonFolder.vue';
  import { onMounted } from 'vue';

  const {
    localPackages,
    loadLocalPlugins,
    openLocalDirectory,
    loadingPlugins,
  } = useLocal();

  onMounted(() => {
    loadLocalPlugins();
  });
</script>

<template>
  <Container width="full" flex="col" gap="lg">
    <Container width="full" background="accent/80">
      <ButtonFolder
        @click="openLocalDirectory"
        shape="circle"
        width="xs"
        tooltip="打开插件目录" />
      <ButtonRefresh
        @click="loadLocalPlugins"
        shape="circle"
        :loading="loadingPlugins"
        :disabled="loadingPlugins"
        tooltip="刷新插件列表"
        width="xs" />
    </Container>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <template v-if="localPackages.length > 0">
        <PluginCard
          v-for="plugin in localPackages"
          :key="plugin.id"
          :package="plugin"
          type="local" />
      </template>
      <Alert v-else title="在本地仓库没有找到插件" :closable="false" />
    </div>
  </Container>
</template>
