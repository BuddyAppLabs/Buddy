<script setup lang="ts">
  import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue';
  import ActionItem from '@/ui/components/home/ActionItem.vue';
  import { useActions } from '@/ui/composables/useActions';
  import { AppEvents } from '@coffic/buddy-it';
  import { useKeywordStore } from '@/ui/stores/keyword-store';
  import { useActionActiveStore } from '@/ui/stores/action-active-store';
  import { onKeyStroke } from '@vueuse/core';

  const { actions, isLoading, clearSearch, loadActionList } = useActions();
  const actionActiveStore = useActionActiveStore();
  const actionListRef = ref<HTMLElement | null>(null);
  const keywordStore = useKeywordStore();

  // 处理取消操作
  const handleCancel = () => {
    clearSearch();
  };

  // 设置焦点到指定索引的元素
  const focusItemAtIndex = async (index: number) => {
    actionActiveStore.setActiveIndex(index);
  };

  // 处理向上导航
  const handleNavigateUp = (index: number) => {
    if (index > 0) {
      focusItemAtIndex(index - 1);
    }
  };

  // 处理向下导航
  const handleNavigateDown = (index: number) => {
    const totalItems = actions.value.length;
    if (index < totalItems - 1) {
      focusItemAtIndex(index + 1);
    }
  };

  onMounted(() => {
    loadActionList('ActionList mounted');

    window.ipc.receive(AppEvents.ACTIVATED, () => {
      loadActionList('App activated');
    });
  });

  onUnmounted(() => {
    window.ipc.removeListener(AppEvents.ACTIVATED, () => {
      loadActionList('App deactivated');
    });
  });

  watch(
    () => keywordStore.keyword,
    (newKeyword) => {
      loadActionList('Keyword changed: ' + newKeyword);
      console.log('Keyword changed: ' + newKeyword);
      focusItemAtIndex(0);
    }
  );

  // 监听键盘事件，实现全局导航和触发
  onKeyStroke(['ArrowUp'], (e) => {
    e.preventDefault();
    handleNavigateUp(actionActiveStore.activeIndex);
  });
  onKeyStroke(['ArrowDown'], (e) => {
    e.preventDefault();
    handleNavigateDown(actionActiveStore.activeIndex);
  });
  onKeyStroke(['Escape'], (e) => {
    e.preventDefault();
    handleCancel();
  });
  onKeyStroke(['Enter', ' '], async (e) => {
    e.preventDefault();
    // 获取当前激活项并触发点击
    const idx = actionActiveStore.activeIndex;
    const elements = document.querySelectorAll('.plugin-action-item');
    if (elements[idx]) {
      (elements[idx] as HTMLElement).click();
    }
  });
</script>

<template>
  <div class="action-list-view" ref="actionListRef">
    <div>
      <!-- 加载状态 -->
      <div v-if="isLoading" class="text-center py-4">
        <p>加载中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="actions.length === 0" class="text-center py-8">
        <p>没有找到匹配的动作</p>
        <p class="text-sm mt-2">尝试其他关键词或安装更多插件</p>
      </div>

      <!-- 动作列表 -->
      <ul v-else class="space-y-2">
        <ActionItem
          v-for="(action, index) in actions"
          :key="action.id"
          :action="action"
          :index="index"
          class="plugin-action-item" />
      </ul>
    </div>
  </div>
</template>
