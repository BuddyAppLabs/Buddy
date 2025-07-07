<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { eventBus } from '@/ui/event-bus';

  const lastKey = ref<string | null>(null);
  let timer: ReturnType<typeof setTimeout> | null = null;

  const props = defineProps<{ showKey?: boolean }>();

  const handleKeydown = (event: KeyboardEvent) => {
    const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();
    const isEditable =
      tag === 'input' ||
      tag === 'textarea' ||
      (event.target as HTMLElement)?.isContentEditable;
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
      // 只在不是输入框、textarea、contenteditable 时发事件
      if (/^[a-zA-Z]$/.test(event.key) && !isEditable) {
        eventBus.emit('globalKey', event.key);
      }
      // 展示按键（如果允许）
      if (props.showKey) {
        let key = event.key;
        if (key === ' ') key = 'Space';
        lastKey.value = key;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          lastKey.value = null;
        }, 3000);
      }
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    if (timer) clearTimeout(timer);
  });
</script>

<template>
  <Transition name="key-fade">
    <div
      v-if="props.showKey && lastKey"
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
