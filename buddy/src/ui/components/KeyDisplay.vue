<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';

  const lastKey = ref<string | null>(null);

  const handleKeydown = (event: KeyboardEvent) => {
    // 只显示可打印字符和常用控制键
    if (
      event.key.length === 1 ||
      [
        'Enter',
        'Escape',
        'Backspace',
        'Tab',
        'Shift',
        'Control',
        'Alt',
        'Meta',
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'CapsLock',
        'Delete',
        'Home',
        'End',
        'PageUp',
        'PageDown',
      ].includes(event.key)
    ) {
      let key = event.key;
      if (key === ' ') key = 'Space';
      lastKey.value = key;
    } else {
      lastKey.value = null;
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

<template>
  <Transition name="key-fade">
    <div
      v-if="lastKey"
      class="fixed bottom-4 right-4 bg-accent shadow-lg rounded px-6 py-3 z-50 text-xl font-bold text-gray-800 select-none pointer-events-none border border-gray-200 backdrop-blur-sm">
      <span class="text-blue-600">{{ lastKey }}</span>
    </div>
  </Transition>
</template>

<style scoped>
  .key-fade-enter-active,
  .key-fade-leave-active {
    transition:
      opacity 0.2s,
      transform 0.2s;
  }
  .key-fade-enter-from,
  .key-fade-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }
</style>
