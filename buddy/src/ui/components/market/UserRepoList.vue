<script setup lang="ts">
import PluginCard from '@/ui/components/home/PackageCard.vue';
import { Alert } from '@coffic/cosy-ui/vue';

defineProps<{ plugins: any[] }>();
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PluginCard v-for="plugin in plugins" v-if="plugins.length > 0" :key="plugin.id" :package="plugin"
            type="local" />
        <Alert v-else title="没有找到插件" :closable="false" />
    </div>
</template>
