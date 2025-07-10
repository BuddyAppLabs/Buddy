import { computed, ref } from 'vue';
import { actionIpc } from '../ipc/action-ipc';
import { SendableAction } from '@/types/sendable-action';
import { useErrorStore } from '../stores/error-store';
import { ActionResult } from '@coffic/buddy-it';
import { useKeywordStore } from '../stores/keyword-store';

export function useActions() {
  const actions = ref<SendableAction[]>([]);
  const isLoading = ref(false);
  const errorStore = useErrorStore();
  const selected = ref<string | null>(null);
  const willRun = ref<string | null>(null);
  const keywordStore = useKeywordStore();
  const keyword = computed(() => keywordStore.keyword);

  /**
   * 加载动作列表
   */
  const loadActionList = async (reason: string) => {
    console.log('loadActionList', reason);
    try {
      isLoading.value = true;
      const result = await actionIpc.getActions(keyword.value);
      actions.value = result;

      console.log('actions count', actions.value.length);
    } catch (error) {
      errorStore.addError(
        '加载动作列表失败: ' +
          (error instanceof Error ? error.message : String(error))
      );
      actions.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 根据ID获取动作
   */
  const find = (actionGlobalId: string): SendableAction | undefined => {
    return actions.value.find((a) => a.globalId === actionGlobalId);
  };

  const getSelectedAction = (): SendableAction | null => {
    if (!selected.value) {
      return null;
    }
    const action = find(selected.value);
    return action || null;
  };

  const hasWillRun = (): boolean => {
    const action = find(willRun.value || '');
    const viewPath = action?.viewPath;

    return action !== undefined && viewPath !== undefined && viewPath !== '';
  };

  /**
   * 执行指定动作
   */
  const execute = async (actionGlobalId: string): Promise<ActionResult> => {
    selected.value = actionGlobalId;

    return await actionIpc.executeAction(actionGlobalId, keyword.value);
  };

  const clearSearch = () => {
    keywordStore.keyword = '';
  };

  /**
   * 处理键盘事件
   */
  const onKeyDown = (event: KeyboardEvent) => {
    // 当按下ESC键，清除搜索
    if (event.key === 'Escape') {
      keywordStore.keyword = '';
      return;
    }

    // 当按下向下箭头，聚焦到第一个结果
    if (event.key === 'ArrowDown') {
      const firstResult = document.querySelector(
        '.plugin-action-item'
      ) as HTMLElement;
      firstResult?.focus();
    }
  };

  return {
    onKeyDown,
    execute,
    getSelectedAction,
    hasWillRun,
    find,
    keyword,
    clearSearch,
    isLoading,
    loadActionList,
    actions,
    selected,
    willRun,
  };
}
