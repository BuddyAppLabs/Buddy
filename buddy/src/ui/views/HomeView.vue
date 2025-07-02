<script setup lang="ts">
import { useActionStore } from '@renderer/stores/actionStore';
import ActionListView from '@/ui/components/home/ActionList.vue';
import PluginView from '@renderer/components/home/PluginView.vue';
import PluginPageGrid from '@renderer/components/home/PluginPageGrid.vue';
import { onUnmounted } from 'vue';
import { viewIpc } from '@/ui/ipc/view-ipc';

const actionStore = useActionStore();

// 处理返回到动作列表
const handleBackToList = () => {
    actionStore.clearSelected();
};

onUnmounted(() => {
    viewIpc.destroyViews()
})
</script>

<template>
    <div class="w-full flex flex-col">
        <!-- 显示HomeView内容（当没有搜索关键词且没有插件动作时） -->
        <div v-if="!actionStore.hasWillRun() && actionStore.getActionCount() === 0" class="p-4">
            <h2 class="text-2xl font-bold mb-4">欢迎使用</h2>
            <p class="text-base-content/70">
                开始输入以搜索可用的动作...
            </p>
        </div>

        <!-- 插件动作列表（当有搜索关键词或有插件动作时） -->
        <div v-if="!actionStore.hasWillRun() && actionStore.getActionCount() > 0" class="flex-1 w-full px-1">
            <ActionListView />

            <!-- 插件视图网格 -->
            <div class="min-h-96 w-full z-30 my-24">
                <PluginPageGrid />
            </div>
        </div>

        <!-- 插件动作视图 -->
        <div v-if="actionStore.hasWillRun()" class="flex-1 overflow-auto">
            <PluginView @back="handleBackToList" class="w-full" />
        </div>
    </div>
</template>
