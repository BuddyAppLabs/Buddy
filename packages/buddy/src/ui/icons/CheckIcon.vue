<!--
 * CheckIcon.vue - 勾选图标组件
 * 
 * 提供勾选/确认图标
 -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :class="props.class"
    viewBox="0 0 24 24"
    fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
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
