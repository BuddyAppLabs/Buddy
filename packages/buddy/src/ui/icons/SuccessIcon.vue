<!--
 * SuccessIcon.vue - 成功图标组件
 * 
 * 提供成功/勾选圆圈图标
 -->
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :class="props.class"
    fill="none"
    viewBox="0 0 24 24">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
