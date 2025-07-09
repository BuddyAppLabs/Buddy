<script setup lang="ts">
  import PluginCard from '@/ui/components/home/PackageCard.vue';
  import { useMarketStore } from '@/ui/stores/market-store';
  import { usePluginRepo } from '@/ui/composables/usePluginRepo';
  import { Alert } from '@coffic/cosy-ui/vue';

  const marketStore = useMarketStore();
  const {
    disableDevRepo,
    enableDevRepo,
    resetDevPluginDir,
    setDevPluginDir,
    devPlugins,
  } = usePluginRepo();
</script>

<template>
  <!-- 开发仓库目录信息 -->
  <div class="mb-4 w-full">
    <div
      class="flex items-center justify-between p-2 rounded-md bg-base-200 text-sm w-full">
      <span
        >当前开发仓库目录:
        <code>{{ marketStore.devPluginDirectory }}</code></span
      >
      <div class="flex flex-row gap-2">
        <button class="btn btn-xs btn-outline" @click="setDevPluginDir">
          更改
        </button>
        <button class="btn btn-xs btn-outline" @click="resetDevPluginDir">
          重置
        </button>
        <button class="btn btn-xs btn-outline" @click="disableDevRepo">
          禁用
        </button>
        <button class="btn btn-xs btn-outline" @click="enableDevRepo">
          启用
        </button>
      </div>
    </div>
  </div>

  <!-- 插件列表 -->
  <template v-if="marketStore.devPluginDirectory">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <template v-if="devPlugins.length > 0">
        <PluginCard
          v-for="plugin in devPlugins"
          :key="plugin.id"
          :package="plugin"
          type="remote" />
      </template>
      <Alert v-else type="warning" title="没有找到插件" />
    </div>
  </template>

  <Alert v-else type="warning" title="请先配置开发仓库目录" />
</template>
