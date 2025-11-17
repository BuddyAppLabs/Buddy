<!--
  MessageActions - 消息操作栏组件
  包含复制、重新发送等操作按钮
-->
<script setup lang="ts">
  import { ref } from 'vue';

  const props = defineProps<{
    text: string;
    role?: 'user' | 'assistant' | 'system';
  }>();

  const emit = defineEmits<{
    resend: [];
  }>();

  // 复制功能
  const copied = ref(false);
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(props.text);
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 重新发送
  const handleResend = () => {
    emit('resend');
  };
</script>

<template>
  <div class="flex items-center gap-1 px-2">
    <!-- 复制按钮 -->
    <button
      @click="copyText"
      class="btn btn-ghost btn-xs gap-1 text-base-content/50 hover:text-base-content transition-colors"
      :class="{ 'text-success': copied }">
      <!-- 复制图标 -->
      <svg
        v-if="!copied"
        class="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <!-- 成功图标 -->
      <svg
        v-else
        class="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 13l4 4L19 7" />
      </svg>
      <span class="text-xs">{{ copied ? '已复制' : '复制' }}</span>
    </button>

    <!-- 重新发送按钮 - 仅用户消息显示 -->
    <button
      v-if="role === 'user'"
      @click="handleResend"
      class="btn btn-ghost btn-xs gap-1 text-base-content/50 hover:text-base-content transition-colors">
      <!-- 重新发送图标 -->
      <svg
        class="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span class="text-xs">重新发送</span>
    </button>
  </div>
</template>
