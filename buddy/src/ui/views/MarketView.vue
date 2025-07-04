<script setup lang="ts">
  import ButtonFolder from '@renderer/components/cosy/ButtonFolder.vue';
  import ButtonRefresh from '@renderer/components/cosy/ButtonRefresh.vue';
  import ToolBar from '@renderer/components/cosy/ToolBar.vue';
  import { useMarket } from '../composables/useMarket';
  import { useMarketStore } from '../stores/market-store';
  import UserRepoList from '@renderer/components/market/UserRepoList.vue';
  import RemoteRepoList from '@renderer/components/market/RemoteRepoList.vue';
  import DevRepoList from '@renderer/components/market/DevRepoList.vue';
  import DevPackage from '@renderer/components/market/DevPackage.vue';

  const marketStore = useMarketStore();

  const {
    userPlugins,
    devPlugins,
    remotePlugins,
    isLoading,
    loadPlugins,
    switchTab,
    openCurrentPluginDirectory,
  } = useMarket();
</script>

<template>
  <div class="flex flex-col">
    <!-- 操作栏 -->
    <div class="mb-4 sticky top-0">
      <ToolBar variant="compact" :bordered="false">
        <template #left>
          <div role="tablist" class="tabs tabs-box bg-primary/50 shadow-inner">
            <a
              role="tab"
              class="tab"
              :class="{ 'tab-active': marketStore.activeTab === 'user' }"
              @click="switchTab('user')">
              本地仓库
            </a>
            <a
              role="tab"
              class="tab"
              :class="{ 'tab-active': marketStore.activeTab === 'remote' }"
              @click="switchTab('remote')">
              远程仓库
            </a>
            <a
              role="tab"
              class="tab"
              :class="{ 'tab-active': marketStore.activeTab === 'devRepo' }"
              @click="switchTab('devRepo')">
              开发仓库
            </a>
            <a
              role="tab"
              class="tab"
              :class="{ 'tab-active': marketStore.activeTab === 'devPackage' }"
              @click="switchTab('devPackage')">
              开发包
            </a>
          </div>
        </template>

        <template #right>
          <ButtonFolder
            v-if="
              marketStore.activeTab === 'user' ||
              marketStore.activeTab === 'devRepo'
            "
            @click="openCurrentPluginDirectory"
            shape="circle"
            size="sm"
            tooltip="打开插件目录" />
          <ButtonRefresh
            @click="loadPlugins"
            shape="circle"
            :loading="isLoading"
            :disabled="isLoading"
            tooltip="刷新插件列表"
            size="sm" />
        </template>
      </ToolBar>
    </div>

    <UserRepoList
      :plugins="userPlugins"
      v-if="marketStore.activeTab === 'user'" />
    <RemoteRepoList
      :plugins="remotePlugins"
      v-if="marketStore.activeTab === 'remote'" />
    <DevRepoList
      :plugins="devPlugins"
      v-if="marketStore.activeTab === 'devRepo'" />
    <DevPackage v-if="marketStore.activeTab === 'devPackage'" />
  </div>
</template>
