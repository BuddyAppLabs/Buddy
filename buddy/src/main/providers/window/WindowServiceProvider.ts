import { ServiceProvider } from '@coffic/cosy-framework';
import { Config } from '@coffic/cosy-framework';
import { createWindowManager } from './WindowManager.js';
import { EMOJI } from '../../constants.js';
import { LogFacade } from '@coffic/cosy-logger';
import {
  WindowConfig,
  WindowManagerContract,
} from './contracts/ContractWindow.js';
import { app } from 'electron';

export class WindowServiceProvider extends ServiceProvider {
  /**
   * 注册窗口管理服务
   */
  public register(): void {
    // 在注册阶段只创建一个基本的窗口管理器实例
    this.app.container().singleton('window.manager', () => {
      return createWindowManager({
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
      } as WindowConfig);
    });

    this.app.container().alias('WindowManager', 'window.manager');
  }

  /**
   * 启动窗口管理服务
   */
  public async boot(): Promise<void> {
    LogFacade.channel('window').info(
      `${EMOJI} [WindowServiceProvider] 窗口管理服务启动完成`
    );
    // 在启动阶段设置配置
    const windowConfig = {
      showTrafficLights: true,
      showDebugToolbar: process.env.NODE_ENV === 'development',
      debugToolbarPosition: 'right',
      hotkey: 'Option+Space',
      size: {
        width: 1200,
        height: 600,
      },
      alwaysOnTop: true,
      opacity: 0.99,
    } as WindowConfig;

    // 设置全局配置
    Config.set('window', windowConfig);

    // 获取窗口管理器实例并更新配置
    const windowManager =
      this.app.make<WindowManagerContract>('window.manager');
    windowManager.updateConfig(windowConfig);

    // 设置全局快捷键
    windowManager.setupGlobalShortcut();

    windowManager.createWindow();

    this.app.on('hotkey:triggered', () => {
      LogFacade.channel('window').info('Hotkey triggered event received!');
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
