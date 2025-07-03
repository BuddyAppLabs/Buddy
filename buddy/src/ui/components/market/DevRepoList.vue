<script setup lang="ts">
import PluginCard from '@/ui/components/home/PluginCard.vue'
import Empty from '@renderer/components/cosy/Empty.vue'
import { useMarketStore } from '../../stores/market-store'
import { useMarket } from '../../composables/useMarket'
const marketStore = useMarketStore()
const { setDevPluginDir, resetDevPluginDir } = useMarket()
defineProps<{ plugins: any[] }>()
</script>

<template>
    <!-- 开发仓库目录信息 -->
    <div class="mb-4 w-full">
        <div v-if="marketStore.devPluginDirectory"
            class="flex items-center justify-between p-2 rounded-md bg-base-200 text-sm w-full">
            <span>当前开发目录: <code>{{ marketStore.devPluginDirectory }}</code></span>
            <button class="btn btn-xs btn-outline" @click="setDevPluginDir">更改</button>
            <button class="btn btn-xs btn-outline" @click="resetDevPluginDir">重置</button>
        </div>
        <div v-else class="flex items-center justify-between p-2 rounded-md bg-warning/20 text-warning text-sm">
            <span>尚未配置开发插件目录</span>
            <button class="btn btn-xs btn-warning" @click="setDevPluginDir">立即配置</button>
        </div>
    </div>

    <!-- 插件列表 -->
    <template v-if="marketStore.devPluginDirectory">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <template v-if="plugins.length > 0">
                <PluginCard v-for="plugin in plugins" :key="plugin.id" :plugin="plugin" type="remote" />
            </template>
            <Empty v-else message="没有找到插件" />
        </div>
    </template>
    <Empty v-else message="请先配置开发插件目录" />
</template>