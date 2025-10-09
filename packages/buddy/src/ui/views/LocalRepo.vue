<script setup lang="ts">
  import PluginCard from '@/ui/components/home/PackageCard.vue';
  import { Alert, ToolBar } from '@coffic/cosy-ui/vue';
  import { useLocal } from '@/ui/composables/useLocal';
  import ButtonRefresh from '@/ui/components/cosy/ButtonRefresh.vue';
  import ButtonFolder from '@/ui/components/cosy/ButtonFolder.vue';
  import { onMounted } from 'vue';
  import MarketContainer from '@/ui/components/market/MarketContainer.vue';

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
  <MarketContainer>
    <div class="flex flex-col gap-4">
      <ToolBar variant="compact" :bordered="false">
        <template #left>
          <div class="flex items-center gap-2">
            <ButtonFolder
              @click="openLocalDirectory"
              shape="circle"
              size="sm"
              tooltip="打开插件目录" />
            <ButtonRefresh
              @click="loadLocalPlugins"
              shape="circle"
              :loading="loadingPlugins"
              :disabled="loadingPlugins"
              tooltip="刷新插件列表"
              size="sm" />
          </div>
        </template>
      </ToolBar>
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
    </div>
  </MarketContainer>
</template>
