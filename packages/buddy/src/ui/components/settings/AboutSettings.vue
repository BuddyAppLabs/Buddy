<!--
  关于设置组件
-->
<script setup lang="ts">
  // 可以从主进程获取版本信息
  const version = 'v1.5.47';
  const githubUrl = 'https://github.com/CofficLab/Buddy';

  // 打开 GitHub 页面
  const openGitHub = () => {
    window.ipc.invoke('shell:openExternal', githubUrl);
  };
</script>

<template>
  <div class="space-y-6">
    <div class="pb-6 border-b border-base-300">
      <div
        class="flex items-center justify-between hover:bg-base-200 -mx-3 px-3 py-2 rounded-lg transition-colors">
        <div class="flex-1">
          <h3 class="font-medium">版本</h3>
          <p class="text-sm text-base-content/70 mt-1">Buddy {{ version }}</p>
        </div>
      </div>
    </div>

    <div class="pb-6 border-b border-base-300">
      <div
        class="flex items-center justify-between hover:bg-base-200 -mx-3 px-3 py-2 rounded-lg transition-colors cursor-pointer">
        <div class="flex-1">
          <h3 class="font-medium">检查更新</h3>
          <p class="text-sm text-base-content/70 mt-1">检查是否有新版本可用</p>
        </div>
      </div>
    </div>

    <div class="pb-6 border-b border-base-300 last:border-0">
      <div
        @click="openGitHub"
        class="flex items-center justify-between hover:bg-base-200 -mx-3 px-3 py-2 rounded-lg transition-colors cursor-pointer">
        <div class="flex-1">
          <h3 class="font-medium">GitHub 仓库</h3>
          <p class="text-sm text-base-content/70 mt-1">
            访问项目主页，查看源码和贡献
          </p>
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
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </div>
  </div>
</template>
