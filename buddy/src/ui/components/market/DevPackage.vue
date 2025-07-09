<script setup lang="ts">
import PluginCard from '@/ui/components/home/PluginCard.vue'
import { useMarketStore } from '../../stores/market-store'
import { usePluginPackage } from '@/ui/composables/usePluginPackage'
import { Alert } from '@coffic/cosy-ui/vue'

const marketStore = useMarketStore()
const { setDevPackageDir, resetDevPackageDir, devPackage, disableDevPackage, enableDevPackage } = usePluginPackage()
</script>

<template>
    <!-- 开发仓库目录信息 -->
    <div class="mb-4 w-full">
        <div
            class="flex items-center justify-between p-2 rounded-md bg-base-200 text-sm w-full">
            <span>当前开发包目录: <code>{{ marketStore.devPackageDirectory }}</code></span>

            <div class="flex flex-row gap-2">
                <button class="btn btn-xs btn-outline" @click="setDevPackageDir">更改</button>
                <button class="btn btn-xs btn-outline" @click="resetDevPackageDir">重置</button>
                <button class="btn btn-xs btn-outline" @click="disableDevPackage">禁用</button>
                <button class="btn btn-xs btn-outline" @click="enableDevPackage">启用</button>
            </div>
        </div>
    </div>

    <!-- 插件 -->
    <template v-if="marketStore.devPackageDirectory">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" v-if="devPackage">
            <PluginCard :plugin="devPackage" type="remote" />
        </div>

        <div v-else class="flex items-center justify-center">
            <Alert type="warning" title="开发包目录为空，请先配置开发包目录" />
        </div>
    </template>
    <Alert v-else title="请先配置开发包目录" />
</template>
