<!--
 * VersionDialog.vue - 版本信息对话框组件
 * 
 * 这个组件负责显示应用的版本信息：
 * - 显示应用版本
 * - 显示各组件版本
 * - 提供检查更新功能
 -->

<script setup lang="ts">
  import { computed } from 'vue';
  import { useAppStore } from '@/ui/stores/app-store';
  import { IPC_METHODS } from '@/types/ipc-methods';
  import { globalAlert } from '@renderer/composables/useAlert';

  defineProps<{
    modelValue: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
  }>();

  const appStore = useAppStore();

  // 计算属性：版本信息列表
  const versionList = computed(() => {
    return [
      ...Object.entries(appStore.versions).map(([name, version]) => ({
        name,
        version,
      })),
    ];
  });

  // 关闭对话框
  const closeDialog = () => {
    emit('update:modelValue', false);
  };

  // 检查更新
  const checkUpdate = async () => {
    let response = await window.ipc.invoke(IPC_METHODS.CHECK_UPDATE);
    if (response.success) {
      console.log('检查更新成功', response.data);
      globalAlert.success('检查更新成功, 响应: ' + response.data, {
        duration: 3000,
      });
    } else {
      console.log('检查更新失败', response.error);
      globalAlert.error('检查更新失败', { duration: 3000 });
    }
  };
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 flex items-center justify-center z-50">
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-black/50" @click="closeDialog"></div>

    <!-- 对话框内容 -->
    <div class="relative bg-base-100 rounded-lg shadow-xl w-96 max-w-full">
      <!-- 对话框头部 -->
      <div
        class="flex items-center justify-between p-4 border-b border-base-300">
        <h3 class="text-lg font-semibold">版本信息</h3>
        <button class="btn btn-ghost btn-sm" @click="closeDialog">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- 对话框内容 -->
      <div class="p-4">
        <div class="space-y-2">
          <div
            v-for="item in versionList"
            :key="item.name"
            class="flex justify-between items-center">
            <span class="text-base-content/70">{{ item.name }}</span>
            <span class="font-mono">{{ item.version }}</span>
          </div>
        </div>
      </div>

      <!-- 对话框底部 -->
      <div class="flex justify-end gap-2 p-4 border-t border-base-300">
        <button class="btn btn-primary btn-sm" @click="checkUpdate">
          检查更新
        </button>
        <button class="btn btn-ghost btn-sm" @click="closeDialog">关闭</button>
      </div>
    </div>
  </div>
</template>
