<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { eventBus } from '@/ui/event-bus';

const handleKeydown = (event: KeyboardEvent) => {
  // 只显示可打印字符和常用控制键
  const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();
  const isEditable = tag === 'input' || tag === 'textarea' || (event.target as HTMLElement)?.isContentEditable;
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
    // 无论是否发事件，都通知 KeyDisplay 展示
    let key = event.key;
    if (key === ' ') key = 'Space';
    eventBus.emit('showKey', key);
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>
