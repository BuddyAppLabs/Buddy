/**
 * 键盘管理服务提供者
 * 负责注册键盘管理相关的服务
 */
import { ServiceProvider } from '@coffic/electron-laravel-framework';
import { KeyContract } from '../contracts/KeyContract.js';
import { KeyManager } from '../managers/KeyManager.js';

export class KeyServiceProvider extends ServiceProvider {
    /**
     * 注册键盘管理服务
     */
    public register(): void {
        console.log('🚀 KeyServiceProvider register');
        this.app.container().instance('key', new KeyManager());
        this.app.container().alias('KeyManager', 'key');
    }

    /**
     * 启动键盘管理服务
     * 设置全局键盘快捷键监听
     */
    public async boot(): Promise<void> {
        const keyManager = this.app.make<KeyContract>('key');

        // macOS特定配置
        if (process.platform === 'darwin') {
            const result = await keyManager.setupCommandKeyListener();
            if (result.success == false) {
                console.warn('Command键双击监听器设置失败', {
                    error: result.error,
                });
            }
        }
    }
} 