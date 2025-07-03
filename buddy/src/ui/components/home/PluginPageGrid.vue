<script setup lang="ts">
import { useMarketStore } from '@renderer/stores/market-store'
import { computed } from 'vue'
import PluginPage from '@/ui/components/home/PluginPage.vue'

const marketStore = useMarketStore()
const plugins = computed(() => marketStore.getPluginsWithPage())
</script>

<template>
    <div class="w-full h-full flex flex-col overflow-hidden">
        <div class="flex-1">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-12">
                <div v-for="(plugin, index) in plugins" :key="index">
                    <PluginPage :plugin="plugin" />
                </div>
            </div>
        </div>
    </div>
</template>