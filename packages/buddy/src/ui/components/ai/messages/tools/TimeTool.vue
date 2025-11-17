<!--
  TimeTool - 时间工具组件
  显示时间查询结果
-->
<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    toolPart: any;
  }>();

  const output = computed(
    () => props.toolPart.result || props.toolPart.output || {}
  );

  const formattedTime = computed(() => {
    const time = output.value.time || output.value.currentTime;
    if (!time) return '';

    try {
      const date = new Date(time);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long',
      });
    } catch {
      return time;
    }
  });
</script>

<template>
  <div class="chat chat-start">
    <div class="chat-bubble chat-bubble-accent">
      <div class="flex items-center gap-2">
        <span class="text-2xl">🕐</span>
        <div>
          <div class="text-xs opacity-70 mb-1">当前时间</div>
          <div class="font-semibold">{{ formattedTime }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
