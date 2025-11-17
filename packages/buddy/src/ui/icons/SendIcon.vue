<!--
 * SendIcon.vue - 发送图标组件
 * 
 * 提供发送/箭头图标
 -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :class="props.class"
    viewBox="0 0 24 24"
    fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
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
