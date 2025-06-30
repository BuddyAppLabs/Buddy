<script setup lang="ts">
import PluginCard from '@components/PluginCard.vue'
import ButtonFolder from '@renderer/cosy/ButtonFolder.vue'
import ButtonRefresh from '@renderer/cosy/ButtonRefresh.vue'
import Empty from '@renderer/cosy/Empty.vue'
import ToolBar from '@renderer/cosy/ToolBar.vue'
import { useDirectory } from '../composables/useDirectory'
import { useMarket } from '../composables/useMarket'

const { openDirectory } = useDirectory()

const {
    isDev,
    userPlugins,
    devPlugins,
    remotePlugins,
    directory,
    activeTab,
    isLoading,
    shouldShowEmpty,
    uninstallStates,
    devPluginDirectory,
    setDevPluginDir,
    handleRefresh,
    switchTab,
    clearUninstallError,
    uninstallPlugin
} = useMarket()
</script>

<template>
    <div class="p-4 h-full flex flex-col">
        <!-- 操作栏 -->
        <div class="mb-4 sticky top-0">
            <ToolBar variant="compact" :bordered="false">
                <template #left>
                    <div role="tablist" class="tabs tabs-box bg-primary/50 shadow-inner">
                        <a role="tab" class="tab" :class="{ 'tab-active': activeTab === 'user' }"
                            @click="switchTab('user')">
                            用户插件
                        </a>
                        <a role="tab" class="tab" :class="{ 'tab-active': activeTab === 'remote' }"
                            @click="switchTab('remote')">
                            远程仓库
                        </a>
                        <a role="tab" class="tab" :class="{ 'tab-active': activeTab === 'dev' }" v-if="isDev"
                            @click="switchTab('dev')">
                            开发插件
                        </a>
                    </div>
                </template>

                <template #right>
                    <ButtonFolder @click="() => openDirectory(directory)" shape="circle" size="sm" tooltip="打开插件目录" />
                    <ButtonRefresh @click="handleRefresh" shape="circle" :loading="isLoading" :disabled="isLoading"
                        tooltip="刷新插件列表" size="sm" />
                </template>
            </ToolBar>
        </div>

        <!-- 开发插件目录信息 -->
        <div v-if="activeTab === 'dev'" class="mb-4">
            <div v-if="devPluginDirectory" class="flex items-center justify-between p-2 rounded-md bg-base-200 text-sm">
                <span>当前开发目录: <code>{{ devPluginDirectory }}</code></span>
                <button class="btn btn-xs btn-outline" @click="setDevPluginDir">更改</button>
            </div>
            <div v-else class="flex items-center justify-between p-2 rounded-md bg-warning/20 text-warning text-sm">
                <span>尚未配置开发插件目录</span>
                <button class="btn btn-xs btn-warning" @click="setDevPluginDir">立即配置</button>
            </div>
        </div>

        <!-- 插件列表 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- 本地插件卡片 -->
            <template v-if="activeTab === 'user'">
                <PluginCard v-for="plugin in userPlugins" :key="plugin.id" :plugin="plugin" type="local"
                    :uninstallingPlugins="uninstallStates.uninstallingPlugins"
                    :uninstallSuccess="uninstallStates.uninstallSuccess"
                    :uninstallError="uninstallStates.uninstallError" @uninstall="uninstallPlugin"
                    @clear-uninstall-error="clearUninstallError" />
            </template>

            <!-- 远程插件卡片 -->
            <template v-if="activeTab === 'remote'">
                <PluginCard v-for="plugin in remotePlugins" :key="plugin.id" :plugin="plugin" type="remote" />
            </template>

            <!-- 开发插件卡片 -->
            <template v-if="activeTab === 'dev'">
                <PluginCard v-for="plugin in devPlugins" :key="plugin.id" :plugin="plugin" type="remote" />
            </template>

            <!-- 无插件提示 -->
            <Empty v-if="shouldShowEmpty"
                :message="activeTab === 'remote' ? '没有可用的远程插件' : (activeTab === 'dev' && !devPluginDirectory) ? '请先配置开发插件目录' : '没有找到插件'" />
        </div>
    </div>
</template>