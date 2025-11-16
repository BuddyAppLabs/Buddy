<script setup lang="ts">
  import PluginCard from '@/ui/components/home/PackageCard.vue';
  import { useDevPackage } from '@/ui/composables/useDevPackage';
  import { Alert, Button, Container, ToolBar } from '@coffic/cosy-ui/vue';
  import ButtonFolder from '@/ui/components/cosy/ButtonFolder.vue';
  import ButtonRefresh from '@/ui/components/cosy/ButtonRefresh.vue';

  const {
    setDevPackageDir,
    resetDevPackageDir,
    devPackage,
    devPackageDirectory,
    disableDevPackage,
    enableDevPackage,
    isLoading,
    loadDevPackage,
    openDevPackageDirectory,
  } = useDevPackage();
</script>

<template>
  <div class="flex flex-col gap-4">
    <ToolBar variant="compact" :bordered="false">
      <template #left>
        <div class="flex items-center gap-2">
          <ButtonFolder
            @click="openDevPackageDirectory"
            shape="circle"
            width="xs"
            tooltip="打开插件目录" />
          <ButtonRefresh
            @click="loadDevPackage"
            shape="circle"
            :loading="isLoading"
            :disabled="isLoading"
            tooltip="刷新插件列表"
            width="xs" />
        </div>
      </template>
    </ToolBar>

    <!-- 开发仓库目录信息 -->
    <Container width="full" background="accent" flex="row" justify="between">
      <span
        >当前开发包目录: <code>{{ devPackageDirectory }}</code></span
      >

      <div class="flex flex-row gap-2">
        <Button width="xs" @click="setDevPackageDir"> 更改 </Button>
        <Button width="xs" @click="resetDevPackageDir"> 重置 </Button>
        <Button width="xs" @click="disableDevPackage"> 禁用 </Button>
        <Button width="xs" @click="enableDevPackage"> 启用 </Button>
      </div>
    </Container>

    <!-- 插件 -->
    <template v-if="devPackageDirectory">
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        v-if="devPackage">
        <PluginCard :package="devPackage" type="remote" />
      </div>

      <div v-else class="flex items-center justify-center">
        <Alert
          type="warning"
          title="开发包目录为空，请先配置开发包目录"
          :closable="false" />
      </div>
    </template>
    <Alert v-else title="请先配置开发包目录" :closable="false" />
  </div>
</template>
