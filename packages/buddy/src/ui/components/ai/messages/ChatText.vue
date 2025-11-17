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

  const bubbleClass = computed(() => {
    if (props.role === 'user') {
      return 'chat-bubble-primary';
    }
    return 'chat-bubble-info';
  });

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
    <div class="chat-bubble" :class="bubbleClass">
      <!-- 用户消息：纯文本 -->
      <div v-if="role === 'user'" class="whitespace-pre-wrap">{{ text }}</div>

      <!-- AI 消息：渲染 Markdown -->
      <div
        v-else
        class="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-pre:my-2 prose-ul:my-2 prose-ol:my-2"
        v-html="renderedHtml"></div>
    </div>
  </div>
</template>

<style scoped>
  /* 自定义 prose 样式以适配 chat bubble */
  .prose {
    color: inherit;
  }

  .prose :deep(p) {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }

  .prose :deep(p:first-child) {
    margin-top: 0;
  }

  .prose :deep(p:last-child) {
    margin-bottom: 0;
  }

  .prose :deep(code) {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 0.2em 0.4em;
    border-radius: 0.25em;
    font-size: 0.9em;
  }

  .prose :deep(pre) {
    background-color: rgba(0, 0, 0, 0.2);
    padding: 1em;
    border-radius: 0.5em;
    overflow-x: auto;
  }

  .prose :deep(pre code) {
    background-color: transparent;
    padding: 0;
  }

  .prose :deep(a) {
    color: inherit;
    text-decoration: underline;
  }

  .prose :deep(ul),
  .prose :deep(ol) {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    padding-left: 1.5em;
  }

  .prose :deep(li) {
    margin-top: 0.25em;
    margin-bottom: 0.25em;
  }

  .prose :deep(blockquote) {
    border-left: 3px solid currentColor;
    padding-left: 1em;
    opacity: 0.8;
    font-style: italic;
  }

  .prose :deep(h1),
  .prose :deep(h2),
  .prose :deep(h3),
  .prose :deep(h4),
  .prose :deep(h5),
  .prose :deep(h6) {
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: bold;
  }

  .prose :deep(h1:first-child),
  .prose :deep(h2:first-child),
  .prose :deep(h3:first-child),
  .prose :deep(h4:first-child),
  .prose :deep(h5:first-child),
  .prose :deep(h6:first-child) {
    margin-top: 0;
  }
</style>
