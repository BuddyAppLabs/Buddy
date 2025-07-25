import { computed, ref } from 'vue';
import { actionIpc } from '../ipc/action-ipc';
import { SendableAction } from '@/types/sendable-action';
import { useErrorStore } from '../stores/error-store';
import { ActionResult } from '@coffic/buddy-it';
import { useKeywordStore } from '../stores/keyword-store';
import { onKeyStroke } from '@vueuse/core';
import { useActionActiveStore } from '../stores/action-active-store';

export function useActions() {
  const actions = ref<SendableAction[]>([]);
  const isLoading = ref(false);
  const errorStore = useErrorStore();
  const selected = ref<string | null>(null);
  const willRun = ref<string | null>(null);
  const keywordStore = useKeywordStore();
  const keyword = computed(() => keywordStore.keyword);
  const actionActiveStore = useActionActiveStore();

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

  // 设置焦点到指定索引的元素
  const focusItemAtIndex = (index: number) => {
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
    keywordStore.keyword = '';
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

  return {
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
