<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import { useActionStore } from '@/ui/stores/action-store';
import { RiSearchLine, RiStore2Line } from '@remixicon/vue';
import Button from '@/ui/components/cosy/Button.vue';
import { useNavigation } from '@/ui/composables/useNavigation';

const actionStore = useActionStore();
const keyword = ref(actionStore.keyword);
const searchInput = ref<HTMLInputElement | null>(null);
const { goToPluginStore, goToHome } = useNavigation();

// 监听本地关键词变化并更新 actionStore
watch(keyword, async (newKeyword) => {
  actionStore.updateKeyword(newKeyword);
  await nextTick();
});

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  actionStore.handleKeyDown(event);
};

onMounted(() => {
  nextTick(() => {
    searchInput.value?.focus();
  });
});
</script>

<template>
  <div class="w-full h-12 px-4 flex flex-row items-center drag-region justify-between">
    <div class="w-2/3">
      <input ref="searchInput" type="search" placeholder="Search" v-model="keyword" @keydown="handleKeyDown"
        class="no-drag-region input-info input input-ghost w-full focus:outline-none" autofocus />
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
