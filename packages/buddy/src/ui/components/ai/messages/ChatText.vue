<!--
  ChatText - 文本消息组件
  支持 Markdown 渲染
-->
<script setup lang="ts">
  import { computed } from 'vue';
  import { marked } from 'marked';
  import MessageActions from './MessageActions.vue';

  const props = defineProps<{
    messageId: string;
    role: 'user' | 'assistant' | 'system';
    text: string;
  }>();

  const emit = defineEmits<{
    resend: [];
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
    <div
      class="flex flex-col gap-1"
      :class="role === 'user' ? 'items-end' : 'items-start'">
      <!-- 消息气泡 -->
      <div
        class="chat-bubble inline-block max-w-fit"
        :class="role === 'user' ? 'bg-info/30' : ''">
        <!-- 用户消息：纯文本 -->
        <div v-if="role === 'user'" class="whitespace-pre-wrap break-words">
          {{ text }}
        </div>

        <!-- AI 消息：渲染 Markdown -->
        <div
          v-else
          class="prose prose-sm max-w-none"
          v-html="renderedHtml"></div>
      </div>

      <!-- 操作栏 -->
      <MessageActions :text="text" :role="role" @resend="emit('resend')" />
    </div>
  </div>
</template>
