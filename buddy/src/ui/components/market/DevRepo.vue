<script setup lang="ts">
  import PluginCard from '@/ui/components/home/PackageCard.vue';
  import { useDevRepo } from '@/ui/composables/useDevRepo';
  import { Alert, ToolBar } from '@coffic/cosy-ui/vue';
  import { onMounted } from 'vue';
  import ButtonFolder from '@/ui/components/cosy/ButtonFolder.vue';
  import ButtonRefresh from '@/ui/components/cosy/ButtonRefresh.vue';

  const {
    disableDevRepo,
    enableDevRepo,
    resetDevPluginDir,
    setDevPluginDir,
    devPlugins,
    devPluginDirectory,
    loadDevPlugins,
    isLoading,
    openDevPluginDirectory,
  } = useDevRepo();

  onMounted(() => {
    loadDevPlugins();
  });
</script>

<template>
  <div class="flex flex-col gap-4">
    <ToolBar variant="compact" :bordered="false">
      <template #left>
        <div class="flex items-center gap-2">
          <ButtonFolder
            @click="openDevPluginDirectory"
            shape="circle"
            size="sm"
            tooltip="打开插件目录" />
          <ButtonRefresh
            @click="loadDevPlugins"
            shape="circle"
            :loading="isLoading"
            :disabled="isLoading"
            tooltip="刷新插件列表"
            size="sm" />
        </div>
      </template>
    </ToolBar>
    <!-- 开发仓库目录信息 -->
    <div class="mb-4 w-full">
      <div
        class="flex items-center justify-between p-2 rounded-md bg-base-200 text-sm w-full">
        <span
          >当前开发仓库目录: <code>{{ devPluginDirectory }}</code></span
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
    <template v-if="devPluginDirectory">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <template v-if="devPlugins.length > 0">
          <PluginCard
            v-for="plugin in devPlugins"
            :key="plugin.id"
            :package="plugin"
            type="remote" />
        </template>
        <Alert v-else type="warning" title="没有找到插件" :closable="false" />
      </div>
    </template>

    <Alert
      v-else
      type="warning"
      title="请先配置开发仓库目录"
      :closable="false" />
  </div>
</template>
