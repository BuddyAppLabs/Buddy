<!--
  WeatherTool - 天气工具组件
  显示天气查询结果
-->
<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    toolPart: any;
  }>();

  const state = computed(() => props.toolPart.state);
  const input = computed(
    () => props.toolPart.args || props.toolPart.input || {}
  );
  const output = computed(
    () => props.toolPart.result || props.toolPart.output || {}
  );

  // 天气图标映射
  const weatherEmoji = computed(() => {
    const condition = output.value.condition || output.value.weather || '';
    const conditionLower = condition.toLowerCase();

    if (conditionLower.includes('sun') || conditionLower.includes('晴'))
      return '☀️';
    if (conditionLower.includes('cloud') || conditionLower.includes('云'))
      return '☁️';
    if (conditionLower.includes('rain') || conditionLower.includes('雨'))
      return '🌧️';
    if (conditionLower.includes('snow') || conditionLower.includes('雪'))
      return '❄️';
    if (conditionLower.includes('wind') || conditionLower.includes('风'))
      return '💨';
    if (conditionLower.includes('fog') || conditionLower.includes('雾'))
      return '🌫️';
    if (conditionLower.includes('storm') || conditionLower.includes('雷'))
      return '⛈️';

    return '🌤️';
  });

  // 格式化温度
  const formattedTemp = computed(() => {
    const temp = output.value.temperature || output.value.temp;
    const unit = output.value.unit || '°C';
    return temp ? `${temp}${unit}` : '';
  });
</script>

<template>
  <div class="chat chat-start">
    <div class="chat-bubble chat-bubble-info max-w-sm">
      <!-- 加载状态 -->
      <div
        v-if="state === 'input-streaming' || state === 'input-available'"
        class="flex items-center gap-2">
        <span class="loading loading-spinner loading-sm"></span>
        <span class="text-sm"
          >正在查询 {{ input.location || input.city }} 的天气...</span
        >
      </div>

      <!-- 成功状态 -->
      <div
        v-else-if="
          state === 'output-available' || output.location || output.city
        "
        class="space-y-2">
        <div class="flex items-center gap-3">
          <div class="text-4xl">{{ weatherEmoji }}</div>
          <div class="flex-1">
            <div class="font-bold text-lg">
              {{
                output.location || output.city || input.location || input.city
              }}
            </div>
            <div class="text-2xl font-semibold">
              {{ formattedTemp }}
            </div>
          </div>
        </div>

        <div
          v-if="output.condition || output.weather"
          class="text-sm opacity-80">
          {{ output.condition || output.weather }}
        </div>

        <!-- 额外信息 -->
        <div
          v-if="output.humidity || output.windSpeed"
          class="text-xs opacity-70 space-y-1">
          <div v-if="output.humidity">💧 湿度: {{ output.humidity }}%</div>
          <div v-if="output.windSpeed">💨 风速: {{ output.windSpeed }}</div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="state === 'output-error'" class="text-error">
        <span class="text-sm">❌ 获取天气信息失败</span>
      </div>

      <!-- 默认状态 -->
      <div v-else class="text-xs opacity-70">
        <div class="mb-1">🌤️ 天气查询</div>
        <pre class="text-xs bg-base-300 p-2 rounded overflow-x-auto">{{
          JSON.stringify(toolPart, null, 2)
        }}</pre>
      </div>
    </div>
  </div>
</template>
