import { ServiceProvider } from '@coffic/cosy-framework';
import { Config } from '@coffic/cosy-framework';
import { createWindowManager } from './WindowManager.js';
import { WindowConfig, WindowManagerContract } from '../contracts/window.js';

export class WindowServiceProvider extends ServiceProvider {
    /**
     * 注册窗口管理服务
     */
    public register(): void {
        // 注册默认窗口配置
        Config.set('window', {
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
        } as WindowConfig);

        // 注册窗口管理器
        this.app.container().instance(
            'window.manager',
            createWindowManager(Config.get<WindowConfig>('window')!)
        );

        this.app.container().alias('WindowManager', 'window.manager');
    }

    /**
     * 启动窗口管理服务
     */
    public async boot(): Promise<void> {
        // 获取窗口管理器实例
        const windowManager = this.app.make<WindowManagerContract>('window.manager');

        // 设置全局快捷键
        windowManager.setupGlobalShortcut();
    }
} 