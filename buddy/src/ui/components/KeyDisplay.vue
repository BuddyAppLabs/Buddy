<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { eventBus } from '@/ui/event-bus';

const lastKey = ref<string | null>(null);
let timer: ReturnType<typeof setTimeout> | null = null;

function showKey(key: string) {
  lastKey.value = key;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    lastKey.value = null;
  }, 3000);
}

onMounted(() => {
  eventBus.on('showKey', showKey);
});

onUnmounted(() => {
  eventBus.off('showKey', showKey);
  if (timer) clearTimeout(timer);
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
