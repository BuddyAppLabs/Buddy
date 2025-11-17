<!--
  ChatMessage - 单个消息组件
  根据消息的 parts 动态渲染不同类型的内容
-->
<script setup lang="ts">
  import { computed } from 'vue';
  import ChatText from '@/ui/components/ai/messages/ChatText.vue';
  import ChatReasoning from '@/ui/components/ai/messages/ChatReasoning.vue';
  import ChatTool from '@/ui/components/ai/messages/ChatTool.vue';

  interface MessagePart {
    type: string;
    text?: string;
    reasoning?: string;
    [key: string]: any;
  }

  interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    parts: MessagePart[];
  }

  const props = defineProps<{
    message: Message;
  }>();

  const justify = computed(() =>
    props.message.role === 'user' ? 'justify-end' : 'justify-start'
  );

  // 过滤掉空的 text parts
  const validParts = computed(() => {
    if (!props.message.parts) return [];
    return props.message.parts.filter((part) => {
      // 如果是 text 类型，检查是否有内容
      if (part.type === 'text') {
        return part.text && part.text.trim().length > 0;
      }
      // 其他类型都保留
      return true;
    });
  });

  // 如果没有有效的 parts，不渲染
  const hasParts = computed(() => validParts.value.length > 0);

  // 调试日志
  console.log('[ChatMessage] message:', props.message);
  console.log('[ChatMessage] parts:', props.message.parts);
</script>

<template>
  <div v-if="hasParts" :class="`flex ${justify}`">
    <div class="max-w-[80%] rounded-lg flex flex-col gap-2">
      <template
        v-for="(part, index) in validParts"
        :key="`${message.id}-${index}`">
        <!-- 文本类型 -->
        <ChatText
          v-if="part.type === 'text'"
          :message-id="message.id"
          :text="part.text || ''"
          :role="message.role" />

        <!-- Reasoning 类型 -->
        <ChatReasoning
          v-else-if="part.type === 'reasoning'"
          :message-id="message.id"
          :reasoning="part.reasoning || part.text || ''" />

        <!-- 工具调用类型 -->
        <ChatTool v-else-if="part.type.startsWith('tool-')" :tool-part="part" />

        <!-- 未知类型 -->
        <div
          v-else
          class="text-xs text-base-content/50 p-2 bg-base-200 rounded">
          未知消息类型: {{ part.type }}
        </div>
      </template>
    </div>
  </div>
</template>
