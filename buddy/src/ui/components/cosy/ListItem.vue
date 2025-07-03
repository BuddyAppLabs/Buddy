<!--
ListItem 组件

列表项组件，支持选择状态和交互动作。

使用示例：
```vue
<ListItem :selected="false" @click="handleClick">默认列表项</ListItem>
<ListItem :selected="true" icon="RiCheckLine">选中状态</ListItem>
<ListItem actionText="查看详情" @action="handleAction">带操作的列表项</ListItem>
<ListItem :loading="true">加载中的列表项</ListItem>
```

事件：
- click: 点击列表项时触发
- action: 点击操作按钮时触发
-->

<script setup lang="ts">
  import { RiCheckLine } from '@remixicon/vue';

  interface Props {
    // 是否选中
    selected?: boolean;
    // 图标
    icon?: string;
    // 标题文本
    title?: string;
    // 描述内容
    description?: string;
    // 是否显示操作按钮
    actionable?: boolean;
    // 自定义操作
    action?: () => void;
    // 自定义操作文本
    actionText?: string;
    // 是否显示边框
    border?: boolean;
    // 是否加载中
    loading?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    selected: false,
    actionable: false,
    border: true,
    loading: false,
  });

  const emit = defineEmits<{
    (e: 'click'): void;
    (e: 'action'): void;
  }>();

  // 处理点击事件
  const handleClick = () => {
    if (props.loading) return; // 加载中时不响应点击
    emit('click');
  };

  // 处理操作事件
  const handleAction = () => {
    if (props.loading) return; // 加载中时不响应操作
    if (props.action) {
      props.action();
    }
    emit('action');
  };
</script>

<template>
  <div
    class="flex items-center p-3 transition-colors duration-200 rounded-md"
    :class="{
      'bg-primary/60': selected,
      'border-b border-base-200': border,
      'hover:bg-base-200': !selected && !loading,
      'bg-base-100': !selected,
      'hover:bg-primary': !selected && !loading,
      'bg-secondary': !selected,
      'hover:bg-secondary': !selected && !loading,
      'bg-accent': !selected,
      'hover:bg-accent': !selected && !loading,
      'bg-info': !selected,
      'hover:bg-info': !selected && !loading,
      'hover:bg-success': !selected && !loading,
      'bg-success': !selected,
      'hover:bg-warning': !selected && !loading,
      'bg-warning': !selected,
      'hover:bg-error': !selected && !loading,
      'bg-error': !selected,
      'cursor-pointer': !loading,
      'cursor-wait': loading,
      'opacity-70': loading,
    }"
    @click="handleClick">
    <!-- 加载状态显示 loading spinner -->
    <div v-if="loading" class="mr-3">
      <span class="loading loading-spinner loading-sm text-primary"></span>
    </div>
    <!-- 选中状态显示勾选图标 -->
    <RiCheckLine v-else-if="selected" class="mr-3 text-primary" />

    <div class="flex-1">
      <h3 v-if="title" class="font-medium mb-1 text-base-content">
        {{ title }}
      </h3>
      <p v-if="description" class="text-base-content/70 text-sm">
        {{ description }}
      </p>
    </div>

    <button
      v-if="actionable && !loading"
      class="px-2 py-1 rounded bg-primary text-primary-content border-none cursor-pointer"
      @click.stop="handleAction">
      {{ actionText || '操作' }}
    </button>
  </div>
</template>
