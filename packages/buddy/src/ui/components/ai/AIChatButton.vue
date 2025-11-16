<!--
  AI 聊天按钮
  点击后打开 AI 聊天面板
-->
<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  click: [];
}>();

const handleClick = () => {
  emit('click');
};
</script>

<template>
  <button
    @click="handleClick"
    class="btn btn-ghost btn-sm gap-1 text-base-content/70 hover:text-primary transition-colors"
    title="AI 助手 (快捷键: Cmd+K)"
  >
    <!-- AI Sparkle Icon -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      class="w-4 h-4"
    >
      <path
        d="M12 2L9.19 8.63L2 11.38L9.19 14.13L12 21L14.81 14.13L22 11.38L14.81 8.63L12 2Z"
      />
      <path
        d="M17 8L15.5 11L12 12.5L15.5 14L17 17L18.5 14L22 12.5L18.5 11L17 8Z"
        opacity="0.6"
      />
    </svg>
    <span class="hidden sm:inline">AI</span>
  </button>
</template>
