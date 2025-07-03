import { defineStore } from 'pinia';
import { AppEvents, SuperAction, SuperApp } from '@coffic/buddy-types';
import { stateApi } from '../ipc/state-api';
import { ViewType } from '../router';

const ipc = window.ipc;

interface AppState {
  currentView: ViewType;
  showPluginStore: boolean;
  selectedAction: SuperAction | null;
  isActive: boolean; // 添加窗口激活状态
  overlaidApp: SuperApp | null; // 用于记录当前被覆盖的应用
  versions: Record<string, string>; // 各组件版本信息
  showVersionDialog: boolean; // 版本对话框显示状态
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    currentView: 'home',
    showPluginStore: false,
    selectedAction: null,
    isActive: true, // 默认为激活状态
    overlaidApp: null, // 初始化为null
    versions: {}, // 初始化为空对象
    showVersionDialog: false, // 默认不显示版本对话框
  }),

  actions: {
    onMounted() {
      this.setupWindowActiveListeners();
      this.setupOverlaidAppListeners();
      this.fetchVersions();
    },

    onUnmounted() {
      this.cleanupWindowActiveListeners();
    },

    setView(view: ViewType) {
      this.currentView = view;
    },

    togglePluginStore() {
      this.showPluginStore = !this.showPluginStore;
      // 如果关闭插件商店，回到主界面
      if (!this.showPluginStore) {
        this.selectedAction = null;
      }
    },

    setSelectedAction(action: SuperAction | null) {
      this.selectedAction = action;
    },

    // 设置窗口激活状态
    setActiveState(isActive: boolean) {
      this.isActive = isActive;
    },

    // 获取版本信息
    async fetchVersions() {
      try {
        const versions = await stateApi.getVersions();
        this.versions = versions;
      } catch (error) {
        console.error('获取版本信息失败:', error);
      }
    },

    // 切换版本对话框显示状态
    toggleVersionDialog() {
      this.showVersionDialog = !this.showVersionDialog;
    },

    setupOverlaidAppListeners() {
      ipc.receive(AppEvents.OVERLAID_APP_CHANGED, (args: any) => {
        this.overlaidApp = args as SuperApp | null;
      });
    },

    // 初始化窗口激活状态监听器
    setupWindowActiveListeners() {
      // 监听窗口激活事件
      ipc.receive(AppEvents.ACTIVATED, () => {
        this.setActiveState(true);
      });

      // 监听窗口失活事件
      ipc.receive(AppEvents.DEACTIVATED, () => {
        this.setActiveState(false);
      });
    },

    // 清理窗口激活状态监听器
    cleanupWindowActiveListeners() {
      // 移除监听器
      ipc.removeListener(AppEvents.OVERLAID_APP_CHANGED, () => {});
      ipc.removeListener(AppEvents.ACTIVATED, () => {});
      ipc.removeListener(AppEvents.DEACTIVATED, () => {});
    },
  },
});
