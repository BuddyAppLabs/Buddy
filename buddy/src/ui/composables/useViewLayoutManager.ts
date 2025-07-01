/**
 * 集中式视图布局管理器
 * 统一管理所有插件视图的位置更新，避免重复的事件监听和IPC通信
 */
import { reactive, onUnmounted } from 'vue';
import { viewIpc } from '@renderer/ipc/view-ipc';

interface ViewInfo {
  pagePath: string;
  isVisible: boolean;
  lastBounds?: { x: number; y: number; width: number; height: number };
}

class ViewLayoutManager {
  private static instance: ViewLayoutManager;
  private views = reactive(new Map<string, ViewInfo>());
  private isInitialized = false;

  private constructor() {}

  static getInstance(): ViewLayoutManager {
    if (!ViewLayoutManager.instance) {
      ViewLayoutManager.instance = new ViewLayoutManager();
    }
    return ViewLayoutManager.instance;
  }

  /**
   * 初始化管理器
   */
  initialize() {
    if (this.isInitialized) return;

    this.isInitialized = true;
    console.log('ViewLayoutManager: 已初始化');
  }

  /**
   * 注册视图
   */
  registerView(pagePath: string) {
    this.views.set(pagePath, {
      pagePath,
      isVisible: true,
    });
  }

  /**
   * 注销视图
   */
  unregisterView(pagePath: string) {
    const viewInfo = this.views.get(pagePath);
    if (viewInfo) {
      this.views.delete(pagePath);
      console.log(
        `ViewLayoutManager: 注销视图 ${pagePath}，当前视图数量: ${this.views.size}`
      );
    }
  }

  /**
   * 销毁管理器
   */
  destroy() {
    if (!this.isInitialized) return;

    // 清空视图
    this.views.clear();
    this.isInitialized = false;

    console.log('ViewLayoutManager: 已销毁');
  }
}

/**
 * useViewLayoutManager - Vue composable
 */
export function useViewLayoutManager() {
  const manager = ViewLayoutManager.getInstance();

  const registerView = (pagePath: string) => {
    manager.registerView(pagePath);
  };

  const unregisterView = (pagePath: string) => {
    manager.unregisterView(pagePath);
  };

  // 新增：暴露 updateViewPosition
  const updateViewPosition = (
    pagePath: string,
    bounds: { x: number; y: number; width: number; height: number }
  ) => {
    // 直接调用主进程的 upsertView
    viewIpc.upsertView({ ...bounds, pagePath });
  };

  // 确保管理器已初始化
  if (!manager['isInitialized']) {
    manager.initialize();
  }

  // 组件卸载时清理
  onUnmounted(() => {
    // 注意：这里不销毁管理器，因为它是全局单例
    // 管理器的销毁应该在应用层面处理
  });

  return {
    registerView,
    unregisterView,
    updateViewPosition,
    manager,
  };
}
