<!--
  ChatText - 文本消息组件
  支持 Markdown 渲染
-->
<script setup lang="ts">
  import { computed } from 'vue';
  import { marked } from 'marked';

  const props = defineProps<{
    messageId: string;
    role: 'user' | 'assistant' | 'system';
    text: string;
  }>();

  // 渲染 Markdown
  const renderedHtml = computed(() => {
    try {
      return marked.parse(props.text);
    } catch (error) {
      console.error('Markdown 解析失败:', error);
      return props.text;
    }
  });
</script>

<template>
  <div class="chat" :class="role === 'user' ? 'chat-end' : 'chat-start'">
    <div class="chat-header mb-1 text-xs opacity-70">
      {{ role === 'user' ? '你' : 'AI' }}
    </div>
    <div
      class="chat-bubble inline-block max-w-fit"
      :class="role === 'user' ? 'bg-info/30' : ''">
      <!-- 用户消息：纯文本 -->
      <div v-if="role === 'user'" class="whitespace-pre-wrap wrap-break-word">
        {{ text }}
      </div>

      <!-- AI 消息：渲染 Markdown -->
      <div v-else class="prose prose-sm max-w-none" v-html="renderedHtml"></div>
    </div>
  </div>
</template>
