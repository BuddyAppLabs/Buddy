/**
 * 插件视图管理器
 * 负责创建、管理和销毁插件视图窗口
 * 支持两种模式：
 * 1. 嵌入式视图(embedded) - 创建BrowserWindow但不显示，通过webContents注入到主窗口
 * 2. 独立窗口视图(window) - 创建独立的BrowserWindow并显示
 */
import { BrowserWindow, app, BrowserView, screen } from 'electron';
import { is } from '@electron-toolkit/utils';
import { join } from 'path';
import { WindowFacade } from '../providers/window/WindowFacade.js';
import { actionManager } from './ActionManager.js';
import { BaseManager } from './BaseManager.js';
import {
  PluginViewOptions,
  ViewBounds,
  ViewMode,
  WebContentOptions,
} from '@coffic/buddy-types';

const logger = console;

class PluginViewManager extends BaseManager {
  private static instance: PluginViewManager;
  private viewWindows: Map<string, BrowserWindow> = new Map();
  private viewBrowserViews: Map<string, BrowserView> = new Map();

  private constructor() {
    super({
      name: 'PluginViewManager',
      enableLogging: true,
      logLevel: 'info',
    });
  }

  /**
   * 获取 PluginViewManager 实例
   */
  public static getInstance(): PluginViewManager {
    if (!PluginViewManager.instance) {
      PluginViewManager.instance = new PluginViewManager();
    }
    return PluginViewManager.instance;
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    this.closeAllViews();
  }

  /**
   * 获取Web内容选项
   */
  private getWebContentOptions(devToolsEnabled: boolean): WebContentOptions {
    return {
      preload: join(__dirname, '../preload/plugin-preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      devTools: is.dev || devToolsEnabled,
    };
  }

  /**
   * 计算窗口位置
   */
  private calculateWindowPosition(width: number, height: number): ViewBounds {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: displayWidth, height: displayHeight } =
      primaryDisplay.workArea;
    return {
      x: Math.floor((displayWidth - width) / 2),
      y: Math.floor((displayHeight - height) / 2),
      width,
      height,
    };
  }

  /**
   * 解析动作ID
   */
  private parseActionId(url: string): string {
    if (!url.startsWith('plugin-view://')) {
      throw new Error(`无效的插件视图URL: ${url}`);
    }

    let actionId = url.substring(13);
    if (actionId.startsWith('/')) {
      actionId = actionId.substring(1);
    }

    if (!actionId) {
      throw new Error(`无效的插件视图URL: ${url}`);
    }

    return actionId;
  }

  /**
   * 创建插件视图窗口
   */
  public async createView(
    options: PluginViewOptions
  ): Promise<ViewBounds> {
    const { viewId, url, viewMode = 'embedded' } = options;

    // 清理已存在的视图
    if (this.viewWindows.has(viewId) || this.viewBrowserViews.has(viewId)) {
      await this.destroyView(viewId);
    }

    const mainWindow = WindowFacade.getMainWindow();
    if (!mainWindow) {
      throw new Error('主窗口不存在，无法创建插件视图');
    }

    const mainWindowBounds = mainWindow.getBounds();
    const actionId = this.parseActionId(url);

    // 获取视图内容
    const htmlContent = await this.getViewContent(actionId);

    // 获取动作配置
    const actionConfig = await this.getActionConfig(actionId);

    // 确定最终的视图模式
    const effectiveViewMode = actionConfig.viewMode || viewMode;

    // 创建视图
    if (effectiveViewMode === 'window') {
      return this.createWindowView(
        viewId,
        htmlContent,
        actionConfig.devTools
      );
    } else {
      return this.createEmbeddedView(
        viewId,
        htmlContent,
        mainWindowBounds,
        actionConfig.devTools
      );
    }
  }

  /**
   * 获取视图内容
   */
  private async getViewContent(actionId: string): Promise<string> {
    try {
      return await actionManager.getActionView(actionId);
    } catch (error) {
      throw new Error(
        this.handleError(error, `获取动作视图内容失败: ${actionId}`)
      );
    }
  }

  /**
   * 获取动作配置
   */
  private async getActionConfig(
    actionId: string
  ): Promise<{ devTools: boolean; viewMode?: ViewMode }> {
    try {
      const actions = await actionManager.getActions();
      const actionInfo = actions.find((a) => a.id === actionId);
      return {
        devTools: actionInfo?.devTools === true,
        viewMode: actionInfo?.viewMode,
      };
    } catch (error) {
      throw new Error(this.handleError(error, `获取动作配置失败: ${actionId}`));
    }
  }

  /**
   * 创建独立窗口视图
   */
  private createWindowView(
    viewId: string,
    html: string,
    devToolsEnabled: boolean
  ): ViewBounds {
    // 计算窗口位置和大小
    const bounds = this.calculateWindowPosition(600, 400);

    // 确保在macOS上dock图标可见
    if (process.platform === 'darwin' && app.dock) {
      app.dock.show();
      app.focus({ steal: true });
    }

    // 创建窗口
    const viewWindow = new BrowserWindow({
      ...bounds,
      title: `GitOK 插件 - ${viewId}`,
      show: false,
      frame: true,
      center: false,
      alwaysOnTop: true,
      skipTaskbar: false,
      webPreferences: this.getWebContentOptions(devToolsEnabled),
    });

    // 加载内容
    viewWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
    );

    // 设置窗口事件
    this.setupWindowEvents(viewWindow, viewId, bounds);

    // 保存窗口引用
    this.viewWindows.set(viewId, viewWindow);

    return bounds;
  }

  /**
   * 设置窗口事件
   */
  private setupWindowEvents(
    window: BrowserWindow,
    viewId: string,
    bounds: ViewBounds
  ): void {
    window.once('ready-to-show', () => {
      window.setBounds(bounds);
      window.show();
      window.moveTop();
      window.focus();

      if (process.platform === 'darwin') {
        app.focus({ steal: true });
      }
    });

    window.on('closed', () => {
      this.viewWindows.delete(viewId);
    });
  }

  /**
   * 创建嵌入式视图
   */
  private async createEmbeddedView(
    viewId: string,
    htmlContent: string,
    mainWindowBounds: ViewBounds,
    devToolsEnabled: boolean
  ): Promise<ViewBounds> {
    const mainWindow = WindowFacade.getMainWindow();
    if (!mainWindow) {
      throw new Error('主窗口不存在');
    }

    // 清理已存在的视图
    await this.cleanupExistingView(viewId, mainWindow);

    // 创建视图
    const view = new BrowserView({
      webPreferences: this.getWebContentOptions(devToolsEnabled),
    });

    // 设置视图
    const bounds = this.setupEmbeddedView(
      view,
      viewId,
      htmlContent,
      mainWindowBounds
    );

    // 处理开发者工具
    if (devToolsEnabled) {
      this.setupDevTools(view, viewId);
    }

    return bounds;
  }

  /**
   * 清理已存在的视图
   */
  private async cleanupExistingView(
    viewId: string,
    mainWindow: BrowserWindow
  ): Promise<void> {
    const existingView = this.viewBrowserViews.get(viewId);
    if (existingView) {
      mainWindow.removeBrowserView(existingView);
      this.viewBrowserViews.delete(viewId);
    }
  }

  /**
   * 设置嵌入式视图
   */
  private setupEmbeddedView(
    view: BrowserView,
    viewId: string,
    htmlContent: string,
    mainWindowBounds: ViewBounds
  ): ViewBounds {
    const bounds = {
      x: 0,
      y: 0,
      width: mainWindowBounds.width,
      height: Math.round(mainWindowBounds.height * 0.8),
    };

    view.setBounds(bounds);
    view.webContents.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
    );

    this.viewBrowserViews.set(viewId, view);

    const mainWindow = WindowFacade.getMainWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('embedded-view-created', { viewId });
    }

    return bounds;
  }

  /**
   * 设置开发者工具
   */
  private setupDevTools(view: BrowserView, viewId: string): void {
    setTimeout(() => {
      try {
        if (view.webContents && !view.webContents.isDevToolsOpened()) {
          view.webContents.openDevTools();
        }
      } catch (error) {
        this.handleError(error, `打开开发者工具失败: ${viewId}`);
      }
    }, 1000);
  }

  /**
   * 显示插件视图窗口
   * @param viewId 视图ID
   * @param bounds 窗口位置和大小
   * @returns 是否成功
   */
  public async showView(
    viewId: string,
    bounds?: { x: number; y: number; width: number; height: number }
  ): Promise<boolean> {
    logger.debug(
      `尝试显示视图: ${viewId}, 边界: ${JSON.stringify(bounds || {})}`
    );

    // 首先检查独立窗口视图
    const viewWindow = this.viewWindows.get(viewId);
    if (viewWindow) {
      try {
        // 如果提供了新的位置和大小，更新窗口
        if (bounds) {
          viewWindow.setBounds(bounds);
        }

        // 确保窗口可见
        if (!viewWindow.isVisible()) {
          viewWindow.show();
        }

        // 如果窗口被最小化，恢复它
        if (viewWindow.isMinimized()) {
          viewWindow.restore();
        }

        // 将窗口移到最前面并获取焦点
        viewWindow.moveTop();
        viewWindow.focus();

        // 在 macOS 上，确保应用程序是激活的
        if (process.platform === 'darwin') {
          app.focus({ steal: true });
        }

        logger.info(`插件视图窗口已显示: ${viewId}`);
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`显示插件视图窗口失败: ${viewId}`, {
          error: errorMessage,
        });
        return false;
      }
    }

    // 然后检查嵌入式视图
    const view = this.viewBrowserViews.get(viewId);
    if (view) {
      try {
        const mainWindow = WindowFacade.getMainWindow();
        if (!mainWindow) {
          logger.error('主窗口不存在，无法显示嵌入式视图');
          return false;
        }

        // 确保边界值存在且合理
        if (!bounds || !this.isValidBounds(bounds)) {
          logger.warn(
            `嵌入式视图边界值不合理，使用默认值: ${JSON.stringify(bounds || {})}`
          );
          // 默认设置为主窗口的中央区域
          const mainBounds = mainWindow.getBounds();
          const width = Math.min(600, mainBounds.width - 100);
          const height = Math.min(400, mainBounds.height - 100);
          const x = Math.floor((mainBounds.width - width) / 2);
          const y = Math.floor((mainBounds.height - height) / 2);
          bounds = { x, y, width, height };
        }

        logger.debug(`实际使用的边界值: ${JSON.stringify(bounds)}`);

        // 先移除所有现有的BrowserView
        try {
          // 只移除当前要显示的视图，而不是移除所有视图
          // 这样可以避免主窗口闪烁
          const existingViews = mainWindow.getBrowserViews();
          const viewToRemove = existingViews.find((v) => v === view);
          if (viewToRemove) {
            logger.debug(`移除视图准备重新添加: ${viewId}`);
            mainWindow.removeBrowserView(viewToRemove);
          }
        } catch (removeError) {
          logger.warn(`移除视图失败: ${removeError}`);
        }

        // 设置视图的边界
        view.setBounds(bounds);
        logger.debug(`已设置视图边界: ${JSON.stringify(bounds)}`);

        // 将BrowserView添加到主窗口
        mainWindow.addBrowserView(view);
        logger.info(`嵌入式视图已添加到主窗口: ${viewId}`);

        // 立即刷新视图
        try {
          view.webContents.invalidate();
        } catch (invalidateError) {
          logger.warn(`刷新视图失败: ${invalidateError}`);
        }

        // 通知渲染进程显示嵌入式视图
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send('show-embedded-view', { viewId, bounds });
          logger.info(`通知渲染进程显示嵌入式视图: ${viewId}`);
        }

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`显示嵌入式视图失败: ${viewId}`, {
          error: errorMessage,
        });
        return false;
      }
    }

    logger.error(`未找到插件视图: ${viewId}`);
    return false;
  }

  /**
   * 检查边界值是否合法
   * @param bounds 边界值
   * @returns 是否合法
   */
  private isValidBounds(bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): boolean {
    return (
      typeof bounds.x === 'number' &&
      typeof bounds.y === 'number' &&
      typeof bounds.width === 'number' &&
      typeof bounds.height === 'number' &&
      bounds.width > 10 &&
      bounds.height > 10 &&
      bounds.x >= 0 &&
      bounds.y >= 0
    );
  }

  /**
   * 隐藏插件视图窗口
   * @param viewId 视图ID
   * @returns 是否成功
   */
  public hideView(viewId: string): boolean {
    // 检查独立窗口视图
    const viewWindow = this.viewWindows.get(viewId);
    if (viewWindow) {
      try {
        viewWindow.hide();
        logger.info(`插件视图窗口已隐藏: ${viewId}`);
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`隐藏插件视图窗口失败:`, { error: errorMessage });
        return false;
      }
    }

    // 检查嵌入式视图
    const view = this.viewBrowserViews.get(viewId);
    if (view) {
      try {
        const mainWindow = WindowFacade.getMainWindow();
        if (!mainWindow) {
          logger.error('主窗口不存在，无法隐藏嵌入式视图');
          return false;
        }

        // 从主窗口移除BrowserView
        mainWindow.removeBrowserView(view);
        logger.info(`嵌入式视图已从主窗口移除: ${viewId}`);

        // 通知渲染进程隐藏嵌入式视图
        if (!mainWindow.isDestroyed()) {
          mainWindow.webContents.send('hide-embedded-view', { viewId });
          logger.info(`通知渲染进程隐藏嵌入式视图: ${viewId}`);
        }

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`隐藏嵌入式视图失败: ${viewId}`, {
          error: errorMessage,
        });
        return false;
      }
    }

    logger.error(`未找到插件视图: ${viewId}`);
    return false;
  }

  /**
   * 销毁插件视图窗口
   * @param viewId 视图ID
   * @returns 是否成功
   */
  public async destroyView(viewId: string): Promise<boolean> {
    // 检查独立窗口视图
    const viewWindow = this.viewWindows.get(viewId);
    if (viewWindow) {
      try {
        // 关闭窗口
        viewWindow.destroy();
        this.viewWindows.delete(viewId);
        logger.info(`插件视图窗口已销毁: ${viewId}`);
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`销毁插件视图窗口失败:`, { error: errorMessage });
        return false;
      }
    }

    // 检查嵌入式视图
    const view = this.viewBrowserViews.get(viewId);
    if (view) {
      try {
        // 销毁视图
        // BrowserView没有直接的destroy方法，需要先从主窗口移除
        const mainWindow = WindowFacade.getMainWindow();
        if (mainWindow && !mainWindow.isDestroyed()) {
          // 从主窗口移除BrowserView
          mainWindow.removeBrowserView(view);
        }
        // 将其引用置为null
        this.viewBrowserViews.delete(viewId);
        logger.info(`嵌入式视图已销毁: ${viewId}`);

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`销毁嵌入式视图失败: ${viewId}`, {
          error: errorMessage,
        });
        return false;
      }
    }

    // 没有找到视图，也算作成功
    logger.warn(`未找到插件视图，无需销毁: ${viewId}`);
    return true;
  }

  /**
   * 切换插件视图窗口的开发者工具
   * @param viewId 视图ID
   * @returns 是否成功
   */
  public toggleDevTools(viewId: string): boolean {
    // 检查独立窗口视图
    const viewWindow = this.viewWindows.get(viewId);
    if (viewWindow) {
      try {
        // 检查窗口状态
        if (viewWindow.isDestroyed()) {
          logger.error(`插件视图窗口已销毁: ${viewId}`);
          return false;
        }

        // 确保webContents存在
        if (!viewWindow.webContents) {
          logger.error(`插件视图窗口webContents不存在: ${viewId}`);
          return false;
        }

        const isOpen = viewWindow.webContents.isDevToolsOpened();
        logger.debug(`开发者工具当前状态: ${isOpen ? '已打开' : '未打开'}`);

        if (isOpen) {
          logger.info(`关闭开发者工具: ${viewId}`);
          viewWindow.webContents.closeDevTools();
        } else {
          logger.info(`打开开发者工具: ${viewId}`);
          viewWindow.webContents.openDevTools();
        }

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`切换开发者工具失败:`, { error: errorMessage });
        return false;
      }
    }

    // 检查嵌入式视图
    const view = this.viewBrowserViews.get(viewId);
    if (view) {
      try {
        // 确保webContents存在
        if (!view.webContents) {
          logger.error(`嵌入式视图webContents不存在: ${viewId}`);
          return false;
        }

        const isOpen = view.webContents.isDevToolsOpened();
        logger.debug(
          `嵌入式视图开发者工具当前状态: ${isOpen ? '已打开' : '未打开'}`
        );

        if (isOpen) {
          logger.info(`关闭嵌入式视图开发者工具: ${viewId}`);
          view.webContents.closeDevTools();
        } else {
          logger.info(`打开嵌入式视图开发者工具: ${viewId}`);
          view.webContents.openDevTools();
        }

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`切换嵌入式视图开发者工具失败: ${viewId}`, {
          error: errorMessage,
        });
        return false;
      }
    }

    logger.error(`未找到插件视图: ${viewId}`);
    return false;
  }

  /**
   * 关闭所有插件视图窗口
   */
  public closeAllViews(): void {
    logger.info(`关闭所有插件视图窗口: ${this.viewWindows.size} 个`);
    for (const [viewId, window] of this.viewWindows.entries()) {
      try {
        if (!window.isDestroyed()) {
          window.destroy();
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error(`关闭插件视图窗口失败: ${viewId}`, {
          error: errorMessage,
        });
      }
    }
    this.viewWindows.clear();
  }
}

// 导出单例
export const pluginViewManager = PluginViewManager.getInstance();
