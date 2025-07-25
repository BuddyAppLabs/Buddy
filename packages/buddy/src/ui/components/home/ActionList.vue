<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import ActionItem from '@/ui/components/home/ActionItem.vue';
  import { useActions } from '@/ui/composables/useActions';
  import { AppEvents } from '@coffic/buddy-it';
  import { useKeywordStore } from '@/ui/stores/keyword-store';

  const { actions, isLoading, loadActionList } = useActions();
  const actionListRef = ref<HTMLElement | null>(null);
  const keywordStore = useKeywordStore();

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
    }
  );
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
