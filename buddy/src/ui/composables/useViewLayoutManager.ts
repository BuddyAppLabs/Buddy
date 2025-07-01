/**
 * 集中式视图布局管理器
 * 统一管理所有插件视图的位置更新，避免重复的事件监听和IPC通信
 */
import { reactive, onUnmounted } from 'vue';
import { useDebounceFn, useThrottleFn } from '@vueuse/core';
import { viewIpc } from '@renderer/ipc/view-ipc';
import { createViewArgs } from '@/types/args';

interface ViewInfo {
  element: HTMLElement;
  pagePath: string;
  isVisible: boolean;
  lastBounds?: { x: number; y: number; width: number; height: number };
}

class ViewLayoutManager {
  private static instance: ViewLayoutManager;
  private views = reactive(new Map<string, ViewInfo>());
  private isInitialized = false;
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;

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

    this.setupObservers();
    this.setupEventListeners();
    this.isInitialized = true;
    console.log('ViewLayoutManager: 已初始化');
  }

  /**
   * 注册视图
   */
  registerView(pagePath: string, element: HTMLElement) {
    this.views.set(pagePath, {
      element,
      pagePath,
      isVisible: true,
    });

    this.resizeObserver?.observe(element);
    this.intersectionObserver?.observe(element);
  }

  /**
   * 注销视图
   */
  unregisterView(pagePath: string) {
    const viewInfo = this.views.get(pagePath);
    if (viewInfo) {
      this.resizeObserver?.unobserve(viewInfo.element);
      this.intersectionObserver?.unobserve(viewInfo.element);
      this.views.delete(pagePath);
      console.log(
        `ViewLayoutManager: 注销视图 ${pagePath}，当前视图数量: ${this.views.size}`
      );
    }
  }

  /**
   * 设置观察器
   */
  private setupObservers() {
    // 使用ResizeObserver监听元素大小变化
    this.resizeObserver = new ResizeObserver(
      this.throttledUpdatePositions.bind(this)
    );

    // 使用IntersectionObserver监听元素可见性
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const pagePath = this.findPagePathByElement(
            entry.target as HTMLElement
          );
          if (pagePath) {
            const viewInfo = this.views.get(pagePath);
            if (viewInfo) {
              viewInfo.isVisible = entry.isIntersecting;
            }
          }
        });
        this.throttledUpdatePositions();
      },
      { threshold: 0.1 }
    );
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners() {
    // 监听窗口大小变化
    window.addEventListener('resize', this.debouncedUpdatePositions);

    // 监听自定义滚动事件，从事件详情中获取滚动信息
    document.addEventListener('content-scroll', (event: Event) => {
      const customEvent = event as CustomEvent;
      const scrollInfo = customEvent.detail || {};
      console.log('ViewLayoutManager: 收到滚动事件', scrollInfo);
      this.throttledUpdatePositions();
    });
  }

  /**
   * 查找元素对应的pagePath
   */
  private findPagePathByElement(element: HTMLElement): string | null {
    for (const [pagePath, viewInfo] of this.views) {
      if (viewInfo.element === element) {
        return pagePath;
      }
    }
    return null;
  }

  /**
   * 批量更新所有视图位置
   */
  private async updateAllPositions() {
    const updates: createViewArgs[] = [];

    for (const [pagePath, viewInfo] of this.views) {
      if (!viewInfo.isVisible) {
        console.log(`ViewLayoutManager: 视图 ${pagePath} 不可见，跳过`);
        continue;
      }

      // 获取元素相对于视口的位置
      const rect = viewInfo.element.getBoundingClientRect();

      // 计算相对于Electron窗口的绝对位置
      const absoluteX = rect.left;
      const absoluteY = rect.top;
      const height = rect.height;

      const bounds = {
        x: absoluteX,
        y: absoluteY,
        width: rect.width,
        height: height,
      };

      // 检查是否有变化
      const hasChanged = this.boundsChanged(viewInfo.lastBounds, bounds);
      if (hasChanged) {
        updates.push({
          ...bounds,
          pagePath,
        });
        viewInfo.lastBounds = bounds;
      }
    }

    // 批量更新
    if (updates.length > 0) {
      console.log(`ViewLayoutManager: 准备批量更新 ${updates.length} 个视图`);
      await this.batchUpdateViews(updates);
    } else {
      console.log(`ViewLayoutManager: 没有视图需要更新`);
    }
  }

  /**
   * 检查边界是否变化
   */
  private boundsChanged(
    old?: { x: number; y: number; width: number; height: number },
    current?: { x: number; y: number; width: number; height: number }
  ): boolean {
    if (!old || !current) return true;
    return (
      Math.abs(old.x - current.x) > 1 ||
      Math.abs(old.y - current.y) > 1 ||
      Math.abs(old.width - current.width) > 1 ||
      Math.abs(old.height - current.height) > 1
    );
  }

  /**
   * 批量更新视图
   */
  private async batchUpdateViews(updates: createViewArgs[]) {
    console.log(`ViewLayoutManager: 批量更新 ${updates.length} 个视图`);

    try {
      // 使用新的批量更新API
      await viewIpc.batchUpsertViews(updates);
      console.log(`ViewLayoutManager: 批量更新成功`);
    } catch (error) {
      console.error(`ViewLayoutManager: 批量更新失败:`, error);

      // 如果批量更新失败，回退到逐个更新
      console.log(`ViewLayoutManager: 回退到逐个更新`);
      const results = await Promise.allSettled(
        updates.map((update) => viewIpc.upsertView(update))
      );

      // 记录失败的更新
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(
            `ViewLayoutManager: 更新视图失败 ${updates[index].pagePath}:`,
            result.reason
          );
        }
      });
    }
  }

  /**
   * 防抖更新 - 用于resize事件
   */
  private debouncedUpdatePositions = useDebounceFn(
    this.updateAllPositions.bind(this),
    150
  );

  /**
   * 节流更新 - 用于滚动事件
   */
  private throttledUpdatePositions = useThrottleFn(
    this.updateAllPositions.bind(this),
    50
  );

  /**
   * 销毁管理器
   */
  destroy() {
    if (!this.isInitialized) return;

    // 移除事件监听器
    window.removeEventListener('resize', this.debouncedUpdatePositions);
    document.removeEventListener(
      'content-scroll',
      this.throttledUpdatePositions
    );

    // 断开观察器
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();

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

  const registerView = (pagePath: string, element: HTMLElement) => {
    manager.registerView(pagePath, element);
  };

  const unregisterView = (pagePath: string) => {
    manager.unregisterView(pagePath);
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
    manager,
  };
}
