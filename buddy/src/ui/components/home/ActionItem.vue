<script setup lang="ts">
  import { SendableAction } from '@/types/sendable-action.js';
  import { useActionStore } from '@/ui/stores/action-store';
  import { computed, ref } from 'vue';
  import { onKeyStroke, useFocus } from '@vueuse/core';
  import { useAlert } from '@renderer/composables/useAlert';

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
          globalAlert.success(result.message, { duration: 5000 });
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
  <div
    ref="itemRef"
    class="flex items-center p-3 transition-colors duration-200 rounded-md"
    :class="{
      'bg-primary/60': selected,
      'border-b border-base-200': true,
      'bg-base-100': !selected,
      'hover:bg-primary/40': !selected && !isLoading,
      'cursor-pointer': !isLoading,
      'cursor-wait': isLoading,
      'opacity-70': isLoading,
    }"
    :tabindex="index + 1"
    @click="handleClick">
    <!-- 加载状态显示 loading spinner -->
    <div v-if="isLoading" class="mr-3">
      <span class="loading loading-spinner loading-sm text-primary"></span>
    </div>
    <!-- 选中状态显示 emoji 图标 -->
    <span
      v-else-if="selected && action.icon"
      class="mr-3 text-primary text-lg"
      >{{ action.icon }}</span
    >
    <span v-else-if="action.icon" class="mr-3 text-base-content/70 text-lg">{{
      action.icon
    }}</span>

    <div class="flex-1 flex flex-col gap-1">
      <p class="text-sm">
        {{ action.description }}
      </p>

      <p class="text-xs text-secondary/70">
        {{ action.pluginId }}
      </p>
    </div>
  </div>
</template>
