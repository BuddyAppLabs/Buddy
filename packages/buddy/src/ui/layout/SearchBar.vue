<script setup lang="ts">
  import { ref, onMounted, nextTick, onUnmounted, watch } from 'vue';
  import { useNavigation } from '@/ui/composables/useNavigation';
  import { eventBus } from '@/ui/event-bus';
  import { AppEvents } from '@coffic/buddy-it';
  import { useKeywordStore } from '@/ui/stores/keyword-store';

  const keywordStore = useKeywordStore();
  const searchInput = ref<HTMLInputElement | null>(null);
  const { goToHome } = useNavigation();
  const isFocused = ref(false);

  function onFocus() {
    isFocused.value = true;
  }
  function onBlur() {
    isFocused.value = false;
  }

  function deleteLastChar() {
    if (searchInput.value) {
      const input = searchInput.value;
      const value = input.value;
      if (value.length > 0) {
        input.value = value.slice(0, -1);
        keywordStore.keyword = input.value;
        // 触发输入事件以确保UI更新
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
      }
    }
  }

  function insertCharFromGlobalKey(char: string) {
    if (isFocused.value) return; // 已聚焦时不插入，避免重复
    if (searchInput.value) {
      const input = searchInput.value;
      // 处理 Backspace
      if (char === 'Backspace') {
        deleteLastChar();
        return;
      }

      // 插入字符到当前光标处
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      const value = input.value;
      input.value = value.slice(0, start) + char + value.slice(end);
      keywordStore.keyword = input.value;
      // 移动光标
      input.selectionStart = input.selectionEnd = start + 1;
    }
  }

  function reset() {
    keywordStore.keyword = '';
  }

  onMounted(() => {
    reset();
    nextTick(() => {
      searchInput.value?.focus();
    });
    eventBus.on('key', insertCharFromGlobalKey);

    // 监听窗口激活事件，重置搜索框
    window.ipc.receive(AppEvents.ACTIVATED, () => {
      reset();
    });
  });

  onUnmounted(() => {
    eventBus.off('key', insertCharFromGlobalKey);
  });

  watch(
    () => keywordStore.keyword,
    () => {
      goToHome();
    }
  );
</script>

<template>
  <div
    class="w-full h-12 px-4 flex flex-row items-center drag-region justify-between">
    <div class="w-11/12">
      <input
        ref="searchInput"
        type="search"
        placeholder="Search"
        v-model="keywordStore.keyword"
        @focus="onFocus"
        @blur="onBlur"
        class="no-drag-region input-info input input-ghost w-full focus:outline-none"
        autofocus />
    </div>
  </div>
</template>
