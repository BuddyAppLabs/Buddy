/**
 * 窗口管理器
 * 负责创建、管理主窗口以及处理窗口相关配置和事件
 */
import { shell, BrowserWindow, screen, globalShortcut } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import icon from '../../../resources/icon.png?asset';
import { appStateManager } from './StateManager.js';
import { BaseManager } from './BaseManager.js';
import { WindowConfig, WindowManagerContract } from '../../../../packages/buddy-foundation/src/window/contracts/WindowContract.js';

const verbose = false;

export class WindowManager extends BaseManager implements WindowManagerContract {
    private mainWindow: BrowserWindow | null = null;
    private config: WindowConfig;

    constructor(config: WindowConfig) {
        super({
            name: 'WindowManager',
            enableLogging: true,
            logLevel: 'info',
        });
        this.config = config;
    }

    /**
     * 获取主窗口实例
     */
    getMainWindow(): BrowserWindow | null {
        return this.mainWindow;
    }

    /**
     * 创建主窗口
     */
    createWindow(): BrowserWindow {
        console.log('🔧 createWindow', this.config);
        try {
            // 创建浏览器窗口
            this.mainWindow = new BrowserWindow({
                width: this.config.size.width,
                height: this.config.size.height,
                show: false,
                autoHideMenuBar: true,
                frame: this.config.showTrafficLights !== false,
                opacity: this.config.opacity,
                transparent: true,
                backgroundColor: '#00000000',
                ...(process.platform === 'linux' ? { icon } : {}),
                webPreferences: {
                    preload: join(__dirname, '../preload/app-preload.mjs'),
                    sandbox: false,
                    contextIsolation: true,
                    nodeIntegration: false,
                    devTools: true,
                    spellcheck: false,
                },
            });

            // 设置窗口事件处理
            this.setupWindowEvents();

            // 加载窗口内容
            this.loadWindowContent();

            // Spotlight模式下设置窗口失焦自动隐藏
            this.setupBlurHandler();

            return this.mainWindow;
        } catch (error) {
            throw new Error(this.handleError(error, '创建主窗口失败', true));
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
                this.mainWindow.webContents.openDevTools({
                    mode: this.config.debugToolbarPosition,
                });
            }
        });

        // 处理外部链接
        this.mainWindow.webContents.setWindowOpenHandler((details) => {
            console.debug('拦截外部链接打开请求', { url: details.url });
            shell.openExternal(details.url);
            return { action: 'deny' };
        });
    }

    /**
     * 加载窗口内容
     */
    private loadWindowContent(): void {
        if (!this.mainWindow) return;

        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
        } else {
            const htmlPath = join(__dirname, '../renderer/index.html');
            console.info('生产模式：加载本地HTML文件 -> ' + htmlPath);
            this.mainWindow.loadFile(htmlPath);
        }
    }

    /**
     * 设置窗口失焦处理
     */
    private setupBlurHandler(): void {
        if (!this.mainWindow) return;

        this.mainWindow.on('blur', () => {
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                this.handleWindowHide(true);
            }
        });
    }

    /**
     * 处理窗口隐藏
     * @param isBlur 是否是由失焦触发的隐藏
     */
    private handleWindowHide(isBlur: boolean = false): void {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

        // 使用标志记录最后一次显示的时间
        // @ts-ignore 忽略类型检查错误
        const lastShowTime = this.mainWindow.lastShowTime || 0;
        const now = Date.now();

        // @ts-ignore 忽略类型检查错误
        const justTriggered = this.mainWindow.justTriggered === true;

        // 如果是失焦触发的隐藏，且窗口刚刚显示，则忽略
        if (isBlur && (justTriggered || now - lastShowTime < 500)) {
            return;
        }

        // 清除被覆盖的应用信息
        appStateManager.setOverlaidApp(null);
        this.mainWindow.hide();
    }

    /**
     * 处理窗口显示
     */
    private async handleWindowShow(): Promise<void> {
        if (!this.mainWindow || this.mainWindow.isDestroyed()) return;

        if (verbose) {
            console.info('窗口当前不可见，执行显示操作');
        }

        // 更新当前活跃的应用信息
        if (process.platform === 'darwin') {
            appStateManager.updateActiveApp();
        }

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
        // @ts-ignore 忽略类型检查错误
        this.mainWindow.lastShowTime = Date.now();
        // 设置额外的标志，表示窗口刚刚被通过快捷键打开
        // @ts-ignore 忽略类型检查错误
        this.mainWindow.justTriggered = true;
        console.debug('设置窗口保护标志，防止立即失焦隐藏');

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

        if (verbose) {
            console.info('窗口配置为跟随桌面模式');
        }

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

        console.debug('跨桌面显示窗口：执行macOS特定优化');

        // 1. 先确保窗口不可见
        if (this.mainWindow.isVisible()) {
            console.debug('窗口已可见，先隐藏');
            this.mainWindow.hide();
        }

        // 2. 设置位置
        console.debug(`设置窗口位置 (${x}, ${y})`);
        this.mainWindow.setPosition(x, y);

        // 3. 使窗口在所有工作区可见，包括全屏应用
        console.debug('设置窗口在所有工作区可见，包括全屏应用');
        this.mainWindow.setVisibleOnAllWorkspaces(true, {
            visibleOnFullScreen: true,
        });

        // 4. 确保窗口是顶层窗口
        const originalAlwaysOnTop = this.mainWindow.isAlwaysOnTop();
        console.debug(`临时设置窗口置顶，原始状态: ${originalAlwaysOnTop}`);
        this.mainWindow.setAlwaysOnTop(true, 'screen-saver');

        // 5. 显示窗口
        console.debug('显示窗口');
        this.mainWindow.show();

        // 6. 确保窗口聚焦
        console.debug('聚焦窗口');
        this.mainWindow.focus();

        // 7. 还原到单桌面可见（重要：延迟执行这一步）
        await new Promise<void>((resolve) => {
            setTimeout(() => {
                if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                    console.debug('将窗口设置回当前工作区可见');
                    this.mainWindow.setVisibleOnAllWorkspaces(false);
                    // 还原原始的置顶状态
                    console.debug(
                        `还原窗口置顶状态: ${originalAlwaysOnTop || !!this.config.alwaysOnTop}`
                    );
                    this.mainWindow.setAlwaysOnTop(
                        originalAlwaysOnTop || !!this.config.alwaysOnTop,
                        this.config.alwaysOnTop ? 'pop-up-menu' : 'normal'
                    );

                    // 延迟500毫秒后重置justTriggered标志
                    setTimeout(() => {
                        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                            // @ts-ignore 忽略类型检查错误
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

        console.debug('非macOS平台跨桌面显示窗口');

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
                    // @ts-ignore 忽略类型检查错误
                    this.mainWindow.justTriggered = false;
                    console.debug('窗口触发保护期已结束');
                }
                resolve();
            }, 500);
        });
    }

    /**
     * 显示或隐藏主窗口
     */
    toggleMainWindow(): void {
        if (!this.mainWindow) {
            this.handleError(
                new Error('尝试切换窗口状态但没有主窗口实例'),
                '切换窗口状态失败'
            );
            return;
        }

        try {
            if (this.mainWindow.isVisible()) {
                this.handleWindowHide(false);
            } else {
                this.handleWindowShow();
            }
        } catch (error) {
            this.handleError(error, '切换窗口状态失败');
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

                if (verbose) {
                    console.info(`已成功注册全局快捷键: ${this.config.hotkey}`);
                }
            } else {
                console.debug('未启用Spotlight模式或未设置快捷键，跳过全局快捷键注册');
            }
        } catch (error) {
            this.handleError(error, '设置全局快捷键失败');
        }
    }

    /**
     * 清理资源
     */
    public cleanup(): void {
        try {
            console.info('WindowManager清理资源');

            // 取消注册所有快捷键
            console.debug('取消注册所有全局快捷键');
            globalShortcut.unregisterAll();

            // 关闭窗口（如果需要的话）
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                console.debug('关闭主窗口');
                this.mainWindow.close();
                this.mainWindow = null;
            }

            console.info('WindowManager资源清理完成');
        } catch (error) {
            this.handleError(error, 'WindowManager资源清理失败');
        }
    }
}

// 导出窗口管理器工厂函数
export function createWindowManager(config: WindowConfig): WindowManagerContract {
    return new WindowManager(config);
}
