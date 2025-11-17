<!--
  关于设置组件
-->
<script setup lang="ts">
  import { computed } from 'vue';
  import { useAppStore } from '@/ui/stores/app-store';
  import { IPC_METHODS } from '@/types/ipc-methods';
  import { globalAlert } from '@/ui/composables/useAlert';

  const appStore = useAppStore();
  const githubUrl = 'https://github.com/CofficLab/Buddy';

  // 计算属性：版本信息列表
  const versionList = computed(() => {
    return [
      ...Object.entries(appStore.versions).map(([name, version]) => ({
        name,
        version,
      })),
    ];
  });

  // 打开 GitHub 页面
  const openGitHub = () => {
    window.ipc.invoke('shell:openExternal', githubUrl);
  };

  // 检查更新
  const checkUpdate = async () => {
    const response = await window.ipc.invoke(IPC_METHODS.CHECK_UPDATE);
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
  <div class="space-y-6">
    <!-- 应用信息卡片 -->
    <div class="bg-base-200 rounded-lg p-6">
      <div class="flex items-center gap-4 mb-4">
        <div
          class="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center">
          <svg
            class="w-10 h-10 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h2 class="text-2xl font-bold">Buddy</h2>
          <p class="text-base-content/70">AI 驱动的智能助手</p>
        </div>
      </div>

      <div class="flex gap-2">
        <button @click="checkUpdate" class="btn btn-primary btn-sm">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          检查更新
        </button>
        <button @click="openGitHub" class="btn btn-ghost btn-sm">
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          GitHub
        </button>
      </div>
    </div>

    <!-- 版本信息 -->
    <div>
      <h3 class="text-lg font-semibold mb-3">版本信息</h3>
      <div class="bg-base-200 rounded-lg divide-y divide-base-300">
        <div
          v-for="item in versionList"
          :key="item.name"
          class="flex justify-between items-center px-4 py-3 hover:bg-base-300/50 transition-colors">
          <span class="text-base-content/70">{{ item.name }}</span>
          <span class="font-mono text-sm">{{ item.version }}</span>
        </div>
      </div>
    </div>

    <!-- 链接 -->
    <div>
      <h3 class="text-lg font-semibold mb-3">相关链接</h3>
      <div class="space-y-2">
        <div
          @click="openGitHub"
          class="flex items-center justify-between bg-base-200 hover:bg-base-300 px-4 py-3 rounded-lg transition-colors cursor-pointer">
          <div class="flex items-center gap-3">
            <svg
              class="w-5 h-5 text-base-content/70"
              fill="currentColor"
              viewBox="0 0 24 24">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <div>
              <div class="font-medium">GitHub 仓库</div>
              <div class="text-sm text-base-content/60">
                查看源码、报告问题、参与贡献
              </div>
            </div>
          </div>
          <svg
            class="w-5 h-5 text-base-content/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
