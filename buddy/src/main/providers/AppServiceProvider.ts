/**
 * 应用服务提供者
 * 负责注册应用管理器相关的服务
 */
import { ServiceProvider } from '@coffic/electron-laravel-framework';
import { appManager } from '../managers/AppManager.js';

export class AppServiceProvider extends ServiceProvider {
    public register(): void {
        console.log('🚀 AppServiceProvider register');

        // 注册应用管理器实例
        this.app.container().instance('app.manager', appManager);

        // 设置别名
        this.app.container().alias('AppManager', 'app.manager');
    }

    public async boot(): Promise<void> {
        const manager = this.app.make<any>('app.manager');
        // 启动应用管理器
        if (typeof manager.start === 'function') {
            await manager.start();
        }
    }

    public async shutdown(): Promise<void> {
        const manager = this.app.make<any>('app.manager');
        // 如果有清理方法的话，通过应用退出事件自动处理
        // AppManager 已经在 app.on('will-quit') 中处理清理逻辑
        console.log('AppManager 清理由应用退出事件自动处理');
    }

    public provides(): string[] {
        return ['app.manager'];
    }
} 