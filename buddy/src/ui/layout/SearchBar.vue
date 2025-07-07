<script setup lang="ts">
  import { ref, watch, onMounted, nextTick, onUnmounted } from 'vue';
  import { useActionStore } from '@/ui/stores/action-store';
  import { RiSearchLine, RiStore2Line } from '@remixicon/vue';
  import { Button } from '@coffic/cosy-ui/vue';
  import { useNavigation } from '@/ui/composables/useNavigation';
  import { eventBus } from '@/ui/event-bus';
  import { AppEvents } from '@coffic/buddy-types';

  const actionStore = useActionStore();
  const keyword = ref(actionStore.keyword);
  const searchInput = ref<HTMLInputElement | null>(null);
  const { goToPluginStore, goToHome } = useNavigation();
  const isFocused = ref(false);

  // 监听本地关键词变化并更新 actionStore
  watch(keyword, async (newKeyword) => {
    actionStore.updateKeyword(newKeyword);
    await nextTick();
  });

  // 处理键盘事件
  const handleKeyDown = (event: KeyboardEvent) => {
    actionStore.handleKeyDown(event);
  };

  function onFocus() {
    isFocused.value = true;
  }
  function onBlur() {
    isFocused.value = false;
  }

  function insertCharFromGlobalKey(char: string) {
    if (isFocused.value) return; // 已聚焦时不插入，避免重复
    if (searchInput.value) {
      const input = searchInput.value;
      // 插入字符到当前光标处
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      const value = input.value;
      input.value = value.slice(0, start) + char + value.slice(end);
      keyword.value = input.value;
      // 移动光标
      input.selectionStart = input.selectionEnd = start + 1;
      actionStore.updateKeyword(input.value);
    }
  }

  function reset() {
    keyword.value = '';
    actionStore.updateKeyword('');
  }

  onMounted(() => {
    reset();
    nextTick(() => {
      searchInput.value?.focus();
    });
    eventBus.on('globalKey', insertCharFromGlobalKey);

    // 监听窗口激活事件，重置搜索框
    window.ipc.receive(AppEvents.ACTIVATED, () => {
      reset();
    });
  });

  onUnmounted(() => {
    eventBus.off('globalKey', insertCharFromGlobalKey);
  });
</script>

<template>
  <div
    class="w-full h-12 px-4 flex flex-row items-center drag-region justify-between">
    <div class="w-2/3">
      <input
        ref="searchInput"
        type="search"
        placeholder="Search"
        v-model="keyword"
        @keydown="handleKeyDown"
        @focus="onFocus"
        @blur="onBlur"
        class="no-drag-region input-info input input-ghost w-full focus:outline-none"
        autofocus />
    </div>

    <div class="flex flex-row gap-2">
      <Button size="sm" variant="ghost" @click="goToPluginStore">
        <RiStore2Line class="w-4 h-4 no-drag-region" />
      </Button>
      <Button size="sm" variant="ghost" @click="goToHome">
        <RiSearchLine class="w-4 h-4 no-drag-region" />
      </Button>
    </div>
  </div>
</template>
