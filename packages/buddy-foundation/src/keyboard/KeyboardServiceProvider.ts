/**
 * 键盘服务提供者
 * 负责注册和启动键盘相关服务
 */
import { ServiceProvider } from '@coffic/cosy';
import { KeyboardContract } from './contracts/KeyboardContract.js';
import { KeyboardManager } from './KeyboardManager.js';
import { app } from 'electron';

export class KeyboardServiceProvider extends ServiceProvider {
    /**
     * 注册键盘服务
     */
    public register(): void {
        console.log('🚀 KeyboardServiceProvider register');

        // 注册键盘管理器实例
        const keyboardManager = new KeyboardManager();
        this.app.container().instance('keyboard', keyboardManager);
        this.app.container().alias('KeyboardManager', 'keyboard');

        // 在应用退出时清理快捷键
        app.on('will-quit', () => {
            keyboardManager.cleanup();
        });
    }

    /**
     * 启动键盘服务
     */
    public async boot(): Promise<void> {
        const keyboardManager = this.app.make<KeyboardContract>('keyboard');

        // macOS特定配置
        if (process.platform === 'darwin') {
            const result = await keyboardManager.setupCommandKeyListener();
            if (result.success == false) {
                console.warn('Command键双击监听器设置失败', {
                    error: result.error,
                });
            }
        }
    }
} 