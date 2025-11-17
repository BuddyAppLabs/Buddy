<!--
 * KeyboardIcon.vue - 键盘图标组件
 * 
 * 提供键盘/快捷键图标
 -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :class="props.class"
    viewBox="0 0 24 24"
    fill="currentColor">
    <path
      d="M20 7h-5V4c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM9 4h6v3H9V4zm11 16H4V9h16v11zm-9-1h4v-2h-4v2zm0-4h4v-2h-4v2z" />
  </svg>
</template>

<script setup lang="ts">
  interface Props {
    class?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    class: '',
  });
</script>
