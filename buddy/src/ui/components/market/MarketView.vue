<script setup lang="ts">
import ButtonFolder from '@renderer/components/cosy/ButtonFolder.vue'
import ButtonRefresh from '@renderer/components/cosy/ButtonRefresh.vue'
import ToolBar from '@renderer/components/cosy/ToolBar.vue'
import { useMarket } from '../../composables/useMarket'
import { useMarketStore } from '../../stores/market-store'
import { useApp } from '@renderer/composables/useApp'
import UserRepoList from './UserRepoList.vue'
import RemoteRepoList from './RemoteRepoList.vue'
import DevRepoList from './DevRepoList.vue'

const marketStore = useMarketStore()

const {
    userPlugins,
    devPlugins,
    remotePlugins,
    isLoading,
    setDevPluginDir,
    loadPlugins,
    switchTab,
    openCurrentPluginDirectory
} = useMarket()

const { isDev } = useApp()
</script>

<template>
    <div class="p-4 h-full flex flex-col">
        <!-- 操作栏 -->
        <div class="mb-4 sticky top-0">
            <ToolBar variant="compact" :bordered="false">
                <template #left>
                    <div role="tablist" class="tabs tabs-box bg-primary/50 shadow-inner">
                        <a role="tab" class="tab" :class="{ 'tab-active': marketStore.activeTab === 'user' }"
                            @click="switchTab('user')">
                            本地仓库
                        </a>
                        <a role="tab" class="tab" :class="{ 'tab-active': marketStore.activeTab === 'remote' }"
                            @click="switchTab('remote')">
                            远程仓库
                        </a>
                        <a role="tab" class="tab" :class="{ 'tab-active': marketStore.activeTab === 'dev' }"
                            v-if="isDev" @click="switchTab('dev')">
                            开发仓库
                        </a>
                    </div>
                </template>

                <template #right>
                    <ButtonFolder v-if="marketStore.activeTab === 'user' || marketStore.activeTab === 'dev'"
                        @click="openCurrentPluginDirectory" shape="circle" size="sm" tooltip="打开插件目录" />
                    <ButtonRefresh @click="loadPlugins" shape="circle" :loading="isLoading" :disabled="isLoading"
                        tooltip="刷新插件列表" size="sm" />
                </template>
            </ToolBar>
        </div>

        <!-- 开发仓库目录信息 -->
        <div v-if="marketStore.activeTab === 'dev'" class="mb-4">
            <div v-if="marketStore.devPluginDirectory"
                class="flex items-center justify-between p-2 rounded-md bg-base-200 text-sm">
                <span>当前开发目录: <code>{{ marketStore.devPluginDirectory }}</code></span>
                <button class="btn btn-xs btn-outline" @click="setDevPluginDir">更改</button>
            </div>
            <div v-else class="flex items-center justify-between p-2 rounded-md bg-warning/20 text-warning text-sm">
                <span>尚未配置开发插件目录</span>
                <button class="btn btn-xs btn-warning" @click="setDevPluginDir">立即配置</button>
            </div>
        </div>

        <!-- 插件列表 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <template v-if="marketStore.activeTab === 'user'">
                <UserRepoList :plugins="userPlugins" />
            </template>
            <template v-if="marketStore.activeTab === 'remote'">
                <RemoteRepoList :plugins="remotePlugins" />
            </template>
            <template v-if="marketStore.activeTab === 'dev'">
                <DevRepoList :plugins="devPlugins" />
            </template>
        </div>
    </div>
</template>