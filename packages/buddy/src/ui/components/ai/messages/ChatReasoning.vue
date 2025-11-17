<!--
  ChatReasoning - 推理过程组件
  显示 AI 的思考过程
-->
<script setup lang="ts">
  defineProps<{
    messageId: string;
    reasoning: string;
  }>();
</script>

<template>
  <div class="chat chat-start">
    <div class="chat-bubble chat-bubble-accent">
      <div class="text-xs opacity-70 mb-1">💭 思考过程</div>
      <blockquote class="text-sm italic opacity-80">
        {{ reasoning }}
      </blockquote>
    </div>
  </div>
</template>
