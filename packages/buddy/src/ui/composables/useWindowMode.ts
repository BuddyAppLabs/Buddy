import { ref, onMounted, onUnmounted } from 'vue';

export type WindowMode = 'compact' | 'full';

/**
 * 窗口模式 Composable
 * 用于在 Vue 组件中监听和响应窗口模式变化
 */
export function useWindowMode() {
  const mode = ref<WindowMode>('compact');

  const handleModeChange = (event: Event) => {
    const customEvent = event as CustomEvent<WindowMode>;
    mode.value = customEvent.detail;
  };

  onMounted(() => {
    // 监听窗口模式变化事件
    window.addEventListener('window-mode-changed', handleModeChange);
    
    // 从 body class 中读取初始模式
    if (document.body.classList.contains('full-mode')) {
      mode.value = 'full';
    } else {
      mode.value = 'compact';
    }
  });

  onUnmounted(() => {
    window.removeEventListener('window-mode-changed', handleModeChange);
  });

  return {
    mode,
    isCompact: () => mode.value === 'compact',
    isFull: () => mode.value === 'full',
  };
}
