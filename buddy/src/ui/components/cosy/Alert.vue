<!--
Alert 组件

一个基于DaisyUI的警告提示组件，支持多种状态、位置和关闭功能。统一了Toast和Alert的功能。

使用示例：
```vue
<Alert>默认提示信息</Alert>
<Alert type="info" closable>可关闭的信息提示</Alert>
<Alert type="success">成功提示信息</Alert>
<Alert type="warning">警告提示信息</Alert>
<Alert type="error">错误提示信息</Alert>
<Alert message="通过属性传递的消息"></Alert>
<Alert position="bottom-center">底部中央显示</Alert>
```

事件：
- close: 点击关闭按钮时触发
-->

<script setup lang="ts">
  import {
    RiInfoCardLine,
    RiCheckLine,
    RiAlertLine,
    RiErrorWarningLine,
    RiCloseLine,
  } from '@remixicon/vue';
  import { computed } from 'vue';

  interface Props {
    // 提示类型
    type?: 'info' | 'success' | 'warning' | 'error';
    // 是否可关闭
    closable?: boolean;
    // 标题文本
    title?: string;
    // 消息内容
    message?: string;
    // 是否显示复制按钮
    copyable?: boolean;
    // 自定义操作
    action?: () => void;
    // 自定义操作文本
    actionText?: string;
    // 显示位置
    position?:
      | 'top-start'
      | 'top-center'
      | 'top-end'
      | 'bottom-start'
      | 'bottom-center'
      | 'bottom-end';
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'info',
    closable: true,
    copyable: false,
    position: 'top-center',
  });

  const emit = defineEmits<{
    close: [];
  }>();

  // 根据类型获取对应的图标
  const icon = computed(() => {
    switch (props.type) {
      case 'success':
        return RiCheckLine;
      case 'warning':
        return RiAlertLine;
      case 'error':
        return RiErrorWarningLine;
      default:
        return RiInfoCardLine;
    }
  });

  // 根据类型获取对应的样式类
  const alertClass = computed(() => {
    const baseClass = 'alert alert-vertical sm:alert-horizontal shadow-lg';
    switch (props.type) {
      case 'success':
        return `${baseClass} alert-success`;
      case 'warning':
        return `${baseClass} alert-warning`;
      case 'error':
        return `${baseClass} alert-error`;
      default:
        return `${baseClass} alert-info`;
    }
  });

  // 复制到剪贴板
  const copyToClipboard = () => {
    if (props.message) {
      navigator.clipboard
        .writeText(props.message)
        .catch((err) => console.error('复制失败:', err));
    }
  };

  // 关闭警告
  const handleClose = () => {
    emit('close');
  };
</script>

<template>
  <div role="alert" :class="alertClass">
    <component :is="icon" />
    <span>{{ $props.message }}</span>
    <div>
      <button class="btn btn-sm" v-if="action" @click="action">
        {{ actionText }}
      </button>
      <button
        class="btn btn-sm btn-primary"
        v-if="copyable"
        @click="copyToClipboard">
        复制
      </button>
      <button
        class="btn btn-sm btn-circle btn-ghost"
        v-if="closable"
        @click="handleClose">
        <RiCloseLine />
      </button>
    </div>
  </div>
</template>
