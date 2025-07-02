<script setup lang="ts">
import PluginCard from '@/ui/components/home/PluginCard.vue'
import Empty from '@renderer/components/cosy/Empty.vue'
import { useMarketStore } from '../../stores/market-store'
import { useMarket } from '../../composables/useMarket'
import { computed } from 'vue'
const marketStore = useMarketStore()
const { setDevPackageDir, resetDevPackageDir } = useMarket()
const plugin = computed(() => marketStore.devPackage)
</script>

<template>
    <!-- 开发仓库目录信息 -->
    <div class="mb-4 w-full">
        <div v-if="marketStore.devPackageDirectory"
            class="flex items-center justify-between p-2 rounded-md bg-base-200 text-sm w-full">
            <span>当前开发包目录: <code>{{ marketStore.devPackageDirectory }}</code></span>
            <button class="btn btn-xs btn-outline" @click="setDevPackageDir">更改</button>
            <button class="btn btn-xs btn-outline" @click="resetDevPackageDir">重置</button>
        </div>
        <div v-else class="flex items-center justify-between p-2 rounded-md bg-warning/20 text-warning text-sm">
            <span>尚未配置开发包目录</span>
            <button class="btn btn-xs btn-warning" @click="setDevPackageDir">立即配置</button>
        </div>
    </div>

    <!-- 插件 -->
    <template v-if="marketStore.devPackageDirectory">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" v-if="plugin">
            <PluginCard :plugin="plugin" type="remote" />
        </div>

        <div v-else class="flex items-center justify-center">
            <div class="text-sm text-gray-500">
                开发包目录为空，请先配置开发包目录
            </div>
        </div>
    </template>
    <Empty v-else message="请先配置开发包目录" />
</template>