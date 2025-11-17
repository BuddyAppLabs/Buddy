<!--
  关于设置组件
-->
<script setup lang="ts">
  // 可以从主进程获取版本信息
  const version = 'v1.5.47';
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

    <div class="pb-6 border-b border-base-300 last:border-0">
      <div
        class="flex items-center justify-between hover:bg-base-200 -mx-3 px-3 py-2 rounded-lg transition-colors cursor-pointer">
        <div class="flex-1">
          <h3 class="font-medium">检查更新</h3>
          <p class="text-sm text-base-content/70 mt-1">检查是否有新版本可用</p>
        </div>
      </div>
    </div>
  </div>
</template>
