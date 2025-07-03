<script setup lang="ts">
import PluginCard from '@/ui/components/home/PluginCard.vue'
import Empty from '@renderer/components/cosy/Empty.vue'
defineProps<{ plugins: any[] }>()
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PluginCard v-for="plugin in plugins" v-if="plugins.length > 0" :key="plugin.id" :plugin="plugin"
            type="local" />
        <Empty v-else message="没有找到插件" />
    </div>
</template>