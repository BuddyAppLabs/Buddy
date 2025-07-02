<script setup lang="ts">
import PluginCard from '@/ui/components/home/PluginCard.vue'
import Empty from '@renderer/components/cosy/Empty.vue'
import { useMarketStore } from '../../stores/market-store'
const marketStore = useMarketStore()
defineProps<{ plugins: any[] }>()
</script>

<template>
    <template v-if="marketStore.devPluginDirectory">
        <template v-if="plugins.length > 0">
            <PluginCard v-for="plugin in plugins" :key="plugin.id" :plugin="plugin" type="remote" />
        </template>
        <Empty v-else message="没有找到插件" />
    </template>
    <Empty v-else message="请先配置开发插件目录" />
</template>