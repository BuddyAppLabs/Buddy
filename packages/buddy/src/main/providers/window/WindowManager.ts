import { shell, BrowserWindow, screen, globalShortcut, app } from 'electron';
import { EMOJI } from '../../constants.js';
import { is } from '@electron-toolkit/utils';
import { join } from 'path';
import { Application, ILogManager } from '@coffic/cosy-framework';
import { IWindowConfig, WindowMode } from './IWindowConfig.js';
import { IWindowManager } from './IWindowManager.js';

/**
 * 窗口管理器
 * 负责创建、管理主窗口以及处理窗口相关配置和事件
 * 支持两种窗口模式：
 * - compact: 精简模式（快捷键呼出，小窗口，失焦隐藏）
 * - full: 完整模式（Dock 点击，大窗口，常规行为）
 */
export class WindowManager implements IWindowManager {
  private mainWindow: BrowserWindow | null = null;
  private config: IWindowConfig;
  private logger: ILogManager;
  private app: Application;
  private currentMode: WindowMode = 'compact'; // 默认精简模式

  constructor(config: IWindowConfig, logger: ILogManager, app: Application) {
    this.config = this.normalizeConfig(config);
    this.logger = logger;
    this.app = app;
    this.currentMode = config.currentMode || 'compact';
  }

  /**
   * 标准化配置，确保向后兼容
   */
  private normalizeConfig(config: IWindowConfig): IWindowConfig {
    // 如果没有配置新的模式，使用旧的 size 配置作为默认值
    if (!config.compactMode && config.size) {
      config.compactMode = {
        width: config.size.width,
        height: config.size.height,
        hideOnBlur: true,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        opacity: 0.99,
      };
    }

    if (!config.fullMode && config.size) {
      config.fullMode = {
        width: Math.max(config.size.width, 1200),
        height: Math.max(config.size.height, 800),
        hideOnBlur: false,
        frame: true,
        transparent: false,
        alwaysOnTop: false,
        opacity: 1.0,
      };
    }

    // 设置默认值
    if (!config.compactMode) {
      config.compactMode = {
        width: 600,
        height: 400,
        hideOnBlur: true,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        opacity: 0.99,
      };
    }
    if (!config.fullMode) {
      config.fullMode = {
        width: 1200,
        height: 800,
        hideOnBlur: false,
        frame: true,
        transparent: false,
        alwaysOnTop: false,
        opacity: 1.0,
      };
    }

    return config;
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<IWindowConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // 如果窗口已经存在，应用新的配置
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      // 更新窗口大小
      if (newConfig.size) {
        this.mainWindow.setSize(newConfig.size.width, newConfig.size.height);
      }

      // 更新透明度
      if (newConfig.opacity !== undefined) {
        this.mainWindow.setOpacity(newConfig.opacity);
      }

      // 更新置顶状态
      if (newConfig.alwaysOnTop !== undefined) {
        this.mainWindow.setAlwaysOnTop(newConfig.alwaysOnTop);
      }

      // 更新窗口框架
      if (newConfig.showTrafficLights !== undefined) {
        // 注意：框架的更改可能需要重新创建窗口
        console.warn('Window frame changes require window recreation');
      }
    }
  }

  /**
   * 获取主窗口实例
   */
  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  /**
   * 获取所有窗口
   */
  getAllWindows(): BrowserWindow[] {
    return BrowserWindow.getAllWindows();
  }

  /**
   * 获取当前窗口模式
   */
  getCurrentMode(): WindowMode {
    return this.currentMode;
  }

  /**
   * 切换窗口模式
   * 注意：由于 frame 和 transparent 属性无法动态修改，需要重新创建窗口
   */
  public switchMode(mode: WindowMode): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    // 如果模式相同，只需要显示窗口
    if (this.currentMode === mode) {
      this.logger.info(`[WindowManager] 已经是 ${mode} 模式，无需切换`);
      return;
    }

    this.logger.info(
      `[WindowManager] 切换窗口模式: ${this.currentMode} -> ${mode}`
    );

    const oldMode = this.currentMode;
    this.currentMode = mode;
    const modeConfig =
      mode === 'compact' ? this.config.compactMode : this.config.fullMode;

    // 保存当前 URL
    const currentURL = this.mainWindow.webContents.getURL();

    // 关闭旧窗口
    const oldWindow = this.mainWindow;

    // 创建新窗口
    this.mainWindow = new BrowserWindow({
      width: modeConfig.width,
      height: modeConfig.height,
      show: false,
      autoHideMenuBar: true,
      frame: modeConfig.frame, // 根据模式显示/隐藏边框
      opacity: modeConfig.opacity,
      transparent: modeConfig.transparent, // 根据模式设置透明
      backgroundColor: modeConfig.transparent ? '#00000000' : '#ffffff',
      webPreferences: {
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false,
        devTools: true,
        spellcheck: false,
        preload: join(app.getAppPath(), 'out/preload/framework-preload.mjs'),
      },
    });

    // 设置置顶状态
    this.mainWindow.setAlwaysOnTop(modeConfig.alwaysOnTop);

    // 设置窗口事件
    this.setupWindowEvents();

    // 加载之前的 URL
    this.mainWindow.loadURL(currentURL);

    // 等待新窗口加载完成
    this.mainWindow.once('ready-to-show', () => {
      if (!this.mainWindow) return;

      // 如果是完整模式，居中显示
      if (mode === 'full') {
        this.mainWindow.center();
      }

      // 显示新窗口
      this.mainWindow.show();

      // 通知渲染进程模式变化
      this.mainWindow.webContents.send('window-mode-changed', mode);

      // 关闭旧窗口
      if (oldWindow && !oldWindow.isDestroyed()) {
        oldWindow.close();
      }

      this.logger.info(`[WindowManager] 窗口模式切换完成: ${mode}`);
    });

    // 重新设置失焦处理
    this.setupBlurHandler();
  }

  /**
   * 显示完整窗口（Dock 点击触发）
   */
  public showFullWindow(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      this.logger.warn('[WindowManager] 窗口不存在，无法显示完整窗口');
      return;
    }

    this.logger.info('[WindowManager] 显示完整窗口');

    // 如果当前是精简模式，需要切换到完整模式
    if (this.currentMode === 'compact') {
      this.switchMode('full');
      // switchMode 会自动显示窗口
    } else {
      // 已经是完整模式，只需要显示并聚焦
      if (!this.mainWindow.isVisible()) {
        this.mainWindow.show();
      }

      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }

      this.mainWindow.focus();
    }
  }

  /**
   * 创建主窗口
   */
  createWindow(): BrowserWindow {
    try {
      // 根据当前模式获取窗口尺寸
      const modeConfig =
        this.currentMode === 'compact'
          ? this.config.compactMode
          : this.config.fullMode;

      // 创建浏览器窗口
      this.mainWindow = new BrowserWindow({
        width: modeConfig.width,
        height: modeConfig.height,
        show: false,
        autoHideMenuBar: true,
        frame: this.config.showTrafficLights !== false,
        opacity: this.config.opacity,
        transparent: true,
        backgroundColor: '#00000000',
        webPreferences: {
          sandbox: false,
          contextIsolation: true,
          nodeIntegration: false,
          devTools: true,
          spellcheck: false,
          preload: join(app.getAppPath(), 'out/preload/framework-preload.mjs'),
        },
      });

      // 设置窗口事件处理
      this.setupWindowEvents();

      // 加载窗口内容
      this.loadWindowContent();

      // 设置窗口失焦处理（根据模式）
      this.setupBlurHandler();

      return this.mainWindow;
    } catch (error) {
      throw new Error('创建主窗口失败: ' + error);
    }
  }

  /**
   * 设置窗口事件
   */
  private setupWindowEvents(): void {
    if (!this.mainWindow) return;

    // 窗口加载完成后显示
    this.mainWindow.on('ready-to-show', () => {
      if (this.config.showDebugToolbar && this.mainWindow) {
        this.mainWindow.webContents.openDevTools();
      }
    });

    // 处理外部链接 - window.open()
    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      console.debug('拦截外部链接打开请求 (window.open)', { url: details.url });
      shell.openExternal(details.url);
      return { action: 'deny' };
    });

    // 处理导航事件 - <a> 标签点击
    this.mainWindow.webContents.on('will-navigate', (event, url) => {
      // 如果是外部链接（不是应用内部路由），在外部浏览器打开
      if (!url.startsWith('file://') && !url.startsWith('devtools://')) {
        console.debug('拦截导航请求 (a标签)', { url });
        event.preventDefault();
        shell.openExternal(url);
      }
    });

    // 处理新窗口导航事件
    this.mainWindow.webContents.on('did-create-window', (newWindow) => {
      newWindow.webContents.on('will-navigate', (event, url) => {
        if (!url.startsWith('file://') && !url.startsWith('devtools://')) {
          console.debug('拦截新窗口导航请求', { url });
          event.preventDefault();
          shell.openExternal(url);
        }
      });
    });
  }

  /**
   * 加载窗口内容
   */
  private loadWindowContent(): void {
    this.logger.channel().info(`${EMOJI} [WindowManager] 加载窗口内容`);

    if (!this.mainWindow) return;

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.logger
        .channel()
        .info(
          `${EMOJI} [WindowManager] 开发模式，加载 -> ${process.env['ELECTRON_RENDERER_URL']}`
        );

      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
      // 在生产环境中，使用 app.getAppPath() 获取应用根目录
      const rendererPath = join(app.getAppPath(), 'out/renderer/index.html');

      this.logger
        .channel()
        .info(
          `${EMOJI} [WindowManager] 生产模式：加载本地HTML文件 -> ${rendererPath}`
        );

      this.mainWindow.loadFile(rendererPath);
    }

    // 当内容加载完成后显示窗口
    this.mainWindow.once('ready-to-show', () => {
      this.logger
        .channel()
        .info(`${EMOJI} [WindowManager] 窗口内容加载完成，显示窗口`);

      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.show();
      }
    });
  }

  /**
   * 设置窗口失焦处理（根据当前模式）
   */
  private setupBlurHandler(): void {
    if (!this.mainWindow) return;

    // 移除旧的监听器
    this.mainWindow.removeAllListeners('blur');

    const modeConfig =
      this.currentMode === 'compact'
        ? this.config.compactMode
        : this.config.fullMode;

    // 只有在配置了 hideOnBlur 时才添加失焦隐藏
    if (modeConfig.hideOnBlur) {
      this.mainWindow.on('blur', () => {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.handleWindowHide(true);
        }
      });
      this.logger.info(
        `[WindowManager] 已启用失焦隐藏 (${this.currentMode} 模式)`
      );
    } else {
      this.logger.info(
        `[WindowManager] 已禁用失焦隐藏 (${this.currentMode} 模式)`
      );
    }
  }

  /**
   * 处理窗口隐藏
   * @param isBlur 是否是由失焦触发的隐藏
   */
  private handleWindowHide(isBlur: boolean = false): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    // 使用标志记录最后一次显示的时间
    // @ts-expect-error-error
    const lastShowTime = this.mainWindow.lastShowTime || 0;
    const now = Date.now();

    // @ts-expect-error-error
    const justTriggered = this.mainWindow.justTriggered === true;

    // 如果是失焦触发的隐藏，且窗口刚刚显示，则忽略
    if (isBlur && (justTriggered || now - lastShowTime < 500)) {
      return;
    }

    this.mainWindow.hide();
  }

  /**
   * 处理窗口显示
   */
  private async handleWindowShow(): Promise<void> {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

    this.logger.info('[WindowManager] 显示窗口');

    this.app.emit('window:show');

    // 获取当前鼠标所在屏幕的信息
    const cursorPoint = screen.getCursorScreenPoint();
    const currentDisplay = screen.getDisplayNearestPoint(cursorPoint);

    // 计算窗口在当前显示器上的居中位置
    const windowWidth = this.config.size
      ? this.config.size.width
      : this.mainWindow.getBounds().width;
    const windowHeight = this.config.size
      ? this.config.size.height
      : this.mainWindow.getBounds().height;

    const x = Math.floor(
      currentDisplay.workArea.x +
        (currentDisplay.workArea.width - windowWidth) / 2
    );
    const y = Math.floor(
      currentDisplay.workArea.y +
        (currentDisplay.workArea.height - windowHeight) / 2
    );

    // 记录显示时间戳
    // @ts-expect-error-error
    this.mainWindow.lastShowTime = Date.now();
    // 设置额外的标志，表示窗口刚刚被通过快捷键打开
    // @ts-expect-error-error
    this.mainWindow.justTriggered = true;

    // 窗口跟随桌面
    await this.showWindowWithDesktopFollow(x, y);
  }

  /**
   * 使用跟随桌面模式显示窗口
   */
  private async showWindowWithDesktopFollow(
    x: number,
    y: number
  ): Promise<void> {
    if (!this.mainWindow) return;

    if (process.platform === 'darwin') {
      await this.showWindowMacOS(x, y);
    } else {
      await this.showWindowOtherPlatforms(x, y);
    }
  }

  /**
   * macOS平台特定的窗口显示逻辑
   */
  private async showWindowMacOS(x: number, y: number): Promise<void> {
    if (!this.mainWindow) return;

    // 1. 先确保窗口不可见
    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide();
    }

    // 2. 设置位置
    this.mainWindow.setPosition(x, y);

    // 3. 使窗口在所有工作区可见，包括全屏应用
    this.mainWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
    });

    // 4. 确保窗口是顶层窗口
    const originalAlwaysOnTop = this.mainWindow.isAlwaysOnTop();
    this.mainWindow.setAlwaysOnTop(true, 'screen-saver');

    // 5. 显示窗口
    this.mainWindow.show();

    // 6. 确保窗口聚焦
    this.mainWindow.focus();

    // 7. 还原到单桌面可见（重要：延迟执行这一步）
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.setVisibleOnAllWorkspaces(false);
          // 还原原始的置顶状态
          this.mainWindow.setAlwaysOnTop(
            originalAlwaysOnTop || !!this.config.alwaysOnTop,
            this.config.alwaysOnTop ? 'pop-up-menu' : 'normal'
          );

          // 延迟500毫秒后重置justTriggered标志
          setTimeout(() => {
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
              // @ts-expect-error-error
              this.mainWindow.justTriggered = false;
            }
          }, 500);
        }
        resolve();
      }, 300);
    });
  }

  /**
   * 其他平台的窗口显示逻辑
   */
  private async showWindowOtherPlatforms(x: number, y: number): Promise<void> {
    if (!this.mainWindow) return;

    // 设置窗口位置
    this.mainWindow.setPosition(x, y);

    // 确保在所有工作区可见，包括全屏应用
    this.mainWindow.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
    });

    // 临时设置顶层状态
    const originalAlwaysOnTop = this.mainWindow.isAlwaysOnTop();
    this.mainWindow.setAlwaysOnTop(true);

    // 显示并聚焦窗口
    this.mainWindow.show();
    this.mainWindow.focus();

    // 还原设置
    this.mainWindow.setVisibleOnAllWorkspaces(false);
    this.mainWindow.setAlwaysOnTop(
      originalAlwaysOnTop || !!this.config.alwaysOnTop
    );

    // 延迟500毫秒后重置justTriggered标志
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          // @ts-expect-error-error
          this.mainWindow.justTriggered = false;
        }
        resolve();
      }, 500);
    });
  }

  /**
   * 显示或隐藏主窗口（快捷键触发，使用精简模式）
   */
  toggleMainWindow(): void {
    if (!this.mainWindow) {
      console.error('尝试切换窗口状态但没有主窗口实例');
      return;
    }

    try {
      if (this.mainWindow.isVisible()) {
        this.handleWindowHide(false);
      } else {
        // 快捷键触发时，切换到精简模式
        this.switchMode('compact');
        this.handleWindowShow();
      }
    } catch (error) {
      console.error('切换窗口状态失败: ', error);
    }
  }

  /**
   * 设置全局快捷键
   */
  setupGlobalShortcut(): void {
    try {
      globalShortcut.unregisterAll();

      // 如果启用了Spotlight模式，注册全局快捷键
      if (this.config.hotkey) {
        if (
          !globalShortcut.register(
            this.config.hotkey,
            this.toggleMainWindow.bind(this)
          )
        ) {
          throw new Error(`注册快捷键失败: ${this.config.hotkey}`);
        }
      }
    } catch (error) {
      console.error('设置全局快捷键失败: ', error);
    }
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    try {
      // 取消注册所有快捷键
      globalShortcut.unregisterAll();

      // 关闭窗口（如果需要的话）
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.close();
        this.mainWindow = null;
      }
    } catch (error) {
      console.error('WindowManager资源清理失败: ', error);
    }
  }
}

/**
 * 创建窗口管理器实例
 */
export function createWindowManager(
  config: IWindowConfig,
  logger: ILogManager,
  app: Application
): IWindowManager {
  return new WindowManager(config, logger, app);
}
