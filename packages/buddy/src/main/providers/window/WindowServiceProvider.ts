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
          // 精简模式配置（快捷键呼出）- 悬浮窗口
          compactMode: {
            width: 800,
            height: 500,
            hideOnBlur: true, // 失焦隐藏
            frame: false, // 无边框
            transparent: true, // 透明背景
            alwaysOnTop: true, // 置顶
            opacity: 0.99,
          },
          // 完整模式配置（Dock 点击）- 传统窗口
          fullMode: {
            width: 1200,
            height: 800,
            hideOnBlur: false, // 不自动隐藏
            frame: true, // 显示红绿灯
            transparent: false, // 不透明
            alwaysOnTop: false, // 不置顶
            opacity: 1.0,
          },
          alwaysOnTop: true,
          opacity: 0.99,
          currentMode: 'compact', // 默认精简模式
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
      // 精简模式配置（快捷键呼出）- 悬浮窗口
      compactMode: {
        width: 800,
        height: 500,
        hideOnBlur: true, // 失焦隐藏
        frame: false, // 无边框
        transparent: true, // 透明背景
        alwaysOnTop: true, // 置顶
        opacity: 0.99,
      },
      // 完整模式配置（Dock 点击）- 传统窗口
      fullMode: {
        width: 1200,
        height: 800,
        hideOnBlur: false, // 不自动隐藏
        frame: true, // 显示红绿灯
        transparent: false, // 不透明
        alwaysOnTop: false, // 不置顶
        opacity: 1.0,
      },
      alwaysOnTop: true,
      opacity: 0.99,
      currentMode: 'compact', // 默认精简模式
    } as IWindowConfig;

    // 设置全局配置
    Config.set('window', windowConfig);

    // 获取窗口管理器实例并更新配置
    const windowManager = this.app.make<IWindowManager>('window.manager');
    windowManager.updateConfig(windowConfig);

    // 设置全局快捷键
    windowManager.setupGlobalShortcut();

    // 窗口创建由AppManager统一管理，这里不再创建
    // windowManager.createWindow();

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
