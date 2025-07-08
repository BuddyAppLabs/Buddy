import { defineStore } from 'pinia';
import { actionIpc } from '@renderer/ipc/action-ipc';
import { AppEvents, ActionResult } from '@coffic/buddy-it';
import { SendableAction } from '@/types/sendable-action';
import { useErrorStore } from './error-store.js';

const ipc = window.ipc;
const logger = console;

/**
 * Action 管理 Store
 *
 * 负责管理动作列表、搜索、执行等功能
 */
interface ActionState {
  list: SendableAction[];
  isLoading: boolean;
  selected: string | null;
  willRun: string | null;
  lastKeyword: string; // 存储上次搜索的关键词，用于窗口激活时刷新
  keyword: string; // 当前搜索关键词
  lastSearchTime: number; // 记录最后一次搜索时间
}

export const useActionStore = defineStore('action', {
  state: (): ActionState => ({
    list: [],
    isLoading: false,
    selected: null,
    willRun: null,
    lastKeyword: '',
    keyword: '',
    lastSearchTime: 0,
  }),

  actions: {
    async onMounted() {
      // 监听窗口激活事件，刷新列表
      ipc.receive(AppEvents.ACTIVATED, () => {
        // 使用上次的搜索关键词刷新列表
        this.loadList();
      });

      // 初始加载
      await this.loadList();
    },

    onUnmounted() {
      // 移除事件监听
      // ipc.removeListener(AppEvents.ACTIVATED);
    },

    /**
     * 加载动作列表
     */
    async loadList() {
      try {
        this.isLoading = true;
        const result = await actionIpc.getActions(this.keyword);
        this.list = result;
      } catch (error) {
        logger.error('actionStore: loadList error:', error);
        const errorStore = useErrorStore();
        errorStore.addError(
          '加载动作列表失败: ' +
            (error instanceof Error ? error.message : String(error))
        );
        this.list = [];
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 执行指定动作
     */
    async execute(actionGlobalId: string): Promise<ActionResult> {
      this.selected = actionGlobalId;
      const action = this.find(actionGlobalId);

      if (!action) {
        throw new Error(`未找到动作: ${actionGlobalId}`);
      }

      if (action.globalId === undefined) {
        throw new Error(`动作ID不存在: ${actionGlobalId}`);
      }

      if (action.globalId === '') {
        throw new Error(`动作ID为空: ${actionGlobalId}`);
      }

      return await actionIpc.executeAction(action.globalId, this.keyword);
    },

    /**
     * 根据ID获取动作
     */
    find(actionGlobalId: string): SendableAction | undefined {
      return this.list.find((a) => a.globalId === actionGlobalId);
    },

    getSelectedActionId(): string | null {
      return this.selected || null;
    },

    getActionCount(): number {
      return this.list.length;
    },

    clearSelected() {
      this.selected = null;
    },

    clearWillRun() {
      this.willRun = null;
    },

    selectAction(actionId: string) {
      this.selected = actionId;
    },

    async setWillRun(actionId: string): Promise<ActionResult> {
      this.selected = actionId;
      this.willRun = actionId;
      return await this.execute(actionId);
    },

    getActions(): SendableAction[] {
      return this.list;
    },

    getSelectedAction(): SendableAction | null {
      if (!this.selected) {
        return null;
      }
      const action = this.find(this.selected);
      return action || null;
    },

    hasWillRun(): boolean {
      const action = this.find(this.willRun || '');
      const viewPath = action?.viewPath;

      return action !== undefined && viewPath !== undefined && viewPath !== '';
    },

    /**
     * 更新搜索关键词并触发插件动作加载
     */
    async search(keyword: string) {
      this.keyword = keyword;
      this.lastKeyword = keyword;
      this.lastSearchTime = Date.now();
      await this.loadList();
    },

    /**
     * 清除搜索
     */
    clearSearch() {
      this.keyword = '';
      this.lastKeyword = '';
      this.loadList();
    },

    /**
     * 更新搜索关键词并触发插件动作加载
     */
    async updateKeyword(keyword: string) {
      logger.info(`actionStore: 更新关键词 "${keyword}"，触发插件动作加载`);
      this.keyword = keyword;
      this.lastSearchTime = Date.now();
      await this.loadList();
    },

    /**
     * 处理键盘事件
     */
    handleKeyDown(event: KeyboardEvent) {
      // 当按下ESC键，清除搜索
      if (event.key === 'Escape') {
        this.clearSearch();
        return;
      }

      // 当按下向下箭头，聚焦到第一个结果
      if (event.key === 'ArrowDown') {
        const firstResult = document.querySelector(
          '.plugin-action-item'
        ) as HTMLElement;
        firstResult?.focus();
      }
    },
  },
});
