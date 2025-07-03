<script setup lang="ts">
import { useActionStore } from '@/ui/stores/action-store';
import ActionList from '@/ui/components/home/ActionList.vue';
import PluginPageGrid from '@/ui/components/home/PluginPageGrid.vue';
import { onMounted, onUnmounted } from 'vue';
import { viewIpc } from '@/ui/ipc/view-ipc';

const actionStore = useActionStore();

onMounted(() => {
    actionStore.loadList()
})

onUnmounted(() => {
    viewIpc.destroyViews()
})
</script>

<template>
    <div class="w-full">
        <!-- 提示 -->
        <div v-if="actionStore.getActionCount() === 0" class="p-4">
            <h2 class="text-2xl font-bold mb-4">欢迎使用</h2>
            <p class="text-base-content/70">
                开始输入以搜索可用的动作...
            </p>
        </div>

        <!-- 插件动作列表 -->
        <div v-else class="w-full px-1">
            <ActionList />

            <!-- 插件视图网格 -->
            <PluginPageGrid />
        </div>
    </div>
</template>
