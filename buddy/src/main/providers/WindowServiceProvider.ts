/**
 * 窗口服务提供者
 * 负责注册窗口管理相关的服务
 */
import { ServiceProvider } from '@coffic/cosy';
import { createWindowManager } from '../managers/WindowManager.js';
import { WindowConfig, WindowManagerContract } from '@coffic/buddy-foundation';

export class WindowServiceProvider extends ServiceProvider {
    /**
     * 注册窗口管理服务
     */
    public register(): void {
        // 注册窗口配置
        this.app.singleton('window.config', () => ({
            showTrafficLights: false,
            showDebugToolbar: process.env.NODE_ENV === 'development' && true,
            debugToolbarPosition: 'right',
            hotkey: 'Option+Space',
            size: {
                width: 1200,
                height: 600,
            },
            alwaysOnTop: true,
            opacity: 0.99,
        } as WindowConfig));

        // 注册窗口管理器
        this.app.container().instance('window.manager', createWindowManager(this.app.make<WindowConfig>('window.config')));
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