# 工具组件

这个目录包含了用于渲染不同类型工具调用的专用组件。

## 已实现的工具组件

### WeatherTool.vue

天气查询工具，显示天气信息。

**支持的数据格式:**

```typescript
{
  location: string;      // 位置
  temperature: number;   // 温度
  condition: string;     // 天气状况
  unit: string;         // 温度单位
  humidity?: number;    // 湿度
  windSpeed?: string;   // 风速
}
```

**特性:**

- 根据天气状况显示对应的 emoji
- 显示温度、湿度、风速等信息
- 支持加载和错误状态

### TimeTool.vue

时间查询工具，显示当前时间。

**支持的数据格式:**

```typescript
{
  time: string; // ISO 时间字符串
  currentTime: string; // 当前时间
}
```

**特性:**

- 格式化显示日期和时间
- 显示星期几
- 中文本地化

### LocationTool.vue

位置查询工具，显示位置信息。

**支持的数据格式:**

```typescript
{
  city: string;         // 城市名称
  location: string;     // 位置描述
  latitude?: number;    // 纬度
  longitude?: number;   // 经度
}
```

**特性:**

- 显示城市名称
- 显示坐标信息
- 支持加载和错误状态

## 添加新的工具组件

1. 在 `tools/` 目录下创建新组件，如 `ImageTool.vue`
2. 在 `ChatTool.vue` 中导入并添加条件渲染
3. 根据工具名称匹配新的工具类型

示例：

```vue
<!-- tools/ImageTool.vue -->
<script setup lang="ts">
  const props = defineProps<{
    toolPart: any;
  }>();
</script>

<template>
  <div class="chat chat-start">
    <div class="chat-bubble">
      <!-- 你的工具UI -->
    </div>
  </div>
</template>
```

然后在 `ChatTool.vue` 中添加：

```vue
<script setup>
  import ImageTool from './tools/ImageTool.vue';
</script>

<template>
  <ImageTool v-if="toolName.includes('image')" :tool-part="toolPart" />
</template>
```

## 工具状态

AI SDK 5.0 定义了以下工具状态：

- `input-streaming`: 输入流式传输中
- `input-available`: 输入可用
- `output-available`: 输出可用（成功）
- `output-error`: 输出错误

根据不同状态显示不同的 UI。

## 设计原则

- **视觉友好**: 使用图标和颜色区分不同工具
- **信息清晰**: 重要信息突出显示
- **状态明确**: 清楚地显示加载、成功、错误状态
- **样式一致**: 使用 DaisyUI 的 chat bubble 组件
