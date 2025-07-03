<script setup lang="ts">
  import { SendableAction } from '@/types/sendable-action.js';
  import ListItem from '@renderer/components/cosy/ListItem.vue';
  import { useActionStore } from '@/ui/stores/action-store';
  import { computed, ref } from 'vue';
  import { onKeyStroke, useFocus } from '@vueuse/core';
  import { useAlert } from '@renderer/composables/useAlert';

  const debug = false;
  const actionStore = useActionStore();
  const globalAlert = useAlert();

  // 本地加载状态
  const isLoading = ref(false);

  const props = defineProps<{
    action: SendableAction;
    index: number;
  }>();

  const emit = defineEmits<{
    (e: 'select', action: SendableAction): void;
    (e: 'cancel'): void;
    (e: 'navigateUp'): void;
    (e: 'navigateDown'): void;
  }>();

  // 创建引用来使用useFocus
  const itemRef = ref<HTMLElement | null>(null);
  const { focused } = useFocus(itemRef, { initialValue: false });

  // 处理取消操作
  const handleCancel = () => {
    emit('cancel');
  };

  const selected = computed(() => {
    return actionStore.selected === props.action.globalId;
  });

  // 使用VueUse的onKeyStroke处理键盘事件
  onKeyStroke(
    ['Enter', ' '],
    (e) => {
      if (focused.value && !isLoading.value) {
        e.preventDefault();
        handleClick();
      }
    },
    { target: itemRef }
  );

  onKeyStroke('Escape', () => {
    if (focused.value) {
      handleCancel();
    }
  });

  onKeyStroke('ArrowUp', () => {
    if (focused.value) {
      emit('navigateUp');
    }
  });

  onKeyStroke('ArrowDown', () => {
    if (focused.value) {
      emit('navigateDown');
    }
  });

  // 处理动作选择
  const handleClick = async () => {
    if (isLoading.value) return; // 防止重复点击

    try {
      isLoading.value = true;
      const result = await actionStore.setWillRun(props.action.globalId);
      console.log('handleClick', result);

      if (result.success) {
        if (result.alert) {
          globalAlert.success(result.alert);
        } else {
          globalAlert.success(result.message, { duration: 3000 });
        }
      } else {
        globalAlert.error(result.message);
      }
    } catch (error) {
      globalAlert.error('执行动作时发生错误', { duration: 3000 });
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
    ref="itemRef"
    :selected="selected"
    :loading="isLoading"
    :description="
      debug ? `${action.globalId} - ${action.description}` : action.description
    "
    :icon="action.icon"
    :tabindex="index + 1"
    @click="handleClick" />
</template>
