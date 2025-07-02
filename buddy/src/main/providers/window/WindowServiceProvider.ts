import { ServiceProvider } from '@coffic/cosy-framework';
import { Config, ILogManager } from '@coffic/cosy-framework';
import { createWindowManager } from './WindowManager.js';
import { app } from 'electron';
import { IWindowConfig } from './IWindowConfig.js';
import { IWindowManager } from './IWindowManager.js';

export class WindowServiceProvider extends ServiceProvider {
  /**
   * 注册窗口管理服务
   */
  public register(): void {
    // 在注册阶段只创建一个基本的窗口管理器实例
    this.app.container().singleton('window.manager', (container) => {
      const logger = container.resolve<ILogManager>('log');
      return createWindowManager(
        {
          showTrafficLights: false,
          showDebugToolbar: false,
          debugToolbarPosition: 'right',
          hotkey: 'Option+Space',
          size: {
            width: 1200,
            height: 600,
          },
          alwaysOnTop: true,
          opacity: 0.99,
        } as IWindowConfig,
        logger,
        this.app
      );
    });

    this.app.container().alias('WindowManager', 'window.manager');
  }

  /**
   * 启动窗口管理服务
   */
  public async boot(): Promise<void> {
    // 在启动阶段设置配置
    const windowConfig = {
      showTrafficLights: false,
      showDebugToolbar: process.env.NODE_ENV === 'development',
      debugToolbarPosition: 'right',
      hotkey: 'Option+Space',
      size: {
        width: 1200,
        height: 600,
      },
      alwaysOnTop: true,
      opacity: 0.99,
    } as IWindowConfig;

    // 设置全局配置
    Config.set('window', windowConfig);

    // 获取窗口管理器实例并更新配置
    const windowManager = this.app.make<IWindowManager>('window.manager');
    windowManager.updateConfig(windowConfig);

    // 设置全局快捷键
    windowManager.setupGlobalShortcut();

    windowManager.createWindow();

    this.app.on('hotkey:triggered', () => {
      windowManager.toggleMainWindow();
    });

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (windowManager.getAllWindows().length === 0) {
        windowManager.createWindow();
      }
    });
  }
}
