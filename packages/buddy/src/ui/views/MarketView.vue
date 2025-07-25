<script setup lang="ts">
  import { ToolBar } from '@coffic/cosy-ui/vue';
  import { useMarket } from '../composables/useMarket';
  import LocalRepo from '@/ui/components/market/LocalRepo.vue';
  import RemoteRepo from '@/ui/components/market/RemoteRepo.vue';
  import DevRepo from '@/ui/components/market/DevRepo.vue';
  import DevPackage from '@/ui/components/market/DevPackage.vue';

  const { switchTab, activeTab } = useMarket();
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
              :class="{ 'tab-active': activeTab === 'user' }"
              @click="switchTab('user')">
              本地仓库
            </a>
            <a
              role="tab"
              class="tab"
              :class="{ 'tab-active': activeTab === 'remote' }"
              @click="switchTab('remote')">
              远程仓库
            </a>
            <a
              role="tab"
              class="tab"
              :class="{ 'tab-active': activeTab === 'devRepo' }"
              @click="switchTab('devRepo')">
              开发仓库
            </a>
            <a
              role="tab"
              class="tab"
              :class="{ 'tab-active': activeTab === 'devPackage' }"
              @click="switchTab('devPackage')">
              开发包
            </a>
          </div>
        </template>
      </ToolBar>
    </div>

    <LocalRepo v-if="activeTab === 'user'" />
    <RemoteRepo v-if="activeTab === 'remote'" />
    <DevRepo v-if="activeTab === 'devRepo'" />
    <DevPackage v-if="activeTab === 'devPackage'" />
  </div>
</template>
