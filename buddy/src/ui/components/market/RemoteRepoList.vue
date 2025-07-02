<script setup lang="ts">
import PluginCard from '@/ui/components/home/PluginCard.vue'
import Empty from '@renderer/components/cosy/Empty.vue'
defineProps<{ plugins: any[] }>()
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <template v-if="plugins.length > 0">
            <PluginCard v-for="plugin in plugins" :key="plugin.id" :plugin="plugin" type="remote" />
        </template>
        <Empty v-else message="没有可用的远程插件" />
    </div>
</template>