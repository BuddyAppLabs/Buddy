<!--
  快捷键设置组件
-->
<script setup lang="ts">
  import { ref } from 'vue';

  const globalHotkey = ref('Option+Space');
</script>

<template>
  <div class="space-y-6">
    <div class="pb-6 border-b border-base-300">
      <h3 class="font-medium mb-2">全局快捷键</h3>
      <p class="text-sm text-base-content/70 mb-3">唤起 Buddy 的快捷键</p>
      <input
        type="text"
        v-model="globalHotkey"
        class="input input-bordered w-full max-w-xs" />
    </div>
  </div>
</template>
