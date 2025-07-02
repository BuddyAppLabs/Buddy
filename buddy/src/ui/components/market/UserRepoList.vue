<script setup lang="ts">
import PluginCard from '@/ui/components/home/PluginCard.vue'
import Empty from '@renderer/components/cosy/Empty.vue'
defineProps<{ plugins: any[] }>()
</script>

<template>
    <template v-if="plugins.length > 0">
        <PluginCard v-for="plugin in plugins" :key="plugin.id" :plugin="plugin" type="local" />
    </template>
    <Empty v-else message="没有找到插件" />
</template>