<script setup lang="ts">
  import { SendableAction } from '@/types/sendable-action.js';
  import { ref } from 'vue';
  import { useAlert } from '@renderer/composables/useAlert';
  import { ListItem } from '@coffic/cosy-ui/vue';
  import { Badge } from '@coffic/cosy-ui/vue';
  import { useActions } from '@/ui/composables/useActions';
  import { useActionActiveStore } from '@/ui/stores/action-active-store';

  const itemRef = ref<HTMLElement | null>(null);
  const globalAlert = useAlert();
  const isLoading = ref(false);
  const { execute } = useActions();
  const actionActiveStore = useActionActiveStore();

  const props = defineProps<{
    action: SendableAction;
    index: number;
  }>();

  // 处理动作选择
  const handleClick = async () => {
    if (isLoading.value) return; // 防止重复点击

    try {
      isLoading.value = true;
      const result = await execute(props.action.globalId);
      console.log('handleClick', result);

      if (result.success) {
        if (result.alert) {
          globalAlert.success(result.alert);
        } else {
          globalAlert.success(result.message, { duration: 5000 });
        }
      } else {
        globalAlert.error(result.message);
      }
    } catch (error) {
      globalAlert.error('执行动作时发生错误：' + error);
    } finally {
      // 添加最小延迟以确保用户能看到加载动画
      setTimeout(() => {
        isLoading.value = false;
      }, 300);
    }
  };
</script>

<template>
  <ListItem
    :loading="isLoading"
    :duration="15000"
    ref="itemRef"
    :tabindex="index + 1"
    @click="handleClick"
    :class="{ 'active-action-item': actionActiveStore.activeIndex === index }">
    <div class="flex-1 flex flex-col gap-1">
      <p class="text-sm">
        {{ action.description }}
      </p>

      <p class="text-xs text-secondary/70">
        {{ action.pluginId }}
      </p>
    </div>

    <Badge :variant="action.pluginType === 'user' ? 'primary' : 'secondary'">
      {{ action.pluginType }}
    </Badge>
  </ListItem>
</template>

<style scoped>
  .active-action-item {
    background: var(--cosy-primary-100, #e0e7ff);
    border-radius: 6px;
    box-shadow: 0 0 0 2px var(--cosy-primary-400, #6366f1);
  }
</style>
