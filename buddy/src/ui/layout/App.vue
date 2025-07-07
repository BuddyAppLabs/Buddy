<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue';
  import SearchBar from '@/ui/layout/SearchBar.vue';
  import Confirm from '@renderer/components/cosy/Confirm.vue';
  import { Alert } from '@coffic/cosy-ui/vue';
  import Progress from '@renderer/components/cosy/Progress.vue';
  import { useActionStore } from '@/ui/stores/action-store';
  import { globalConfirm } from '@renderer/composables/useConfirm';
  import { globalAlert } from '@renderer/composables/useAlert';
  import { globalProgress } from '@renderer/composables/useProgress';
  import { useAppStore } from '@/ui/stores/app-store';
  import ErrorNotification from '@/ui/layout/ErrorNotification.vue';
  import { useErrorStore } from '@/ui/stores/error-store';
  import VersionDialog from '@/ui/components/bottom/VersionDialog.vue';
  import { useMarketStore } from '@renderer/stores/market-store';
  import { computed } from 'vue';
  import KeyCatcher from '@/ui/components/KeyCatcher.vue';

  const actionStore = useActionStore();
  const appStore = useAppStore();
  const errorStore = useErrorStore();
  const marketStore = useMarketStore();

  // 计算 Alert 容器的样式类
  const alertContainerClass = computed(() => {
    const position = globalAlert.state.value.position;
    const baseClass = 'fixed z-50 max-w-md w-full mx-4';

    if (position.startsWith('top')) {
      return `${baseClass} top-20`;
    } else {
      return `${baseClass} bottom-20`;
    }
  });

  // 计算 Alert 容器的位置样式
  const alertPositionClass = computed(() => {
    const position = globalAlert.state.value.position;

    if (position.endsWith('start')) {
      return 'left-4';
    } else if (position.endsWith('end')) {
      return 'right-4';
    } else {
      return 'left-1/2 transform -translate-x-1/2';
    }
  });

  // 全局错误处理
  const handleGlobalError = (event: ErrorEvent) => {
    errorStore.addError(event.error || event.message);
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    errorStore.addError(event.reason?.message || '未处理的 Promise 错误');
  };

  // 在组件加载时注册消息监听和初始化
  onMounted(async () => {
    // 检查IPC是否正常
    if (!window.ipc) {
      errorStore.addError('IPC 初始化失败');
      return;
    }

    try {
      // 注册全局错误处理
      window.addEventListener('error', handleGlobalError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      // 初始化 stores
      try {
        appStore.onMounted();
      } catch (error) {
        errorStore.addError(
          '应用初始化失败: ' +
            (error instanceof Error ? error.message : String(error))
        );
      }

      try {
        await actionStore.onMounted();
      } catch (error) {
        errorStore.addError(
          '动作列表加载失败: ' +
            (error instanceof Error ? error.message : String(error))
        );
      }

      // 初始化市场
      marketStore.onMounted();
    } catch (error) {
      errorStore.addError(
        error instanceof Error ? error.message : String(error)
      );
    }
  });

  // 在组件卸载时清理监听器
  onUnmounted(() => {
    window.removeEventListener('error', handleGlobalError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);

    appStore.onUnmounted();
    actionStore.onUnmounted();
  });
</script>

<template>
  <div class="flex flex-col h-screen">
    <!-- 全局进度条 -->
    <div class="absolute top-14 left-1/2 transform -translate-x-1/2">
      <Progress
        v-if="globalProgress.state.value.show"
        :value="globalProgress.state.value.value"
        :max="globalProgress.state.value.max"
        :color="globalProgress.state.value.color" />
    </div>

    <!-- 搜索区域 - 这里是可拖动区域 -->
    <div class="w-full shadow-lg">
      <SearchBar />
    </div>

    <!-- 内容区域 -->
    <div class="overflow-auto px-4 pt-6 pb-24 no-drag-region">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    <ErrorNotification />
  </div>

  <!-- 版本信息对话框 -->
  <VersionDialog v-model="appStore.showVersionDialog" />

  <!-- 全局确认对话框 -->
  <Confirm
    v-model="globalConfirm.state.value.show"
    :title="globalConfirm.state.value.title"
    :message="globalConfirm.state.value.message"
    :confirm-text="globalConfirm.state.value.confirmText"
    :cancel-text="globalConfirm.state.value.cancelText"
    :confirm-variant="globalConfirm.state.value.confirmVariant"
    :cancel-variant="globalConfirm.state.value.cancelVariant"
    :loading="globalConfirm.state.value.loading"
    @confirm="globalConfirm.handleConfirm"
    @cancel="globalConfirm.handleCancel" />

  <!-- 全局警告提示 -->
  <Transition name="alert-fade">
    <div
      v-if="globalAlert.state.value.show"
      :class="[alertContainerClass, alertPositionClass]">
      <Alert
        :type="globalAlert.state.value.type"
        :title="globalAlert.state.value.message"
        :closable="globalAlert.state.value.closable"
        :position="globalAlert.state.value.position"
        @close="globalAlert.close" />
    </div>
  </Transition>

  <KeyCatcher :showKey="true" />
</template>

<style>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .alert-fade-enter-active,
  .alert-fade-leave-active {
    transition: all 0.3s ease;
  }

  .alert-fade-enter-from {
    opacity: 0;
    transform: translateY(-20px);
  }

  .alert-fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }
</style>
