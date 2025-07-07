/**
 * 视图管理器
 */
import { WebContentsView } from 'electron';
import { is } from '@electron-toolkit/utils';
import { join } from 'path';
import { ViewBounds } from '@coffic/buddy-types';
import { createViewArgs } from '@/types/args.js';
import { readFileSync } from 'fs';
import { WindowFacade } from '../providers/window/WindowFacade.js';
import { LogFacade } from '@coffic/cosy-framework';

const verbose = false;

export class ViewManager {
  private views: Map<string, WebContentsView> = new Map();

  /**
   * 创建视图
   */
  public async createView(args: createViewArgs): Promise<WebContentsView> {
    if (!args) {
      throw new Error('创建视图的参数不能为空');
    }

    LogFacade.channel('pluginView').info('[ViewManager] 创建视图:', args);

    const mainWindow = WindowFacade.getMainWindow();
    if (!mainWindow) {
      throw new Error('主窗口不存在');
    }

    // 销毁已经存在的视图
    if (this.views.has(args.pagePath ?? 'wild')) {
      this.destroyView(args.pagePath ?? 'wild');
    }

    // 创建视图
    const preloadPath = join(__dirname, '../preload/plugin-preload.mjs');
    LogFacade.channel('pluginView').info(
      '[ViewManager] preloadPath',
      preloadPath
    );
    const view = new WebContentsView({
      webPreferences: {
        preload: preloadPath,
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true,
        devTools: is.dev,
      },
    });

    // 如果需要，打开开发者工具
    if (args.devTools) {
      view.webContents.openDevTools({ mode: 'detach' });
      LogFacade.channel('pluginView').info(
        '[ViewManager] 为视图打开开发者工具:',
        args.pagePath
      );
    }

    view.setBounds(args);

    mainWindow.on('close', () => {
      LogFacade.channel('pluginView').info(
        '[ViewManager] 主窗口关闭，销毁所有视图'
      );
      this.destroyAllViews();
    });

    // 加载HTML内容，读取pagePath对应的文件内容, 如果文件不存在，则加载默认的HTML内容
    let htmlContent = '';
    try {
      htmlContent = readFileSync(args.pagePath, 'utf-8');
    } catch (error) {
      LogFacade.channel('pluginView').warn('[ViewManager] 加载HTML内容失败:', {
        error,
      });
      htmlContent = '加载HTML内容失败: ' + error;
    }

    view.webContents.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
    );

    // 将视图添加到主窗口并保存到Map中
    WindowFacade.getMainWindow()!.contentView.addChildView(view);
    this.views.set(args.pagePath ?? 'wild', view);

    LogFacade.channel('pluginView').info(
      '[ViewManager] 视图创建成功，当前视图个数',
      this.views.size
    );

    return view;
  }

  /**
   * 销毁视图
   */
  public destroyView(pagePath: string): void {
    if (verbose) {
      LogFacade.channel('pluginView').info(
        '[ViewManager] destroy view:',
        pagePath
      );
    }

    const view = this.views.get(pagePath);
    if (!view) {
      LogFacade.channel('pluginView').warn(
        '[ViewManager] 试图销毁不存在的视图:',
        pagePath
      );
      return;
    }

    const mainWindow = WindowFacade.getMainWindow();
    if (!mainWindow) return;

    mainWindow.contentView.removeChildView(view);
    this.views.delete(pagePath);
    view.webContents.close();
  }

  /**
   * 更新视图位置
   * @param pagePath 视图标识
   * @param bounds 新的视图边界
   */
  public updateViewPosition(pagePath: string, bounds: ViewBounds): void {
    LogFacade.channel('pluginView').info(
      '[ViewManager] update view position:',
      pagePath,
      bounds
    );

    const view = this.views.get(pagePath);
    if (!view) {
      LogFacade.channel('pluginView').warn('试图更新不存在的视图:', pagePath);
      return;
    }

    view.setBounds(bounds);
  }

  public async upsertView(args: createViewArgs): Promise<void> {
    LogFacade.channel('pluginView').info('[ViewManager] upsert view:', args);

    const view = this.views.get(args.pagePath) ?? (await this.createView(args));

    const validatedBounds = {
      x: args.x,
      y: args.y,
      width: args.width,
      height: args.height,
    };

    view.setBounds(validatedBounds);
  }

  /**
   * 批量更新或创建视图
   * @param viewsArgs 多个视图的创建/更新参数
   */
  public async batchUpsertViews(viewsArgs: createViewArgs[]): Promise<void> {
    LogFacade.channel('pluginView').info(
      `[ViewManager] 批量更新视图，数量: ${viewsArgs.length}`
    );

    // 并行处理所有视图更新
    const results = await Promise.allSettled(
      viewsArgs.map(async (args) => {
        try {
          await this.upsertView(args);
          return { success: true, pagePath: args.pagePath };
        } catch (error) {
          LogFacade.channel('pluginView').error(
            `[ViewManager] 批量更新视图失败 ${args.pagePath}:`,
            error
          );
          return { success: false, pagePath: args.pagePath, error };
        }
      })
    );

    // 统计结果
    const successCount = results.filter(
      (result) => result.status === 'fulfilled' && result.value.success
    ).length;

    LogFacade.channel('pluginView').info(
      `[ViewManager] 批量更新完成，成功: ${successCount}/${viewsArgs.length}`
    );
  }

  /**
   * 销毁所有视图
   */
  public destroyAllViews(): void {
    for (const [pagePath] of this.views) {
      this.destroyView(pagePath);
    }
  }
}

// 导出单例实例
export const viewManager = new ViewManager();
