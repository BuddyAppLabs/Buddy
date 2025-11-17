<!--
  LocationTool - 位置工具组件
  显示位置信息
-->
<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    toolPart: any;
  }>();

  const state = computed(() => props.toolPart.state);
  const output = computed(
    () => props.toolPart.result || props.toolPart.output || {}
  );
</script>

<template>
  <div class="chat chat-start">
    <div class="chat-bubble chat-bubble-success">
      <!-- 加载状态 -->
      <div
        v-if="state === 'input-streaming' || state === 'input-available'"
        class="flex items-center gap-2">
        <span class="loading loading-spinner loading-sm"></span>
        <span class="text-sm">正在获取位置信息...</span>
      </div>

      <!-- 成功状态 -->
      <div
        v-else-if="state === 'output-available' || output.city"
        class="space-y-2">
        <div class="flex items-center gap-2">
          <span class="text-2xl">📍</span>
          <div>
            <div class="text-xs opacity-70">当前位置</div>
            <div class="font-semibold">
              {{ output.city || output.location }}
            </div>
          </div>
        </div>

        <div
          v-if="output.latitude && output.longitude"
          class="text-xs opacity-70">
          坐标: {{ output.latitude }}, {{ output.longitude }}
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="state === 'output-error'" class="text-error">
        <span class="text-sm">❌ 获取位置信息失败</span>
      </div>

      <!-- 默认状态 -->
      <div v-else class="text-xs">
        <div class="mb-1">📍 位置查询</div>
        <pre class="text-xs bg-base-300 p-2 rounded overflow-x-auto">{{
          JSON.stringify(toolPart, null, 2)
        }}</pre>
      </div>
    </div>
  </div>
</template>
