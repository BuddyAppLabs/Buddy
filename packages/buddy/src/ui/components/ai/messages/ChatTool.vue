<!--
  ChatTool - 工具调用组件
  根据工具类型动态渲染不同的工具组件
-->
<script setup lang="ts">
  import { computed } from 'vue';
  import WeatherTool from './tools/WeatherTool.vue';
  import TimeTool from './tools/TimeTool.vue';
  import LocationTool from './tools/LocationTool.vue';

  const props = defineProps<{
    toolPart: any;
  }>();

  // 获取工具名称
  const toolName = computed(() => {
    console.log('[ChatTool] toolPart:', props.toolPart);
    if (props.toolPart.toolName) {
      console.log(
        '[ChatTool] toolName from toolName:',
        props.toolPart.toolName
      );
      return props.toolPart.toolName;
    }
    if (props.toolPart.type) {
      const name = props.toolPart.type.replace(/^tool-/, '');
      console.log('[ChatTool] toolName from type:', name);
      return name;
    }
    console.log('[ChatTool] toolName unknown');
    return 'unknown';
  });

  // 获取工具参数
  const toolArgs = computed(() => {
    return props.toolPart.args || props.toolPart.arguments || {};
  });

  // 获取工具结果
  const toolResult = computed(() => {
    return props.toolPart.result;
  });
</script>

<template>
  <!-- 天气工具 -->
  <WeatherTool
    v-if="
      toolName.toLowerCase().includes('weather') ||
      toolName.toLowerCase().includes('getweather')
    "
    :tool-part="toolPart" />

  <!-- 时间工具 -->
  <TimeTool
    v-else-if="
      toolName.toLowerCase().includes('time') ||
      toolName.toLowerCase().includes('timetool')
    "
    :tool-part="toolPart" />

  <!-- 位置工具 -->
  <LocationTool
    v-else-if="
      toolName.toLowerCase().includes('location') ||
      toolName.toLowerCase().includes('getlocation')
    "
    :tool-part="toolPart" />

  <!-- 未知工具 - 显示原始数据 -->
  <div v-else class="chat chat-start">
    <div class="chat-bubble chat-bubble-warning">
      <div class="text-xs opacity-70 mb-2">🔧 工具调用: {{ toolName }}</div>

      <!-- 工具参数 -->
      <div v-if="Object.keys(toolArgs).length > 0" class="text-sm mb-2">
        <div class="font-semibold mb-1">参数:</div>
        <pre class="text-xs bg-base-300 p-2 rounded overflow-x-auto">{{
          JSON.stringify(toolArgs, null, 2)
        }}</pre>
      </div>

      <!-- 工具结果 -->
      <div v-if="toolResult" class="text-sm">
        <div class="font-semibold mb-1">结果:</div>
        <pre class="text-xs bg-base-300 p-2 rounded overflow-x-auto">{{
          JSON.stringify(toolResult, null, 2)
        }}</pre>
      </div>
    </div>
  </div>
</template>
