import { app, BrowserWindow } from 'electron';
import {
  ActiveApplication,
  getFrontmostApplication,
} from '@coffic/active-app-monitor';
import { AppEvents, SuperApp } from '@coffic/buddy-types';
import { LogFacade } from '@coffic/cosy-framework';

/**
 * 应用状态管理器
 * 负责监控应用的激活状态以及其他应用的状态
 */
export class StateManager {
  private static instance: StateManager;
  private overlaidApp: SuperApp | null = null;

  private constructor() {
    // 监听应用激活事件
    this.setupAppStateListeners();
  }

  /**
   * 获取 StateManager 实例
   */
  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  /**
   * 统一发送事件到主进程和所有渲染进程
   * @param channel 事件名称
   * @param args 事件参数
   */
  private emitAndBroadcast(channel: string, ...args: any[]): void {
    this.broadcastToAllWindows(channel, ...args);
  }

  /**
   * 设置应用状态监听器
   */
  private setupAppStateListeners(): void {
    // 监听应用激活事件
    app.on('activate', () => {
      this.updateActiveApp('activate');
      this.emitAndBroadcast(AppEvents.ACTIVATED);
    });

    // 监听应用失去焦点事件
    app.on('browser-window-blur', () => {
      this.emitAndBroadcast(AppEvents.DEACTIVATED);
    });

    // 添加窗口获得焦点事件监听
    app.on('browser-window-focus', () => {
      this.emitAndBroadcast(AppEvents.ACTIVATED);
    });
  }

  /**
   * 向所有窗口广播事件
   * @param channel 事件名称
   * @param args 事件参数
   */
  private broadcastToAllWindows(channel: string, ...args: any[]): void {
    try {
      const windows = BrowserWindow.getAllWindows();
      for (const win of windows) {
        if (!win.isDestroyed()) {
          win.webContents.send(channel, ...args);
        }
      }
    } catch (error) {
      throw new Error(`向渲染进程广播事件失败: ${error}`);
    }
  }

  /**
   * 获取当前被覆盖的应用信息
   */
  getOverlaidApp(): ActiveApplication | null {
    return this.overlaidApp;
  }

  /**
   * 设置当前被覆盖的应用信息
   */
  setOverlaidApp(app: ActiveApplication | null): void {
    this.overlaidApp = app;
    this.emitAndBroadcast(AppEvents.OVERLAID_APP_CHANGED, app);
  }

  /**
   * 获取当前活跃的应用信息
   */
  getCurrentActiveApp(reason: string): ActiveApplication | null {
    LogFacade.channel('state').debug('[StateManager] 获取当前活跃应用信息', {
      reason,
    });
    if (process.platform !== 'darwin') {
      return null;
    }

    try {
      const frontmostApp = getFrontmostApplication();
      if (frontmostApp) {
        return frontmostApp;
      }
    } catch (error) {
      LogFacade.channel('state').error('获取当前活跃应用信息失败', { error });
    }
    return null;
  }

  /**
   * 更新当前活跃的应用信息
   * 获取当前活跃的应用并更新状态
   */
  updateActiveApp(reason: string): void {
    if (process.platform !== 'darwin') {
      return;
    }

    const frontmostApp = this.getCurrentActiveApp(reason);
    if (frontmostApp) {
      LogFacade.channel('state').debug(
        '[StateManager] 更新被覆盖的应用信息',
        frontmostApp
      );
      this.setOverlaidApp(frontmostApp);
    } else {
      LogFacade.channel('state').debug(
        '[StateManager] 无法获取当前活跃的应用信息',
        frontmostApp
      );
      this.setOverlaidApp(null);
    }
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    try {
      // 移除应用状态监听器
      app.removeAllListeners('activate');
      app.removeAllListeners('browser-window-blur');
      app.removeAllListeners('browser-window-focus');
      app.removeAllListeners('window-all-closed');
    } catch (error) {
      throw new Error(`状态管理器清理失败: ${error}`);
    }
  }
}

// 导出单例
export const appStateManager = StateManager.getInstance();
